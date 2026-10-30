import { browser } from '$app/environment';
import { getIsAdmin, getIsRegulusOrAdmin, pendingUser } from '$lib/client/auth';
import { call } from '$lib/client/endpoints';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import { getIsOnline } from '$lib/client/online';
import { lazyStorable } from '$lib/helpers/newStores';
import { derived, readonly } from 'svelte/store';
import self from '$lib/client/db/arrays';

const days = (days: number) => days * 24 /*hours*/ * 60 /*minutes*/ * 60 /*seconds*/ * 1E3 /*milliseconds*/;

type CRN = string;
export type HeatPump = string;

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
export type HetaPumpDetails = {
    category: 'CTC' | 'RTC' | 'ThermonaRTC' | 'EcoHeatCTC',
    type: 'airToWater' | 'groundToWater',
    model: HeatPump,
    numberFormat: string,
    hide: boolean,
    number: number,
}
export type Arrays = 'accumulationTanks' | 'waterTanks' | 'solarCollectors' | 'inverters' | 'batteries' | 'fvePanels';
export type StringArray = {
    name: Arrays,
    value: string[]
};
export type AllArrays = {
    person: Person[];
    company: Company[];
    technician: Technician[];
    sparePart: SparePart[];
    heatPump: HetaPumpDetails[];
    arrays: Record<Arrays, string[]>;
}
export type FriendlyCompanies = {
    assemblyCompanies: Company[];
    commissioningCompanies: Company[];
};

// Per-user
const friendlyCompanies = lazyStorable<FriendlyCompanies | 'loading'>('friendlyCompanies', 'loading');
// Admin-only
const companies = lazyStorable<Company[] | 'loading'>('companies', 'loading');
// Per-user
const myInfo = lazyStorable<Person>('myInfo');
// Regulus-only
const people = lazyStorable<Person[] | 'loading'>('people', 'loading');
const technicians = lazyStorable<Technician[] | 'loading'>('technicians', 'loading');
const spareParts = lazyStorable<SparePart[] | 'loading'>('spareParts', 'loading');
const heatPumps = lazyStorable<HetaPumpDetails[]>('heatPumps', []);
const arrays = lazyStorable<Partial<Record<Arrays, string[]>>>('arrays', {});
// Per-user
const loyaltyProgramData = lazyStorable<LoyaltyProgramUserData | null>('lp', null);

const lastFetched = lazyStorable<string>('arrays');

export default {
    get friendlyCompanies() { return readonly(friendlyCompanies.store); },
    get companies() { return readonly(companies.store); },
    get myInfo() { return readonly(myInfo.store); },
    get people() { return readonly(people.store); },
    get technicians() { return readonly(technicians.store); },
    get spareParts() { return readonly(spareParts.store); },
    get heatPumps() { return readonly(heatPumps.store); },
    get accumulationTanks() { return derived(arrays.store, $arrays => $arrays.accumulationTanks ?? []); },
    get waterTanks() { return derived(arrays.store, $arrays => $arrays.waterTanks ?? []); },
    get solarCollectors() { return derived(arrays.store, $arrays => $arrays.solarCollectors ?? []); },
    get inverters() { return derived(arrays.store, $arrays => $arrays.inverters ?? []); },
    get batteries() { return derived(arrays.store, $arrays => $arrays.batteries ?? []); },
    get fvePanels() { return derived(arrays.store, $arrays => $arrays.fvePanels ?? []); },
    get loyaltyProgramData() { return readonly(loyaltyProgramData.store); },
    get friendlyCompaniesValue() { return friendlyCompanies.current; },
    get companiesValue() { return companies.current; },
    get myInfoValue() { return myInfo.current; },
    get peopleValue() { return people.current; },
    get techniciansValue() { return technicians.current; },
    get sparePartsValue() { return spareParts.current; },
    get heatPumpsValue() { return heatPumps.current; },
    get accumulationTanksValue() { return arrays.current.accumulationTanks ?? []; },
    get waterTanksValue() { return arrays.current.waterTanks ?? []; },
    get solarCollectorsValue() { return arrays.current.solarCollectors ?? []; },
    get invertersValue() { return arrays.current.inverters ?? []; },
    get batteriesValue() { return arrays.current.batteries ?? []; },
    get fvePanelsValue() { return arrays.current.fvePanels ?? []; },
    get loyaltyProgramDataValue() { return loyaltyProgramData.current; },
    async fetchFriendlyCompanies(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) friendlyCompanies.current = await call('db/getCompanies', { fetch })},
    async fetchCompanies(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) companies.current = await call('db/admin/getCompanies', { fetch })},
    async fetchMyInfo(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) myInfo.current = await call('db/getMyInfo', { fetch })},
    async fetchPeople(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) people.current = await call('db/regulus/getPeople', { fetch })},
    async fetchTechnicians(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) technicians.current = await call('db/getTechnicians', { fetch })},
    async fetchSpareParts(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) spareParts.current = await call('db/getSpareParts', { fetch })},
    async fetchHeatPumps(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) heatPumps.current = await call('db/getHeatPumps', { fetch })},
    async fetchArrays(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) arrays.current = await call('db/getArrays', { fetch })},
    async fetchLoyaltyProgramData(fetch: typeof window.fetch = window.fetch)
        { if (getIsOnline()) loyaltyProgramData.current = await call('db/getLoyaltyPoints', { fetch })},

    async trySyncArrays(fetch: typeof window.fetch = window.fetch) {
        // if (!getIsOnline()) return;
        // const now = new Date();
        // const last = new Date(lastFetched.current ?? 0);
        // if (lastFetched.current && (now.valueOf() - last.valueOf()) <= days(1)) return;

        await self.syncArrays(fetch);
    },
    async syncArrays(fetch: typeof window.fetch = window.fetch) {
        if (!getIsOnline()) return;
        const now = new Date();

        await self.fetchFriendlyCompanies(fetch);
        if (await getIsAdmin()) await self.fetchCompanies(fetch);
        await self.fetchMyInfo(fetch);
        if (await getIsRegulusOrAdmin()) await self.fetchPeople(fetch);
        await self.fetchTechnicians(fetch);
        await self.fetchSpareParts(fetch);
        await self.fetchHeatPumps(fetch);
        await self.fetchArrays(fetch);
        await self.fetchLoyaltyProgramData(fetch);

        lastFetched.current = now.toISOString();
    },
};

pendingUser.subscribe(async $user => {
    if (!browser) return;
    if ($user == 'pending') return;
    if (!$user) {
        lastFetched.current = undefined;
        myInfo.current = undefined;
        friendlyCompanies.current = 'loading';
        loyaltyProgramData.current = null;
    }
});