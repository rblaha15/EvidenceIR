import type { EntryGenerator, PageLoad } from './$types';
import { langEntryGenerator } from '../../helpers';
import db from '$lib/data';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, irLabel, irName, type SPID, spName } from '$lib/helpers/ir';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { derived, readable } from 'svelte/store';
import { error } from '@sveltejs/kit';
import '$lib/extensions';
import { getTranslations } from '$lib/translations';
import { waitUntil } from '$lib/helpers/stores';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;

export type Installation_PublicServiceProtocol = {
    t: 'IR',
    id: IRID,
    label: string,
    name: string,
    sps: string[],
} | {
    t: 'SP',
    id: SPID[],
    label: string,
    name: string,
    sps: [],
}

export const load: PageLoad = async ({ parent }) => {
    if (!browser) return { items: readable([]) };
    if (!await checkAuth()) error(401);

    const data = await parent();
    const ts = getTranslations(data.languageCode).search;

    const installations = derived(
        db.getAllIRsAsStore(),
        $irs => $irs == 'loading' ? null : $irs
            .map(ir => ({
                t: 'IR',
                id: extractIRIDFromRawData(ir.evidence),
                name: irName(ir.evidence.ir),
                label: irLabel(ir.evidence),
                sps: ir.installationProtocols.map(p => spName(p.zasah)),
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.id),
    );


    const protocols = !await checkRegulusOrAdmin()
        ? readable([])
        : derived(
            db.getAllIndependentProtocolsAsStore(),
            $sps => $sps == 'loading' ? null : Object.entries($sps
                .groupBy(sp => irLabel(sp)))
                .map(([label, sps]) => ({
                    t: 'SP',
                    id: sps.map(sp => extractSPIDFromRawData(sp.zasah)),
                    name: sps.length == 1 ? spName(sps[0].zasah) : ts.nProtocols(sps.length, sps.map(sp => sp.zasah.inicialy.trim()).distinct().join(', ')),
                    label: label,
                    sps: [],
                } satisfies Installation_PublicServiceProtocol)),
        );

    await waitUntil(installations, i => i != null)
    await waitUntil(protocols, p => p != null)

    return {
        items: derived(
            [installations, protocols],
            ([$installations, $protocols]) =>
                [...$installations ?? [], ...$protocols ?? []]
                    .toSorted((a, b) => a.label.localeCompare(b.label)),
        ),
    };
};