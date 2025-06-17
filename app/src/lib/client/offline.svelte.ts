import { storable } from '$lib/helpers/stores';
import type { Database, DataOfType, ID, IR } from '$lib/client/data';
import { derived, get, writable } from 'svelte/store';
import { firestoreDatabase } from '$lib/client/firestore';
import { type DBSchema as DBS, type IDBPDatabase, openDB } from 'idb';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, type SPID } from '$lib/helpers/ir';
import type { DataSP2 } from '$lib/forms/SP2';
import type { Raw } from '$lib/forms/Form';
import { currentUser, getToken } from '$lib/client/auth';
import { type LegacyIR, type LegacySP, migrateSP, modernizeIR } from '$lib/client/migrations';
import { isOnline } from '$lib/client/realtime';
import type { EmailMessage } from '$lib/client/email';

interface DBSchema extends DBS {
    IR: {
        key: IRID;
        value: IR;
    };
    SP: {
        key: SPID;
        value: Raw<DataSP2>;
    };
}

type DOT<T extends 'IR' | 'SP'> = DBSchema[T]['value']

const storedIR = writable<Record<IRID, IR>>({}, (set) => {
    (async () => {
        set((await odm.getAll('IR')).associateBy(ir => extractIRIDFromRawData(ir.evidence)));
    })();
});

let dbMap: Record<string, IDBPDatabase<DBSchema>> = {};

const newDb = (uid: string) => openDB<DBSchema>(`offlineData_${uid}`, 1, {
    upgrade: db => {
        if (!db.objectStoreNames.contains('IR'))
            db.createObjectStore('IR');
        if (!db.objectStoreNames.contains('SP'))
            db.createObjectStore('SP');
    },
});

const db = async () => {
    const uid = get(currentUser)?.uid ?? 'anonymous';
    console.log(uid)
    return dbMap[uid] || (dbMap[uid] = await newDb(uid));
};

const mIR = (i: IR) => modernizeIR(i as LegacyIR & IR);
const mSP = (s: Raw<DataSP2>) => migrateSP(s as LegacySP & Raw<DataSP2>) as Raw<DataSP2>;
const m = <T extends 'IR' | 'SP'>(type: T) => (v: DOT<T>) => (type === 'IR' ? mIR(v as IR) : mSP(v as Raw<DataSP2>)) as DOT<T>;

const odm = {
    put: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>, value: DataOfType<T>) => {
        const _db2 = await db();
        await _db2.put(type, $state.snapshot(value), id);
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: value }));
    },
    delete: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>) => {
        await (await db()).delete(type, id);
        if (type === 'IR') storedIR.update(ir => ir.omit(id as ID<'IR'>));
    },
    get: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>) =>
        (await (await db()).get(type, id))?.let(m(type)),
    getAll: async <T extends 'IR' | 'SP'>(type: T) =>
        (await (await db()).getAll(type)).map(m(type)),
    putAll: async <T extends 'IR' | 'SP'>(type: T, values: { [id in ID<T>]: DataOfType<T> }) => {
        await (await db()).transaction(type, 'readwrite').let(async tx => {
            await values.mapTo((id, value) =>
                tx.objectStore(type).put(value, id),
            ).awaitAll();
            await tx.done;
        });
        if (type === 'IR') storedIR.update(ir => ({ ...ir, ...values }));
    },
    update: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>, update: (value: (DataOfType<T> | undefined)) => DataOfType<T>) => {
        const tx = (await db()).transaction(type, 'readwrite');
        const store = tx.objectStore(type);
        const current = (await store.get(id))?.let(m(type)) as DataOfType<T>;
        const updated = update(current);
        // const uw = unwrap(store);
        // const rq = uw.put($state.snapshot(updated), id);
        // await wrap(rq);
        await store.put($state.snapshot(updated), id);
        await tx.done;
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: updated }));
    },
};

export const offlineDatabaseManager = {
    ...odm,
    putOrDelete: <T extends 'IR' | 'SP'>(type: T, id: ID<T>, value: DataOfType<T> | undefined) =>
        value ? odm.put(type, id, value) : odm.delete(type, id),
};

type DoWhenOnline<F extends keyof Database = keyof Database> = {
    type: 'database'
    functionName: F;
    args: Parameters<Database[F]>;
} | {
    type: 'email',
    message: EmailMessage,
};

const doWhenOnlineQueue = storable<DoWhenOnline[]>('doWhenOnlineQueue', []);

export const addToOfflineQueue = <F extends keyof Database = keyof Database>(
    functionName: F,
    args: Parameters<Database[F]>,
) => {
    console.log('Adding', functionName, 'with args', ...args, 'to the offline queue');
    doWhenOnlineQueue.update(q => [...q, { functionName, args, type: 'database' }]);
};

export const addEmailToOfflineQueue = (message: EmailMessage) => {
    console.log('Adding email', message, 'to the offline queue');
    doWhenOnlineQueue.update(q => [...q, { message, type: 'email' }]);
};

const processOfflineQueue = async () => {
    const current = get(doWhenOnlineQueue);
    await current.map(async dwo => {
        if (dwo.type === 'email') {
            const { message } = dwo;
            console.log('Sending email', message, 'from the offline queue');
            const token = await getToken();
            await fetch(`/api/sendEmail?token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ message }),
                headers: {
                    'content-type': 'application/json',
                },
            });
        } else {
            const { args, functionName } = dwo;
            console.log('Executing', functionName, 'with args', ...args, 'from the offline queue');
            const func = firestoreDatabase[functionName];
            // @ts-expect-error Whyyy?
            func(...args);
        }
    }).awaitAll();

    doWhenOnlineQueue.update(q => q.slice(current.length));
    const after = get(doWhenOnlineQueue);
    if (after.length) await processOfflineQueue();
};

isOnline.subscribe(async online => {
    if (online) await processOfflineQueue();
});

export const offlineDatabase: Database = {
    getIR: async irid => await odm.get('IR', irid),
    getAllIRs: () => odm.getAll('IR'),
    getIRAsStore: irid => derived(storedIR, irs => irs[irid]),
    newIR: ir => odm.put('IR', extractIRIDFromRawData(ir.evidence), ir),
    deleteIR: irid => odm.delete('IR', irid),
    existsIR: async irid => irid in get(storedIR),
    updateIRRecord: rawData => {
        const irid = extractIRIDFromRawData(rawData);
        return odm.update('IR', irid, ir => ({ ...ir!, evidence: rawData }));
    },
    addHeatPumpCheck: (irid, pump, year, check) => odm.update('IR', irid, ir => {
        ir!.kontrolyTC[pump] = ir!.kontrolyTC[pump] ?? {};
        ir!.kontrolyTC[pump][year] = check;
        return ir!;
    }),
    addServiceProtocol: (irid, protocol) => odm.update('IR', irid, ir => {
        ir!.installationProtocols.push(protocol);
        return ir!;
    }),
    editServiceProtocol: async (irid, index, protocol) => odm.update('IR', irid, ir => {
        ir!.installationProtocols[index] = protocol;
        return ir!;
    }),
    addHeatPumpCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        ir!.uvedeniTC = protocol;
        return ir!;
    }),
    addSolarSystemCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        ir!.uvedeniSOL = protocol;
        return ir!;
    }),
    updateIRUsers: async (irid, users) => odm.update('IR', irid, ir => {
        ir!.users = users;
        return ir!;
    }),
    addIndependentServiceProtocol: protocol => odm.put('SP', extractSPIDFromRawData(protocol.zasah), protocol),
    deleteIndependentProtocol: spid => odm.delete('SP', spid),
    getIndependentProtocol: spid => odm.get('SP', spid),
    getAllIndependentProtocols: () => odm.getAll('SP'),
};