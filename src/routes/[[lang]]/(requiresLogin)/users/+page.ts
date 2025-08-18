import { browser } from '$app/environment';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import { extractIDs, langEntryGenerator } from '../../helpers';
import type { EntryGenerator, PageLoad } from './$types';
import { startLidiListening } from '$lib/client/realtime';
import db from '$lib/data';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: undefined, ir: undefined };

    if (!await checkAuth()) error(401);
    if (!await checkRegulusOrAdmin()) error(401);

    const id = extractIDs(url);
    if (!id.irid) error(400, { message: 'irid must be provided!' });

    await startLidiListening()

    return { irid: id.irid, ir: db.getIRAsStore(id.irid) };
};

export const prerender = true;