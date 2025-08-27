import type { EntryGenerator, PageLoad } from './$types';
import { checkAdmin, checkAuth } from '$lib/client/auth';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { langEntryGenerator } from '../../helpers';
import { startCompaniesListening, startLidiListening, startSparePartsListening, startTechniciansListening } from '$lib/client/realtime';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async () => {
    if ((!await checkAuth() || !await checkAdmin()) && browser) error(401);

    await startLidiListening();
    await startCompaniesListening();
    await startTechniciansListening();
    await startSparePartsListening();
};

export const prerender = true;