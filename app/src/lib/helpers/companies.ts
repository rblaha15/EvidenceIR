import { friendlyCompanies } from '$lib/client/realtime';
import { derived } from 'svelte/store';

export const assemblyCompanies = derived(friendlyCompanies, c =>
    c.assemblyCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? [],
);

export const commissioningCompanies = derived(friendlyCompanies, c =>
    c.commissioningCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? [],
);
