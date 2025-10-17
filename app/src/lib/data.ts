import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormRK } from '$lib/forms/RK/formRK.js';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { type Readable } from 'svelte/store';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import type { FormSP } from '$lib/forms/SP/formSP.svelte.js';
import type { IRID, SPID } from '$lib/helpers/ir';
import { getIsOnline, isOnline } from '$lib/client/realtime';
import { offlineDatabase } from '$lib/client/offline.svelte.js';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import { addToOfflineQueue } from '$lib/client/offlineQueue.svelte';
import type { TC } from '$lib/forms/IN/defaultIN';
import { firestoreDatabase } from '$lib/client/firestore';
import { flatDerived } from '$lib/helpers/stores';
import type { FormFT } from '$lib/forms/FT/formFT';
import '$lib/extensions';

export type Year = number;

export type RecommendationState = 'waiting' | 'sentRecommendation' | 'sentRequest';

export type IR = {
    evidence: Raw<FormIN>;
    uvedeniTC?: Raw<FormUPT>;
    uvedeniSOL?: Raw<FormUPS>;
    uvedeniFVE?: Raw<FormUPF>;
    kontrolyTC: {
        [P in TC]?: Record<Year, Raw<FormRK>>;
    };
    users: string[];
    installationProtocols: Raw<FormSP>[];
    faceTable?: Raw<FormFT>;
    yearlyHeatPumpCheckRecommendation?: {
        executingCompany: 'assembly' | 'commissioning' | 'regulus',
        state: RecommendationState,
        code?: string,
    }
};

export type RecommendationData = {
    irid: IRID;
    user: string;
    company: string;
    companyEmail: string;
    location: string;
};

/**
 * Supported actions:
 * - get
 * - getAll
 * - get*AsStore
 * - getAll*AsStore
 * - exists
 */
export interface ReadDatabase {
    getIR(irid: IRID): Promise<IR | undefined>;

    getAllIRs(): Promise<IR[]>;

    getAllIRsAsStore(): Readable<IR[] | 'loading'>;

    getIRAsStore(irid: IRID): Readable<IR | undefined | 'loading'>;

    existsIR(irid: IRID): Promise<boolean>;

    getIndependentProtocol(spid: SPID): Promise<Raw<FormNSP> | undefined>;

    getIndependentProtocolAsStore(spid: SPID): Readable<Raw<FormNSP> | undefined | 'loading'>;

    getAllIndependentProtocols(): Promise<Raw<FormNSP>[]>;

    getAllIndependentProtocolsAsStore(): Readable<Raw<FormNSP>[] | 'loading'>;
}

/**
 * Supported actions:
 * - add
 * - delete
 * - update
 */
export interface WriteDatabase {
    addIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID): Promise<void>;

    updateIRRecord(rawData: Raw<FormIN>): Promise<void>;

    addHeatPumpCheck(irid: IRID, pump: TC, year: Year, check: Raw<FormRK>): Promise<void>;

    addServiceProtocol(irid: IRID, protocol: Raw<FormSP>): Promise<void>;

    updateServiceProtocol(irid: IRID, index: number, protocol: Raw<FormSP>): Promise<void>;

    addHeatPumpCommissioningProtocol(irid: IRID, protocol: Raw<FormUPT>): Promise<void>;

    addSolarSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPS>): Promise<void>;

    addPhotovoltaicSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPF>): Promise<void>;

    addFaceTable(irid: IRID, faceTable: Raw<FormFT>): Promise<void>;

    updateIRUsers(irid: IRID, users: string[]): Promise<void>;

    updateRecommendationsSettings(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    addIndependentServiceProtocol(protocol: Raw<FormNSP>): Promise<void>;

    updateIndependentServiceProtocol(protocol: Raw<FormNSP>): Promise<void>;

    deleteIndependentProtocol(spid: SPID): Promise<void>;
}

export interface Database extends ReadDatabase, WriteDatabase {
}

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

const functions = [
    'getIR', 'getAllIRs', 'getAllIRsAsStore', 'getIRAsStore', 'addIR', 'deleteIR', 'existsIR', 'updateIRRecord', 'addHeatPumpCheck',
    'addServiceProtocol', 'updateServiceProtocol', 'addHeatPumpCommissioningProtocol', 'addSolarSystemCommissioningProtocol',
    'addPhotovoltaicSystemCommissioningProtocol', 'updateIRUsers', 'updateRecommendationsSettings', 'addIndependentServiceProtocol',
    'deleteIndependentProtocol', 'getIndependentProtocol', 'getIndependentProtocolAsStore', 'getAllIndependentProtocols',
    'getAllIndependentProtocolsAsStore', 'addFaceTable', 'updateIndependentServiceProtocol',
] as const satisfies (keyof Database)[];

export type WriteFunction = keyof WriteDatabase;
export const isWriteFunction = (name: keyof Database): name is WriteFunction =>
    ['add', 'update', 'delete'].some(prefix => name.startsWith(prefix));

export type GetAsStoreFunction = {
    [F in keyof ReadDatabase]: F extends `get${string}AsStore` ? F : never;
}[keyof ReadDatabase];
export const isGetAsStoreFunction = (name: keyof Database): name is GetAsStoreFunction =>
    name.endsWith('AsStore');

const db: Database = functions.associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => decide(name, args),
) as {
    [F in typeof functions[number]]: Database[F];
};

export default db;