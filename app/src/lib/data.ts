import type { Raw, RawForm } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormRKT } from '$lib/forms/RKT/formRKT.js';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { type Readable } from 'svelte/store';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import type { FormSP } from '$lib/forms/SP/formSP.svelte.js';
import type { IRID, SPID } from '$lib/helpers/ir';
import { getIsOnline, isOnline } from '$lib/client/realtime';
import { offlineDatabase } from '$lib/client/offline.svelte.js';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import { addToOfflineQueue } from '$lib/client/offlineQueue.svelte';
import type { TC } from '$lib/forms/IN/defaultIN';
import { flatDerived } from '$lib/helpers/stores';
import type { FormFT } from '$lib/forms/FT/formFT';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import '$lib/extensions';
import type { FormRKS } from '$lib/forms/RKS/formRKS';
import { firestoreDatabase } from '$lib/client/firestore';
import { type Database, databaseMethods, type ReadDatabase, type WriteDatabase } from '$lib/Database';
import type { FormRKTL } from '$lib/forms/RKT/formRKTL';

export type Year = number;

export type RecommendationState = 'waiting' | 'sentRecommendation' | 'sentRequest';

export type RecommendationSettings = {
    executingCompany: 'assembly' | 'commissioning' | 'regulus',
    state: RecommendationState,
    code?: string,
};

type FakeUvedeni = {
    [K1 in keyof RawForm<FormUPT>]?: {
        [K2 in keyof Omit<Raw<FormUPT[K1]>, 'date'>]?: undefined
    }
} & {
    uvadeni: {
        date: string
    }
};

export type Deleted<ID extends IRID | SPID = IRID | SPID> = {
    deleted: true;
    deletedAt: Timestamp;
    id: ID;
    movedTo?: ID;
}

export type IR = {
    isDraft: boolean;
    deleted: false;
    createdAt?: Timestamp;
    changedAt: Timestamp;
    keysChangedAt: Timestamp;
    evidence: Raw<FormIN>;
    uvedeniTC: Raw<FormUPT> | FakeUvedeni;
    uvedeniSOL?: Raw<FormUPS>;
    uvedeniFVE?: Raw<FormUPF>;
    kontrolyTC: {
        [P in TC]?: Record<Year, Raw<FormRKT | FormRKTL>>;
    };
    kontrolySOL?: Record<Year, Raw<FormRKS>>;
    users: string[];
    installationProtocols: Raw<FormSP>[];
    faceTable?: Raw<FormFT>;
    yearlyHeatPumpCheckRecommendation?: RecommendationSettings;
    yearlySolarSystemCheckRecommendation?: RecommendationSettings;
    createdBy?: {
        uid: string;
        email: string;
        isFake?: boolean;
    };
    loyaltyProgram?: {
        grantedCommission?: boolean;
    };
};

export const createInstallation = (
    raw: Raw<FormIN>,
    userEmail: string,
    isDraft: boolean,
) => ({
    isDraft,
    evidence: raw,
    kontrolyTC: {},
    users: [userEmail],
    installationProtocols: [],
    uvedeniTC: { uvadeni: { date: '' } },
    deleted: false,
    createdAt: serverTimestamp() as Timestamp,
    changedAt: serverTimestamp() as Timestamp,
    keysChangedAt: serverTimestamp() as Timestamp,
} satisfies IR);

export type RecommendationData = {
    irid: IRID;
    user: string;
    company: string;
    companyEmail: string;
    location: string;
    type: 'TČ' | 'SOL',
};

type GetAsStoreFunctionReturnType = ReturnType<Database[GetAsStoreFunction]> extends Readable<infer T> ? Readable<T> : never;
const mergedStore = (name: GetAsStoreFunction, args: Parameters<Database[GetAsStoreFunction]>): GetAsStoreFunctionReturnType => flatDerived(
    isOnline,
    $isOnline => {
        const db = $isOnline ? firestoreDatabase : offlineDatabase;
        // @ts-expect-error TS doesn't know it's a tuple
        return db[name](...args) as GetAsStoreFunctionReturnType;
    },
    (_, $isOnline) => {
        // console.log('Got value from the', name, 'store from the', $isOnline ? 'online' : 'offline', 'database')
    },
);

const decide = <F extends keyof Database>(name: F, args: Parameters<Database[F]>): ReturnType<Database[F]> => {
    // console.log('Executing', name, 'with args', ...args);

    if (isGetAsStoreFunction(name)) {
        return mergedStore(name, args as Parameters<Database[GetAsStoreFunction]>) as ReturnType<Database[F]>;
    } else {
        const db = getIsOnline() ? firestoreDatabase : offlineDatabase;
        if (!getIsOnline()) addToOfflineQueue(name, args);

        // @ts-expect-error TS doesn't know it's a tuple
        return db[name](...args);
    }
};

export type WriteFunction = keyof WriteDatabase;
export const isWriteFunction = (name: keyof Database): name is WriteFunction =>
    ['add', 'update', 'delete'].some(prefix => name.startsWith(prefix));

export type GetAsStoreFunction = {
    [F in keyof ReadDatabase]: F extends `get${string}AsStore` ? F : never;
}[keyof ReadDatabase];
export const isGetAsStoreFunction = (name: keyof Database): name is GetAsStoreFunction =>
    name.endsWith('AsStore');

const db: Database = databaseMethods.associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => decide(name, args),
) as {
    [F in typeof databaseMethods[number]]: Database[F];
};

export default db;