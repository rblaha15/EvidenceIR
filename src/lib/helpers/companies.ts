import { friendlyCompanies, type FriendlyCompanies } from '$lib/client/realtime';
import { derived } from 'svelte/store';

export const companies = derived(friendlyCompanies, c => ({
    assemblyCompanies: c.assemblyCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? [],
    commissioningCompanies: c.commissioningCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? [],
}) as FriendlyCompanies)
