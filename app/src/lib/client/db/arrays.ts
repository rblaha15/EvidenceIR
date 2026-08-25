import { browser } from '$app/environment';
import { user } from '$lib/client/auth';
import { call } from '$lib/client/endpoints';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import { storable } from '$lib/helpers/stores';
import { derived, readonly, writable } from 'svelte/store';

type CRN = string;

export type Company = {
    crn: CRN;
    companyName: string;
    email?: string;
    phone?: string;
    representative?: string;
    representativeUserEmail?: string;
};
export type Person = {
    name: string;
    email: string;
    assemblyCompanies: CRN[];
    commissioningCompanies: CRN[];
    allowUPT: boolean;
    responsiblePerson?: string;
    koNumber?: string;
};
export type Technician = {
    email: string;
    name: string;
    phone: string;
    initials: string;
};
export type SparePart = {
    name: string;
    code: number;
    unitPrice: number;
};
export type Arrays = 'accumulationTanks' | 'waterTanks' | 'solarCollectors' | 'inverters' | 'batteries';
export type StringArray = {
    name: Arrays,
    value: string[]
};
export type FriendlyCompanies = {
    assemblyCompanies: Company[];
    commissioningCompanies: Company[];
};

const _friendlyCompanies = storable<FriendlyCompanies | 'loading'>('friendlyCompanies', 'loading');
export const friendlyCompanies = readonly(_friendlyCompanies);
export const fetchFriendlyCompanies = async (fetch: typeof window.fetch = window.fetch) =>
    _friendlyCompanies.set(await call('db/getCompanies', { fetch }));

const _companies = storable<Company[] | 'loading'>('companies', 'loading');
export const companies = readonly(_companies);
export const fetchCompanies = async (fetch: typeof window.fetch = window.fetch) =>
    _companies.set(await call('db/admin/getCompanies', { fetch }));

const _myInfo = storable<Person>('myInfo');
export const myInfo = readonly(_myInfo);
export const fetchMyInfo = async (fetch: typeof window.fetch = window.fetch) =>
    _myInfo.set(await call('db/getMyInfo', { fetch }));

const _people = storable<Person[] | 'loading'>('people', 'loading');
export const people = readonly(_people);
export const fetchPeople = async (fetch: typeof window.fetch = window.fetch) =>
    _people.set(await call('db/regulus/getPeople', { fetch }));

const _technicians = storable<Technician[] | 'loading'>('technicians', 'loading');
export const technicians = readonly(_technicians);
export const fetchTechnicians = async (fetch: typeof window.fetch = window.fetch) =>
    _technicians.set(await call('db/getTechnicians', { fetch }));

const _spareParts = storable<SparePart[] | 'loading'>('spareParts', 'loading');
export const spareParts = readonly(_spareParts);
export const fetchSpareParts = async (fetch: typeof window.fetch = window.fetch) =>
    _spareParts.set(await call('db/getSpareParts', { fetch }));

const arrays = storable<Partial<Record<Arrays, string[]>>>('arrays', {});
export const accumulationTanks = derived(arrays, $arrays => $arrays.accumulationTanks ?? []);
export const waterTanks = derived(arrays, $arrays => $arrays.waterTanks ?? []);
export const solarCollectors = derived(arrays, $arrays => $arrays.solarCollectors ?? []);
export const inverters = derived(arrays, $arrays => $arrays.inverters ?? []);
export const batteries = derived(arrays, $arrays => $arrays.batteries ?? []);
export const fetchArrays = async (fetch: typeof window.fetch = window.fetch) =>
    arrays.set(await call('db/getArrays', { fetch }));

const _loyaltyProgramData = writable<LoyaltyProgramUserData | null>();
export const loyaltyProgramData = readonly(_loyaltyProgramData);
export const fetchLoyaltyProgramData = async (fetch: typeof window.fetch = window.fetch) =>
    _loyaltyProgramData.set(await call('db/getLoyaltyPoints', { fetch }));

user.subscribe(async $user => {
    if (!browser) return;
    if (!$user) {
        _myInfo.set(undefined);
        _friendlyCompanies.set('loading');
        _loyaltyProgramData.set(null);
    } else {
        // await fetchMyInfo();
        // await fetchFriendlyCompanies();
        // await fetchLoyaltyProgramData();
    }
});