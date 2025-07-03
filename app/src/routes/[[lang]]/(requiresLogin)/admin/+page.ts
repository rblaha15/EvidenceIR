import type { EntryGenerator, PageLoad } from './$types';
import { checkAdmin, checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { langEntryGenerator } from '../../helpers';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async () => {
    console.log(await checkRegulusOrAdmin());
    if ((!await checkAuth() || !await checkAdmin()) && browser) error(401);
};

export const prerender = true;