import { derived, get as getFromStore, readable, type Readable, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser } from '$lib/client/auth';
import type { User } from 'firebase/auth';
import { type Query, ref } from 'firebase/database';
import { storable } from '$lib/helpers/stores';
import { realtime } from '../../hooks.client';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import { getIsOnline } from '$lib/client/realtimeOnline';

type SelfObject<T extends PropertyKey> = { [key in T]: key };
type CRN = string;

export type Company = {
    crn: CRN;
    companyName: string;
    email?: string;
    phone?: string;
    representative?: string;
};
export type Person = {
    email: string;
    assemblyCompanies: SelfObject<CRN>;
    commissioningCompanies: SelfObject<CRN>;
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
export type FriendlyCompanies = {
    assemblyCompanies: Company[];
    commissioningCompanies: Company[];
};
const FriendlyCompanies = (
    assemblyCompanies: Company[],
    commissioningCompanies?: Company[],
): FriendlyCompanies => ({
    assemblyCompanies,
    commissioningCompanies: commissioningCompanies ?? assemblyCompanies,
});

const firmyRef = ref(realtime, '/companies');
const lidiRef = ref(realtime, '/people');
const techniciRef = ref(realtime, '/technicians');
const dilyRef = ref(realtime, '/spareParts');
const nadrzeRef = ref(realtime, '/accumulationTanks');
const zasobnikyRef = ref(realtime, '/waterTanks');
const kolektoryRef = ref(realtime, '/solarCollectors');
const loyaltyProgramRef = ref(realtime, '/loyaltyProgram');

const getWithCache = async <T>(query: Query) => {
    const { get } = await import('firebase/database');
    const store = storable<T>(
        'realtime_' + query.ref.toString().substring(query.ref.root.toString().length - 1),
    );
    if (getIsOnline()) {
        const value = (await get(query)).val() as T | undefined;
        if (value != undefined) store.set(value);
        return value;
    } else {
        return getFromStore(store);
    }
};

const _friendlyCompanies = async (user: User | null): Promise<FriendlyCompanies> => {
    if (!user) {
        return FriendlyCompanies([]);
    }
    const { child } = await import('firebase/database');
    if (await checkRegulusOrAdmin()) {
        const vsechnyFirmy = await getWithCache<{ [crn: CRN]: Company }>(firmyRef);
        return FriendlyCompanies(vsechnyFirmy?.getValues() ?? []);
    }
    const ja = await getWithCache<Person>(child(lidiRef, user.uid));
    if (!ja || ja.email !== user.email) {
        return FriendlyCompanies([]);
    }
    const dovolenaIca = {
        assembly: ja.assemblyCompanies?.keys() as CRN[] ?? [],
        commissioning: ja.commissioningCompanies?.keys() as CRN[] ?? [],
    };
    return {
        assemblyCompanies: await Promise.all(
            dovolenaIca.assembly.map(async (crn) => await getWithCache<Company>(child(firmyRef, crn))),
        ),
        commissioningCompanies: await Promise.all(
            dovolenaIca.commissioning.map(
                async (crn) => await getWithCache<Company>(child(firmyRef, crn)),
            ),
        ),
    } as FriendlyCompanies;
};

export const friendlyCompanies = derived(
    currentUser,
    (user, set) => {
        setTimeout(async () => {
            set(user ? await _friendlyCompanies(user) : FriendlyCompanies([]));
        }, 500);
    },
    FriendlyCompanies([]),
);

const _responsiblePerson = async (user: User | null) => {
    if (!user) return null;
    const { child } = await import('firebase/database');
    const ja = await getWithCache<Person>(child(lidiRef, user.uid));
    return ja?.responsiblePerson ?? null;
};

export const responsiblePerson = derived(
    currentUser,
    (user, set) => {
        setTimeout(async () => {
            set(user ? await _responsiblePerson(user) : null);
        }, 500);
    },
    null as string | null,
);

export const usersList = writable([] as Person[]);

export const startUsersListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(lidiRef, (data) => {
        usersList.set((data.val() as { [uid: string]: Person } ?? {}).getValues().map(p => ({
            ...p, assemblyCompanies: p.assemblyCompanies ?? {}, commissioningCompanies: p.commissioningCompanies ?? {},
        })));
    });
};

export const companiesList = writable([] as Company[]);

export const startCompaniesListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(firmyRef, (data) => {
        companiesList.set((data.val() as { [crn: CRN]: Company } ?? {}).getValues());
    });
};

export const techniciansList = writable([] as Technician[]);

export const startTechniciansListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(techniciRef, (data) => {
        techniciansList.set((data.val() as Technician[]) ?? []);
    });
};

export const sparePartsList = writable([] as SparePart[]);

export const startSparePartsListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(dilyRef, (data) => {
        sparePartsList.set((data.val() as SparePart[]) ?? []);
    });
};

export const accumulationTanks = writable([] as string[]);

export const startAccumulationTanksListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(nadrzeRef, (data) => {
        accumulationTanks.set((data.val() as string[]) ?? []);
    });
};

export const waterTanks = writable([] as string[]);

export const startWaterTanksListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(zasobnikyRef, (data) => {
        waterTanks.set((data.val() as string[]) ?? []);
    });
};

export const solarCollectors = writable([] as string[]);

export const startSolarCollectorsListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(kolektoryRef, (data) => {
        solarCollectors.set((data.val() as string[]) ?? []);
    });
};

const pointsStores: Record<string, Readable<LoyaltyProgramUserData | null>> = {};

export const getLoyaltyProgramDataStore = async () => {
    const user = getFromStore(currentUser);
    if (!user) return readable(null);
    if (!getIsOnline()) return readable(null);
    if (await checkRegulusOrAdmin()) return readable(null);
    const uid = user.uid;
    if (!uid) return readable(null);
    if (!pointsStores[uid]) {
        const store = writable<LoyaltyProgramUserData | null>(null);
        const { onValue, child } = await import('firebase/database');
        onValue(
            child(loyaltyProgramRef, uid),
            data => {
                store.set((data.val() as LoyaltyProgramUserData) || { points: 0, history: [] });
            },
        );
        pointsStores[uid] = store;
    }
    return pointsStores[uid];
};
