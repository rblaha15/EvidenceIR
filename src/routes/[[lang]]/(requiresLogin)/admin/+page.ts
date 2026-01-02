import type { EntryGenerator, PageLoad } from './$types';
import { checkAdmin, checkAuth } from '$lib/client/auth';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import {
    startCompaniesListening, startUsersListening, startSparePartsListening, startTechniciansListening,
    startAccumulationTanksListening, startWaterTanksListening, startSolarCollectorsListening,
} from '$lib/client/realtime';
import { langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async () => {
    if ((!await checkAuth() || !await checkAdmin()) && browser) error(401);

    await startUsersListening();
    await startCompaniesListening();
    await startTechniciansListening();
    await startSparePartsListening();
    await startAccumulationTanksListening();
    await startWaterTanksListening();
    await startSolarCollectorsListening();
};

export const prerender = true;