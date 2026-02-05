import type { EntryGenerator, PageLoad } from './$types';
import {
    extractIRIDFromRawData,
    extractSPIDFromRawData,
    type IRID,
    irLabel,
    irName,
    type SPID,
    spName,
} from '$lib/helpers/ir';
import { checkAdmin, checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { derived, readable } from 'svelte/store';
import { error } from '@sveltejs/kit';
import '$lib/extensions';
import { getTranslations } from '$lib/translations';
import { waitUntil } from '$lib/helpers/stores';
import { getAllIndependentProtocols, getAllIRs } from '$lib/client/incrementalUpdates';
import { langEntryGenerator } from '$lib/helpers/paths';
import type { ExistingNSP, IR, NSP } from '$lib/data';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { Raw } from '$lib/forms/Form';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;

export type Installation_PublicServiceProtocol = {
    t: 'IR',
    id: IRID,
    label: string,
    name: string,
    sps: string[],
    draft: boolean,
    deleted: boolean,
} | {
    t: 'SP',
    id: SPID[],
    label: string,
    name: string,
    sps: [],
    draft: boolean,
    deleted: boolean,
}

export const load: PageLoad = async ({ parent }) => {
    if (!browser) return { items: readable([]) };
    if (!await checkAuth()) error(401);

    const data = await parent();
    const ts = getTranslations(data.languageCode).search;

    const installations = derived(
        await getAllIRs(),
        $irs => $irs == 'loading' ? null : $irs
            .filter(ir => checkAdmin() || !ir.deleted)
            .map(ir => ({
                t: 'IR',
                id: ir.meta.id,
                name: irName(ir.IN.ir),
                label: irLabel(ir.IN),
                sps: ir.SPs.map(p => spName(p.zasah)),
                draft: ir.isDraft,
                deleted: ir.deleted,
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.id),
    );


    const protocols = !await checkRegulusOrAdmin()
        ? readable([])
        : derived(
            await getAllIndependentProtocols(),
            $sps => $sps == 'loading' ? null : Object.entries($sps
                .mapNotUndefined(sp => !checkAdmin() && sp.deleted ? undefined : sp)
                .groupBy(sp => irLabel(sp.NSP)))
                .map(([label, sps]) => ({
                    t: 'SP',
                    id: sps.map(sp => sp.meta.id),
                    name: sps.length == 1 ? spName(sps[0].NSP.zasah) : ts.nProtocols(sps.length, sps.map(sp => sp.NSP.zasah.inicialy.trim()).distinct().join(', ')),
                    label: label,
                    sps: [],
                    draft: false,
                    deleted: sps.every(sp => sp.deleted),
                } satisfies Installation_PublicServiceProtocol)),
        );

    await waitUntil(installations, i => i != null)
    await waitUntil(protocols, p => p != null)

    return {
        items: derived(
            [installations, protocols],
            ([$installations, $protocols]) =>
                [...$installations ?? [], ...$protocols ?? []]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .sort((a, b) =>
                        (b.deleted ? -1 : b.draft ? 1 : 0) - (a.deleted ? -1 : a.draft ? 1 : 0)
                    ),
        ),
    };
};