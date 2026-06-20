import { getIsLoggedIn } from '$lib/client/auth';
import type { EntryGenerator, PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { startTechniciansListening, startUsersListening } from '$lib/client/realtime';
import { derived, type Readable, readable } from 'svelte/store';
import { waitUntil } from '$lib/helpers/stores';
import type { IRID, NSPID } from '$lib/helpers/ir';
import type { IR, NSP } from '$lib/data';
import { extractIDs, langEntryGenerator } from '$lib/helpers/paths';
import { getDataAsStore } from '$lib/helpers/getData';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: null, nspids: [], ir: readable(null), nsps: readable([]) };
    const id = extractIDs(url);
    if (!id.irid && !id.nspids) error(400, { message: 'At least one of irid or spid bust be provided!' });

    if (!await getIsLoggedIn()) return error(401);
    await startTechniciansListening();
    await startUsersListening();

    const data = getDataAsStore(id);

    await waitUntil(data.ir, p => p != 'loading')
    await waitUntil(data.nsps, p => p != 'loading')

    return {
        ...data,
        nsps: derived(data.nsps, (s, set) => { if (s != 'loading') set(s) }),
        ir: derived(data.ir, (i, set) => { if (i != 'loading') set(i) }),
    } satisfies {
        irid: IRID | null, nspids: NSPID[],
        ir: Readable<IR | null>, nsps: Readable<NSP[]>,
    };
};

export const prerender = true;