import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormRK } from '$lib/forms/RK/formRK.js';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { type Readable } from 'svelte/store';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import type { FormSP } from '$lib/forms/SP/formSP.svelte.js';
import type { IRID, SPID } from '$lib/helpers/ir';
import { getIsOnline } from '$lib/client/realtime';
import { offlineDatabase } from '$lib/client/offline.svelte';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import { addToOfflineQueue } from '$lib/client/offlineQueue';
import type { TC } from '$lib/forms/IN/defaultIN';
import { firestoreDatabase } from '$lib/client/firestore';

export type Year = 1 | 2 | 3 | 4;

export type IR = {
    evidence: Raw<FormIN>;
    uvedeniTC?: Raw<FormUPT>;
    uvedeniSOL?: Raw<FormUPS>;
    uvedeniFVE?: Raw<FormUPF>;
    kontrolyTC: {
        [P in TC]?: {
            [R in Year]?: Raw<FormRK>;
        }
    };
    users: string[];
    installationProtocols: Raw<FormSP>[];
};

/**
 * Supported read actions:
 * - get
 * - getAll
 * - get*AsStore
 * - exists
 *
 * Supported write actions:
 * - add
 * - delete
 * - update
 */
export interface Database {
    getIR(irid: IRID): Promise<IR | undefined>;

    getAllIRs(): Promise<IR[]>;

    getIRAsStore(irid: IRID): Readable<IR | undefined>;

    addIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID): Promise<void>;

    existsIR(irid: IRID): Promise<boolean>;

    updateIRRecord(rawData: Raw<FormIN>): Promise<void>;

    addHeatPumpCheck(irid: IRID, pump: TC, year: Year, check: Raw<FormRK>): Promise<void>;

    addServiceProtocol(irid: IRID, protocol: Raw<FormSP>): Promise<void>;

    editServiceProtocol(irid: IRID, index: number, protocol: Raw<FormSP>): Promise<void>;

    addHeatPumpCommissioningProtocol(irid: IRID, protocol: Raw<FormUPT>): Promise<void>;

    addSolarSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPS>): Promise<void>;

    addPhotovoltaicSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPF>): Promise<void>;

    updateIRUsers(irid: IRID, users: string[]): Promise<void>;

    addIndependentServiceProtocol(protocol: Raw<FormNSP>): Promise<void>;

    deleteIndependentProtocol(spid: SPID): Promise<void>;

    getIndependentProtocol(spid: SPID): Promise<Raw<FormNSP> | undefined>;

    getAllIndependentProtocols(): Promise<Raw<FormNSP>[]>;
}

const decide = <F extends keyof Database>(name: F, args: Parameters<Database[F]>): ReturnType<Database[F]> => {
    console.log('Querying', name, 'with args', ...args);
    // @ts-expect-error TS doesn't know it's a tuple
    const result = offlineDatabase[name](...args) as ReturnType<Database[F]>;

    // @ts-expect-error TS doesn't know it's a tuple
    if (getIsOnline()) firestoreDatabase[name](...args);
    else addToOfflineQueue(name, args);

    return result;
};

const functions = [
    'getIR', 'getAllIRs', 'getIRAsStore', 'addIR', 'deleteIR', 'existsIR', 'updateIRRecord', 'addHeatPumpCheck', 'addServiceProtocol',
    'editServiceProtocol', 'addHeatPumpCommissioningProtocol', 'addSolarSystemCommissioningProtocol',
    'addPhotovoltaicSystemCommissioningProtocol', 'updateIRUsers', 'addIndependentServiceProtocol', 'deleteIndependentProtocol',
    'getIndependentProtocol', 'getAllIndependentProtocols',
] as const;

export type WriteFunction = {
    [F in keyof Database]: F extends `add${string}` ? F : F extends `update${string}` ? F : F extends `delete${string}` ? F : never;
}[keyof Database];

export const isWriteFunction = (name: keyof Database): name is WriteFunction =>
    ['add', 'update', 'delete'].some(prefix => name.startsWith(prefix));

const db: Database = functions.associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => decide(name, args),
) as {
    [F in typeof functions[number]]: Database[F];
};

export default db;