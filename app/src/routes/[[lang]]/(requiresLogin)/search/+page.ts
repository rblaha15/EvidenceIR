import type { EntryGenerator, PageLoad } from './$types';
import { type IRID, irLabel, irName, type SPID, spName } from '$lib/helpers/ir';
import { checkAdmin, checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { derived, readable } from 'svelte/store';
import { error } from '@sveltejs/kit';
import '$lib/extensions';
import { getTranslations } from '$lib/translations';
import { waitUntil } from '$lib/helpers/stores';
import { getAllIRs, getAllNSPs, type Results } from '$lib/client/incrementalUpdates';
import { langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;

export type IR_NSP = {
    t: 'IR',
    id: IRID,
    label: string,
    name: string,
    sps: string[],
    draft: boolean,
    deleted: boolean,
} | {
    t: 'NSP',
    id: SPID[],
    label: string,
    name: string,
    sps: [],
    draft: boolean,
    deleted: boolean,
}

export const load: PageLoad = async ({ parent }) => {
    if (!browser) return {
        data: readable({ items: [] as IR_NSP[], status: 'loaded' as 'loaded' | 'loadingOnline' }),
    };
    if (!await checkAuth()) error(401);

    const data = await parent();
    const ts = getTranslations(data.languageCode).search;

    const irs = derived(getAllIRs(), $irs => ({
        status: $irs.status, data: $irs.data
            .filter(ir => Array.isArray(it.SPs) && (checkAdmin() || !ir.deleted))
            .map(ir => ({
                t: 'IR',
                id: ir.meta.id,
                name: irName(ir.IN.ir),
                label: irLabel(ir.IN),
                sps: ir.SPs.map(p => spName(p.zasah)),
                draft: ir.isDraft,
                deleted: ir.deleted,
            } satisfies IR_NSP))
            .filter(i => i.id),
    }));


    const nsps = derived(
        await checkRegulusOrAdmin() ? getAllNSPs()
            : readable({ status: 'loaded', data: [] } as Results<'NSP'>),
        $sps => ({
            status: $sps.status, data: $sps.data
                .mapNotUndefined(sp => !checkAdmin() && sp.deleted ? undefined : sp)
                .groupBy(sp => irLabel(sp.NSP))
                .entries()
                .map(([label, sps]) => ({
                    t: 'NSP',
                    id: sps.map(sp => sp.meta.id),
                    name: sps.length == 1 ? spName(sps[0].NSP.zasah) : ts.nProtocols(sps.length, sps.map(sp => sp.NSP.zasah.inicialy.trim()).distinct().join(', ')),
                    label: label,
                    sps: [],
                    draft: false,
                    deleted: sps.every(sp => sp.deleted),
                } satisfies IR_NSP)),
        }),
    );

    await waitUntil(irs, i => i.status != 'loading');
    await waitUntil(nsps, p => p.status != 'loading');

    const maxStatus = (a: 'loading' | 'loadingOnline' | 'loaded', b: 'loading' | 'loadingOnline' | 'loaded') =>
        a == 'loading' || b == 'loading' ? 'loading' as const
            : a == 'loadingOnline' || b == 'loadingOnline' ? 'loadingOnline' as const
                : 'loaded' as const;

    return {
        data: derived([irs, nsps], ([$irs, $nsps]) => ({
            status: maxStatus($irs.status, $nsps.status),
            items: [...$irs.data, ...$nsps.data]
                .sort((a, b) => a.label.localeCompare(b.label))
                .sort((a, b) =>
                    (b.deleted ? -1 : b.draft ? 1 : 0) - (a.deleted ? -1 : a.draft ? 1 : 0),
                ),
        })),
    };
};