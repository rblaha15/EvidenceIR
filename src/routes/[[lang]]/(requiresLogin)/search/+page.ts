import type { EntryGenerator, PageLoad } from './$types';
import { langEntryGenerator } from '../../helpers';
import db from '$lib/client/data';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, irLabel, irName, type SPID, spName } from '$lib/helpers/ir';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';

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
    if (!browser) return { items: [] }
    await checkAuth()
    const irs = await db.getAllIRs();
    const installations = irs
        .map(ir => ({
            t: 'IR',
            id: extractIRIDFromRawData(ir.evidence),
            name: irName(ir.evidence.ir),
            label: irLabel(ir.evidence),
        } satisfies Installation_PublicServiceProtocol))
        .filter(i => i.id)
        .toSorted((a, b) => a.id.localeCompare(b.id));

    let protocols: Installation_PublicServiceProtocol[];

    if (!await checkRegulusOrAdmin()) protocols = [];
    else {
        const sps = await db.getAllIndependentProtocols();
        protocols = sps
            .map(sp => ({
                t: 'SP',
                id: extractSPIDFromRawData(sp.zasah),
                name: spName(sp.zasah),
                label: irLabel(sp),
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.id)
            .toSorted((a, b) => -a.id.localeCompare(b.id));
    }

    return {
        items: [
            ...installations,
            ...protocols,
        ],
    };
};