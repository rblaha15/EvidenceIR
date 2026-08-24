import { getIsAdmin, getIsLoggedIn } from '$lib/client/auth';
import {
    fetchArrays,
    fetchCompanies,
    fetchLoyaltyProgramData,
    fetchMyInfo,
    fetchPeople,
    fetchSpareParts,
    fetchTechnicians
} from '$lib/client/db/arrays';
import { call } from '$lib/client/db/endpoints';
import { error } from '@sveltejs/kit';

export const loadAdmin = async (fetch: typeof window.fetch) => {
    if ((!await getIsLoggedIn() || !await getIsAdmin())) error(401);

    fetchCompanies(fetch).then();
    fetchMyInfo(fetch).then();
    fetchPeople(fetch).then();
    fetchTechnicians(fetch).then();
    fetchSpareParts(fetch).then();
    fetchArrays(fetch).then();
    fetchLoyaltyProgramData(fetch).then();

    const dbLink = await call('db/admin/getDatabaseLink', { fetch });
    return { dbLink };
};