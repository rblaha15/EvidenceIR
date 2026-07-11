import {
    fetchArrays, fetchCompanies,
    fetchLoyaltyProgramData,
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

export const load: PageLoad = async ({ fetch }) => {
    if (browser && (!await getIsLoggedIn() || !await getIsAdmin())) error(401);

    await fetchCompanies(fetch);
    await fetchMyInfo(fetch);
    await fetchPeople(fetch);
    await fetchTechnicians(fetch);
    await fetchSpareParts(fetch);
    await fetchArrays(fetch);
    await fetchLoyaltyProgramData(fetch);
};

export const prerender = false;