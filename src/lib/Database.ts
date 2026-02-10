import type { IRID, SPID } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { TC } from '$lib/forms/IN/defaultIN';
import type { FormRKT } from '$lib/forms/RKT/formRKT';
import type { FormRKS } from '$lib/forms/RKS/formRKS';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import type { FormFT } from '$lib/forms/FT/formFT';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { Readable } from 'svelte/store';
import type { DeletedIR, DeletedNSP, ExistingIR, ExistingNSP, IR, NSP, Year } from '$lib/data';
import type { Timestamp } from 'firebase/firestore';
import type { FormRKTL } from '$lib/forms/RKT/formRKTL';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { getIsOnline, isOnline } from '$lib/client/realtimeOnline';
import { flatDerived } from '$lib/helpers/stores';
import { firestoreDatabase } from '$lib/client/firestore';
import { offlineDatabase } from '$lib/client/offline.svelte';
import { addToOfflineQueue } from '$lib/client/offlineQueue.svelte';

/**
 * Supported actions:
 * - get
 * - getChanged
 * - getDeleted
 * - exists
 */
export interface ReadDatabase {
    getIR(irid: IRID): Promise<IR | undefined>;

    getChangedIRs(lastUpdatedAt: Timestamp | null): Promise<ExistingIR[]>;

    getDeletedIRs(lastUpdatedAt: Timestamp | null): Promise<DeletedIR[]>;

    existsIR(irid: IRID): Promise<boolean>;

    getNSP(spid: SPID): Promise<NSP | undefined>;

    getChangedNSPs(lastUpdatedAt: Timestamp | null): Promise<ExistingNSP[]>;

    getDeletedNSPs(lastUpdatedAt: Timestamp | null): Promise<DeletedNSP[]>;
}

/**
 * Supported actions:
 * - add
 * - delete
 * - update
 */
export interface WriteDatabase {
    addIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID, movedTo?: IRID): Promise<void>;

    updateIRRecord(irid: IRID, rawData: Raw<FormIN>, isDraft: boolean): Promise<void>;

    addHeatPumpCheck(irid: IRID, pump: TC, year: Year, check: Raw<FormRKT | FormRKTL>): Promise<void>;

    addSolarSystemCheck(irid: IRID, year: Year, check: Raw<FormRKS>): Promise<void>;

    addServiceProtocol(irid: IRID, protocol: Raw<FormSP>): Promise<void>;

    updateServiceProtocol(irid: IRID, index: number, protocol: Raw<FormSP>): Promise<void>;

    updateHeatPumpCommissioningProtocol(irid: IRID, protocol: Raw<FormUPT>): Promise<void>;

    updateHeatPumpCommissionDate(irid: IRID, date: string): Promise<void>;

    addSolarSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPS>): Promise<void>;

    updateSolarSystemCommissionDate(irid: IRID, date: string): Promise<void>;

    addPhotovoltaicSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPF>): Promise<void>;

    addFaceTable(irid: IRID, faceTable: Raw<FormFT>): Promise<void>;

    updateIRUsers(irid: IRID, users: string[]): Promise<void>;

    markRefsiteConfirmed(irid: IRID): Promise<void>;

    updateHeatPumpRecommendationsSettings(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    updateSolarSystemRecommendationsSettings(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    addIndependentServiceProtocol(protocol: NSP): Promise<void>;

    updateIndependentServiceProtocol(spid: SPID, protocol: Raw<FormNSP>): Promise<void>;

    deleteIndependentProtocol(spid: SPID): Promise<void>;
}

export interface Database extends ReadDatabase, WriteDatabase {
}

const databaseMethods = [
    'getIR', 'getChangedIRs', 'getDeletedIRs', 'addIR', 'deleteIR', 'existsIR', 'updateIRRecord', 'addHeatPumpCheck',
    'addSolarSystemCheck', 'addServiceProtocol', 'updateServiceProtocol', 'updateHeatPumpCommissioningProtocol',
    'updateHeatPumpCommissionDate', 'addSolarSystemCommissioningProtocol',
    'updateSolarSystemCommissionDate', 'addPhotovoltaicSystemCommissioningProtocol', 'updateIRUsers', 'markRefsiteConfirmed',
    'updateHeatPumpRecommendationsSettings', 'updateSolarSystemRecommendationsSettings', 'addIndependentServiceProtocol',
    'deleteIndependentProtocol', 'getNSP', 'getChangedNSPs',
    'getDeletedNSPs', 'addFaceTable', 'updateIndependentServiceProtocol',
] as const satisfies (keyof Database)[];


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