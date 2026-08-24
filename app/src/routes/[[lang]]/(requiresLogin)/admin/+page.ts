import { browser } from '$app/environment';
import { loadAdmin } from '$lib/features/admin/load';
import { langEntryGenerator } from '$lib/helpers/paths';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ fetch }) => !browser
    ? { dbLink: '' }
    : loadAdmin(fetch);

export const prerender = false;