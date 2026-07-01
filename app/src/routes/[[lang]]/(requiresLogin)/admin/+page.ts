import {
    fetchArrays, fetchCompanies,
    fetchFriendlyCompanies, fetchLoyaltyProgramData,
    fetchMyInfo,
    fetchPeople,
    fetchSpareParts,
    fetchTechnicians
} from '$lib/client/db/arrays';
import type { EntryGenerator, PageLoad } from './$types';
import { getIsAdmin, getIsLoggedIn } from '$lib/client/auth';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async () => {
    if (browser && (!await getIsLoggedIn() || !await getIsAdmin())) error(401);

    await fetchCompanies();
    await fetchMyInfo();
    await fetchPeople();
    await fetchTechnicians();
    await fetchSpareParts();
    await fetchArrays();
    await fetchLoyaltyProgramData();
};

export const prerender = true;