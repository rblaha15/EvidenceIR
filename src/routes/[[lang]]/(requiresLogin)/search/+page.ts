import type { EntryGenerator, PageLoad } from './$types';
import { langEntryGenerator } from '../../helpers';
import db from '$lib/client/data';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, irLabel, irName, type SPID, spName } from '$lib/helpers/ir';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { derived, type Readable, readable } from 'svelte/store';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;

export type Installation_PublicServiceProtocol = {
    t: 'IR',
    id: IRID,
    label: string,
    name: string,
} | {
    t: 'SP',
    id: SPID,
    label: string,
    name: string,
}

export const load: PageLoad = async () => {
    if (!browser) return { items: readable([]) };
    await checkAuth();
    const irs = await db.getAllIRsAsStore();
    const installations = derived(irs, $irs => $irs
        .map(ir => ({
            t: 'IR',
            id: extractIRIDFromRawData(ir.evidence),
            name: irName(ir.evidence.ir),
            label: irLabel(ir.evidence),
        } satisfies Installation_PublicServiceProtocol))
        .filter(i => i.id)
        .toSorted((a, b) => a.id.localeCompare(b.id)));

    let protocols: Readable<Installation_PublicServiceProtocol[]>;

    if (!await checkRegulusOrAdmin()) protocols = readable([]);
    else {
        const sps = await db.getAllIndependentProtocolsAsStore();
        protocols = derived(sps, $sps => $sps
            .map(sp => ({
                t: 'SP',
                id: extractSPIDFromRawData(sp.zasah),
                name: spName(sp.zasah),
                label: irLabel(sp),
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.id)
            .toSorted((a, b) => -a.id.localeCompare(b.id)));
    }

    return {
        items: derived(
            [installations, protocols],
            ([$installations, $protocols]) =>
                [...$installations, ...$protocols],
        ),
    };
};