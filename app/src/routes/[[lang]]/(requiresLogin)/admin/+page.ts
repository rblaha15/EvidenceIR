import type { EntryGenerator, PageLoad } from './$types';
import { getIsAdmin, getIsLoggedIn } from '$lib/client/auth';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import {
    startCompaniesListening, startUsersListening, startSparePartsListening, startTechniciansListening,
    startAccumulationTanksListening, startWaterTanksListening, startSolarCollectorsListening, startInvertersListening,
    startBatteriesListening,
} from '$lib/client/realtime';
import { langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async () => {
    if (browser && (!await getIsLoggedIn() || !await getIsAdmin())) error(401);

    await startUsersListening();
    await startCompaniesListening();
    await startTechniciansListening();
    await startSparePartsListening();
    await startAccumulationTanksListening();
    await startWaterTanksListening();
    await startSolarCollectorsListening();
    await startInvertersListening();
    await startBatteriesListening();
};

export const prerender = true;