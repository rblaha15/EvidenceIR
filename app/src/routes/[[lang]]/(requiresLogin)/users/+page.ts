import { browser } from '$app/environment';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import { extractIDs, langEntryGenerator } from '../../helpers';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: null, spid: null };

    if (browser && !await checkAuth()) error(401);
    if (browser && !await checkRegulusOrAdmin()) error(401);

    const id = extractIDs(url);
    if (!id.irid) error(400, { message: 'irid must be provided!' });
    return id;
};

export const prerender = true;