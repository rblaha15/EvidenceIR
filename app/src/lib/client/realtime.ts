import { derived, get as getFromStore, readable, type Readable, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser } from '$lib/client/auth';
import type { User } from 'firebase/auth';
import { type Query, ref } from 'firebase/database';
import { flattenStores, storable } from '$lib/helpers/stores';
import { realtime } from '../../hooks.client';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import { getIsOnline, isOnline } from '$lib/client/realtimeOnline';

type SelfObject<T extends PropertyKey> = { [key in T]: key };
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
    email: string;
    assemblyCompanies: SelfObject<CRN>;
    commissioningCompanies: SelfObject<CRN>;
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
        const vsechnyFirmy = await getWithCache<{ [crn: CRN]: Company }>(companiesRef);
        return FriendlyCompanies(vsechnyFirmy?.getValues() ?? []);
    }
    const ja = await getWithCache<Person>(child(usersRef, user.uid));
    if (!ja || ja.email !== user.email) {
        return FriendlyCompanies([]);
    }
    const dovolenaIca = {
        assembly: ja.assemblyCompanies?.keys() as CRN[] ?? [],
        commissioning: ja.commissioningCompanies?.keys() as CRN[] ?? [],
    };
    return {
        assemblyCompanies: await Promise.all(
            dovolenaIca.assembly.map(async (crn) => await getWithCache<Company>(child(companiesRef, crn))),
        ),
        commissioningCompanies: await Promise.all(
            dovolenaIca.commissioning.map(
                async (crn) => await getWithCache<Company>(child(companiesRef, crn)),
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
    const ja = await getWithCache<Person>(child(usersRef, user.uid));
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

const _allowUPT = async (user: User | null) => {
    if (!user) return false;
    const { child } = await import('firebase/database');
    const ja = await getWithCache<Person>(child(usersRef, user.uid));
    return ja?.allowUPT ?? false;
};

export const allowUPT = derived(
    currentUser,
    (user, set) => {
        setTimeout(async () => {
            set(user ? await _allowUPT(user) : false);
        }, 500);
    },
    false,
);

const usersRef = ref(realtime, '/people');
export const usersList = writable([] as Person[]);

export const startUsersListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(usersRef, (data) => {
        usersList.set((data.val() as { [uid: string]: Person } ?? {}).getValues().map(p => ({
            ...p, assemblyCompanies: p.assemblyCompanies ?? {}, commissioningCompanies: p.commissioningCompanies ?? {},
        })));
    });
};

const companiesRef = ref(realtime, '/companies');
export const companiesList = writable([] as Company[]);

export const startCompaniesListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(companiesRef, (data) => {
        companiesList.set((data.val() as { [crn: CRN]: Company } ?? {}).getValues());
    });
};

const techniciansRef = ref(realtime, '/technicians');
export const techniciansList = writable([] as Technician[]);

export const startTechniciansListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(techniciansRef, (data) => {
        techniciansList.set((data.val() as Technician[]) ?? []);
    });
};

const sparePartsRef = ref(realtime, '/spareParts');
export const sparePartsList = writable([] as SparePart[]);

export const startSparePartsListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(sparePartsRef, (data) => {
        sparePartsList.set((data.val() as SparePart[]) ?? []);
    });
};

const accumulationTanksRef = ref(realtime, '/accumulationTanks');
export const accumulationTanks = writable([] as string[]);

export const startAccumulationTanksListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(accumulationTanksRef, (data) => {
        accumulationTanks.set((data.val() as string[]) ?? []);
    });
};

const waterTanksRef = ref(realtime, '/waterTanks');
export const waterTanks = writable([] as string[]);

export const startWaterTanksListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(waterTanksRef, (data) => {
        waterTanks.set((data.val() as string[]) ?? []);
    });
};

const solarCollectorsRef = ref(realtime, '/solarCollectors');
export const solarCollectors = writable([] as string[]);

export const startSolarCollectorsListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(solarCollectorsRef, (data) => {
        solarCollectors.set((data.val() as string[]) ?? []);
    });
};

const invertersRef = ref(realtime, '/inverters');
export const inverters = writable([] as string[]);

export const startInvertersListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(invertersRef, (data) => {
        inverters.set((data.val() as string[]) ?? []);
    });
};

const batteriesRef = ref(realtime, '/batteries');
export const batteries = writable([] as string[]);

export const startBatteriesListening = async () => {
    const { onValue } = await import('firebase/database');
    return onValue(batteriesRef, (data) => {
        batteries.set((data.val() as string[]) ?? []);
    });
};

const pointsStores: Record<string, Readable<LoyaltyProgramUserData | null>> = {};

const loyaltyProgramRef = ref(realtime, '/loyaltyProgram');
export const loyaltyProgramDataStore = flattenStores(derived<Readable<User | null>, Readable<LoyaltyProgramUserData | null>>(
    currentUser, (user, set) => {
        if (!user) return set(readable(null));
        const uid = user.uid;
        if (!uid) return set(readable(null));
        return isOnline.subscribe(async online => {
            if (!online) return set(readable(null));
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
            return set(pointsStores[uid]);
        });
    }, readable(null),
));