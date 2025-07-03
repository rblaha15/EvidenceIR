import type { EntryGenerator, PageLoad } from './$types';
import { extractIDs, langEntryGenerator } from '../../helpers';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { irid: null, spid: null };
    const id = extractIDs(url);
    if (!id.irid && !id.spid) error(400, { message: 'At least one of irid or spid bust be provided!' });
    return id;
};

export const prerender = true;