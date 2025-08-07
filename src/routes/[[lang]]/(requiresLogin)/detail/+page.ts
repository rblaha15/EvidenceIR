import type { EntryGenerator, PageLoad } from './$types';
import { extractIDs, getDataAsStore, langEntryGenerator } from '../../helpers';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { checkAuth } from '$lib/client/auth';
import { startTechniciansListening } from '$lib/client/realtime';
import { readable } from 'svelte/store';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: null, spids: [], ir: undefined, sps: readable([]) };
    const id = extractIDs(url);
    if (!id.irid && !id.spids) error(400, { message: 'At least one of irid or spid bust be provided!' });

    await checkAuth();
    await startTechniciansListening();

    return getDataAsStore(id);
};

export const prerender = true;