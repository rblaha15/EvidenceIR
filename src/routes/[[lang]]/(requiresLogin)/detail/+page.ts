import type { EntryGenerator, PageLoad } from './$types';
import { extractIDs, getDataAsStore, langEntryGenerator } from '../../helpers';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { checkAuth } from '$lib/client/auth';
import { startTechniciansListening } from '$lib/client/realtime';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: null, spid: null, ir: undefined, sp: undefined };
    const id = extractIDs(url);
    if (!id.irid && !id.spid) error(400, { message: 'At least one of irid or spid bust be provided!' });

    await checkAuth();
    await startTechniciansListening();

    return await getDataAsStore(id);
};

export const prerender = true;