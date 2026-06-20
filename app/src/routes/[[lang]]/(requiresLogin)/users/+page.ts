import { browser } from '$app/environment';
import { getIsLoggedIn, getIsRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { startUsersListening } from '$lib/client/realtime';
import { type IR } from '$lib/data';
import { getStoreIR } from '$lib/client/incrementalUpdates';
import { waitUntil } from '$lib/helpers/stores';
import type { Readable } from 'svelte/store';
import { extractIDs, langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: undefined, ir: undefined };

    if (!await getIsLoggedIn()) error(401);
    if (!await getIsRegulusOrAdmin()) error(401);

    const id = extractIDs(url);
    if (!id.irid) error(400, { message: 'irid must be provided!' });

    await startUsersListening()

    const store = getStoreIR(id.irid);

    await waitUntil(store, p => p != 'loading')

    return { irid: id.irid, ir: store as Readable<IR | undefined> };
};

export const prerender = true;