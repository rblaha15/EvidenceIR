import { browser } from '$app/environment';
import { pendingUser } from '$lib/client/auth';
import { call } from '$lib/client/endpoints';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import { lazyStorable } from '$lib/helpers/newStores';
import { derived, readonly } from 'svelte/store';

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

const _friendlyCompanies = lazyStorable<FriendlyCompanies | 'loading'>('friendlyCompanies', 'loading');
export const fetchFriendlyCompanies = async (fetch: typeof window.fetch = window.fetch) =>
    _friendlyCompanies.current = await call('db/getCompanies', { fetch });

const _companies = lazyStorable<Company[] | 'loading'>('companies', 'loading');
export const fetchCompanies = async (fetch: typeof window.fetch = window.fetch) =>
    _companies.current = await call('db/admin/getCompanies', { fetch });

const _myInfo = lazyStorable<Person>('myInfo');
export const fetchMyInfo = async (fetch: typeof window.fetch = window.fetch) =>
    _myInfo.current = await call('db/getMyInfo', { fetch });

const _people = lazyStorable<Person[] | 'loading'>('people', 'loading');
export const fetchPeople = async (fetch: typeof window.fetch = window.fetch) =>
    _people.current = await call('db/regulus/getPeople', { fetch });

const _technicians = lazyStorable<Technician[] | 'loading'>('technicians', 'loading');
export const fetchTechnicians = async (fetch: typeof window.fetch = window.fetch) =>
    _technicians.current = await call('db/getTechnicians', { fetch });

const _spareParts = lazyStorable<SparePart[] | 'loading'>('spareParts', 'loading');
export const fetchSpareParts = async (fetch: typeof window.fetch = window.fetch) =>
    _spareParts.current = await call('db/getSpareParts', { fetch });

const arrays = lazyStorable<Partial<Record<Arrays, string[]>>>('arrays', {});
export const fetchArrays = async (fetch: typeof window.fetch = window.fetch) =>
    arrays.current = await call('db/getArrays', { fetch });

const _loyaltyProgramData = lazyStorable<LoyaltyProgramUserData | null>('lp', null);
export const fetchLoyaltyProgramData = async (fetch: typeof window.fetch = window.fetch) =>
    _loyaltyProgramData.current = await call('db/getLoyaltyPoints', { fetch });

pendingUser.subscribe(async $user => {
    if (!browser) return;
    if ($user == 'pending') return;
    if (!$user) {
        _myInfo.current = undefined;
        _friendlyCompanies.current = 'loading';
        _loyaltyProgramData.current = null;
    } else {
        // await fetchMyInfo();
        // await fetchFriendlyCompanies();
        // await fetchLoyaltyProgramData();
    }
});

export default {
    get friendlyCompanies() { return readonly(_friendlyCompanies.store); },
    get companies() { return readonly(_companies.store); },
    get myInfo() { return readonly(_myInfo.store); },
    get people() { return readonly(_people.store); },
    get technicians() { return readonly(_technicians.store); },
    get spareParts() { return readonly(_spareParts.store); },
    get accumulationTanks() { return derived(arrays.store, $arrays => $arrays.accumulationTanks ?? []); },
    get waterTanks() { return derived(arrays.store, $arrays => $arrays.waterTanks ?? []); },
    get solarCollectors() { return derived(arrays.store, $arrays => $arrays.solarCollectors ?? []); },
    get inverters() { return derived(arrays.store, $arrays => $arrays.inverters ?? []); },
    get batteries() { return derived(arrays.store, $arrays => $arrays.batteries ?? []); },
    get loyaltyProgramData() { return readonly(_loyaltyProgramData.store); },
    get friendlyCompaniesValue() { return _friendlyCompanies.current; },
    get companiesValue() { return _companies.current; },
    get myInfoValue() { return _myInfo.current; },
    get peopleValue() { return _people.current; },
    get techniciansValue() { return _technicians.current; },
    get sparePartsValue() { return _spareParts.current; },
    get accumulationTanksValue() { return arrays.current.accumulationTanks ?? []; },
    get waterTanksValue() { return arrays.current.waterTanks ?? []; },
    get solarCollectorsValue() { return arrays.current.solarCollectors ?? []; },
    get invertersValue() { return arrays.current.inverters ?? []; },
    get batteriesValue() { return arrays.current.batteries ?? []; },
    get loyaltyProgramDataValue() { return _loyaltyProgramData.current; },
};