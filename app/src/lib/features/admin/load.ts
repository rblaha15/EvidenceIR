import { getIsAdmin, getIsLoggedIn } from '$lib/client/auth';
import {
    companies,
    fetchArrays,
    fetchCompanies,
    fetchLoyaltyProgramData,
    fetchMyInfo,
    fetchPeople,
    fetchSpareParts,
    fetchTechnicians,
    loyaltyProgramData,
    myInfo,
    people,
    spareParts,
    technicians
} from '$lib/client/db/arrays';
import { call } from '$lib/client/endpoints';
import { waitUntil } from '$lib/helpers/stores';
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

    await waitUntil(companies, c => c != 'loading');
    await waitUntil(myInfo, c => !!c);
    await waitUntil(people, c => c != 'loading');
    await waitUntil(technicians, c => c != 'loading');
    await waitUntil(spareParts, c => c != 'loading');
    await waitUntil(loyaltyProgramData, c => !!c);

    const dbLink = await call('db/admin/getDatabaseLink', { fetch });
    return { dbLink };
};