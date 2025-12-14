import type { EntryGenerator, PageLoad } from './$types';
import { langEntryGenerator } from '../../helpers';
import {
    extractIRIDFromRawData,
    extractSPIDFromRawData,
    type IRID,
    irLabel,
    irName,
    isSPDeleted,
    type SPID,
    spName,
} from '$lib/helpers/ir';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { derived, readable } from 'svelte/store';
import { error } from '@sveltejs/kit';
import '$lib/extensions';
import { getTranslations } from '$lib/translations';
import { waitUntil } from '$lib/helpers/stores';
import { getAllIndependentProtocols, getAllIRs } from '$lib/client/incrementalUpdates';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;

export type Installation_PublicServiceProtocol = {
    t: 'IR',
    id: IRID,
    label: string,
    name: string,
    sps: string[],
    draft: boolean,
} | {
    t: 'SP',
    id: SPID[],
    label: string,
    name: string,
    sps: [],
    draft: boolean,
}

export const load: PageLoad = async ({ parent }) => {
    if (!browser) return { items: readable([]) };
    if (!await checkAuth()) error(401);

    const data = await parent();
    const ts = getTranslations(data.languageCode).search;

    const installations = derived(
        await getAllIRs(),
        $irs => $irs
            .filter(ir => !ir.deleted)
            .map(ir => ({
                t: 'IR',
                id: extractIRIDFromRawData(ir.evidence),
                name: irName(ir.evidence.ir),
                label: irLabel(ir.evidence),
                sps: ir.installationProtocols.map(p => spName(p.zasah)),
                draft: ir.isDraft,
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.id),
    );


    const protocols = !await checkRegulusOrAdmin()
        ? readable([])
        : derived(
            await getAllIndependentProtocols(),
            $sps => Object.entries($sps
                .mapNotUndefined(sp => isSPDeleted(sp) ? undefined : sp)
                .groupBy(sp => irLabel(sp)))
                .map(([label, sps]) => ({
                    t: 'SP',
                    id: sps.map(sp => extractSPIDFromRawData(sp.zasah)),
                    name: sps.length == 1 ? spName(sps[0].zasah) : ts.nProtocols(sps.length, sps.map(sp => sp.zasah.inicialy.trim()).distinct().join(', ')),
                    label: label,
                    sps: [],
                    draft: false,
                } satisfies Installation_PublicServiceProtocol)),
        );

    await waitUntil(installations, i => i != null)
    await waitUntil(protocols, p => p != null)

    return {
        items: derived(
            [installations, protocols],
            ([$installations, $protocols]) =>
                [...$installations ?? [], ...$protocols ?? []]
                    .toSorted((a, b) => a.label.localeCompare(b.label))
                    .toSorted((a, b) => (b.draft ? 1 : 0) - (a.draft ? 1 : 0)),
        ),
    };
};