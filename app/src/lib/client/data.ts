import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { Kontrola } from '$lib/forms/Kontrola.svelte';
import type { UvedeniTC } from '$lib/forms/UvedeniTC';
import { type Readable } from 'svelte/store';
import type { UvedeniSOL } from '$lib/forms/UvedeniSOL';
import type { DataSP } from '$lib/forms/SP.svelte';
import type { DataSP2 } from '$lib/forms/SP2';
import type { IRID, SPID } from '$lib/helpers/ir';
import { getIsOnline } from '$lib/client/realtime';
import { firestoreDatabase } from '$lib/client/firestore';
import { addToOfflineQueue, offlineDatabase } from '$lib/client/offline.svelte';

export type IR = {
    evidence: Raw<Data>;
    uvedeniTC?: Raw<UvedeniTC>;
    uvedeniSOL?: Raw<UvedeniSOL>;
    kontrolyTC: {
        [P in 1 | 2 | 3 | 4]?: {
            [R in 1 | 2 | 3 | 4]?: Raw<Kontrola>;
        }
    };
    users: string[];
    installationProtocols: Raw<DataSP>[];
};

export interface Database {
    getIR(irid: IRID): Promise<IR | undefined>;

    getAllIRs(): Promise<IR[]>;

    getIRAsStore(irid: IRID): Readable<IR | undefined>;

    newIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID): Promise<void>;

    existsIR(irid: IRID): Promise<boolean>;

    updateIRRecord(rawData: Raw<Data>): Promise<void>;

    addHeatPumpCheck(irid: IRID, pump: 1 | 2 | 3 | 4, year: 1 | 2 | 3 | 4, check: Raw<Kontrola>): Promise<void>;

    addServiceProtocol(irid: IRID, protocol: Raw<DataSP>): Promise<void>;

    editServiceProtocol(irid: IRID, index: number, protocol: Raw<DataSP>): Promise<void>;

    addHeatPumpCommissioningProtocol(irid: IRID, protocol: Raw<UvedeniTC>): Promise<void>;

    addSolarSystemCommissioningProtocol(irid: IRID, protocol: Raw<UvedeniSOL>): Promise<void>;

    updateIRUsers(irid: IRID, users: string[]): Promise<void>;

    addIndependentServiceProtocol(protocol: Raw<DataSP2>): Promise<void>;

    deleteIndependentProtocol(spid: SPID): Promise<void>;

    getIndependentProtocol(spid: SPID): Promise<Raw<DataSP2> | undefined>;

    getAllIndependentProtocols(): Promise<Raw<DataSP2>[]>;
}

const decide = <F extends keyof Database>(name: F, args: Parameters<Database[F]>): ReturnType<Database[F]> => {
    const db = getIsOnline() ? firestoreDatabase : offlineDatabase;
    if (!getIsOnline()) addToOfflineQueue(name, args)
    // @ts-expect-error Whyyy?
    return db[name](...args);
};

const functions = [
    'getIR', 'getAllIRs', 'getIRAsStore', 'newIR', 'deleteIR', 'existsIR', 'updateIRRecord', 'addHeatPumpCheck', 'addServiceProtocol',
    'editServiceProtocol', 'addHeatPumpCommissioningProtocol', 'addSolarSystemCommissioningProtocol', 'updateIRUsers',
    'addIndependentServiceProtocol', 'deleteIndependentProtocol', 'getIndependentProtocol', 'getAllIndependentProtocols',
] as const;

const db: Database = functions.associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => decide(name, args)
) as {
    [F in typeof functions[number]]: Database[F];
};

export default db;