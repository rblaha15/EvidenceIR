import { browser } from '$app/environment';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import { extractIDs, langEntryGenerator } from '../../helpers';
import type { EntryGenerator, PageLoad } from './$types';
import { startUsersListening } from '$lib/client/realtime';
import { type IR } from '$lib/data';
import { getStoreIR } from '$lib/client/incrementalUpdates';
import { waitUntil } from '$lib/helpers/stores';
import type { Readable } from 'svelte/store';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: undefined, ir: undefined };

    if (!await checkAuth()) error(401);
    if (!await checkRegulusOrAdmin()) error(401);

    const id = extractIDs(url);
    if (!id.irid) error(400, { message: 'irid must be provided!' });

    await startUsersListening()

    const store = getStoreIR(id.irid);

    await waitUntil(store, p => p != 'loading')

    return { irid: id.irid, ir: store as Readable<IR | undefined> };
};

export const prerender = true;