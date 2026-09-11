import { getIsAdmin, getIsLoggedIn } from '$lib/client/auth';
import arrays from '$lib/client/db/arrays';
import { call } from '$lib/client/endpoints';
import { error } from '@sveltejs/kit';

export const loadAdmin = async (fetch: typeof window.fetch) => {
    if (!await getIsLoggedIn() || !await getIsAdmin()) error(401);

    arrays.fetchCompanies(fetch).then();
    arrays.fetchMyInfo(fetch).then();
    arrays.fetchPeople(fetch).then();
    arrays.fetchTechnicians(fetch).then();
    arrays.fetchSpareParts(fetch).then();
    arrays.fetchArrays(fetch).then();
    arrays.fetchLoyaltyProgramData(fetch).then();

    const dbLink = await call('db/admin/getDatabaseLink', { fetch });
    return { dbLink };
};