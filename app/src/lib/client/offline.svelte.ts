import { derived, get, writable } from 'svelte/store';
import { type DBSchema as DBS, type IDBPDatabase, openDB } from 'idb';
import { type IRID, type SPID } from '$lib/helpers/ir';
import { currentUser } from '$lib/client/auth';
import type { Database, ReadDatabase, WriteDatabase } from '$lib/Database';
import { serverTimestamp, type Timestamp } from 'firebase/firestore';
import { deletedIR, type DeletedNSP, type IR, type NSP } from '$lib/data';

interface DBSchema extends DBS {
    IR: {
        key: IRID;
        value: IR;
    };
    SP: {
        key: SPID;
        value: NSP;
    };
}

type Data<T extends 'IR' | 'SP'> = DBSchema[T]['value']
type ID<T extends 'IR' | 'SP'> = DBSchema[T]['key']

const storedIR = writable<Record<IRID, IR>>({}, (set) => {
    (async () => {
        set((await odm.getAll('IR')).associateBy(ir => ir.meta.id));
    })();
});
const storedSP = writable<Record<SPID, NSP>>({}, (set) => {
    (async () => {
        set((await odm.getAll('SP')).associateBy(nsp => nsp.meta.id));
    })();
});

let dbMap: Record<string, IDBPDatabase<DBSchema>> = {};

const newDb = (uid: string) => openDB<DBSchema>(`offlineData2_${uid}`, 1, {
    upgrade: db => {
        if (!db.objectStoreNames.contains('IR'))
            db.createObjectStore('IR');
        if (!db.objectStoreNames.contains('SP'))
            db.createObjectStore('SP');
    },
});

const db = async () => {
    const uid = get(currentUser)?.uid ?? 'anonymous';
    return dbMap[uid] || (dbMap[uid] = await newDb(uid));
};

const mIR = (i: IR) => i;
const mSP = (s: NSP) => s;
const m = <T extends 'IR' | 'SP'>(type: T) => (v: Data<T>) => (type === 'IR' ? mIR(v as IR) : mSP(v as NSP)) as Data<T>;

export const clearLocalDatabase = async () => {
    storedIR.set({})
    storedSP.set({})
    await (await db()).clear('IR');
    await (await db()).clear('SP');
};

const odm = {
    put: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>, value: Data<T>) => {
        const _db2 = await db();
        await _db2.put(type, $state.snapshot(value) as Data<T>, id);
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: value }));
        if (type === 'SP') storedSP.update(sp => ({ ...sp, [id]: value }));
    },
    delete: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>) => {
        await (await db()).delete(type, id);
        if (type === 'IR') storedIR.update(ir => ir.omit(id as ID<'IR'>));
        if (type === 'SP') storedSP.update(sp => sp.omit(id as ID<'SP'>));
    },
    get: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>) =>
        (await (await db()).get(type, id))?.let(m(type)),
    getAll: async <T extends 'IR' | 'SP'>(type: T) =>
        (await (await db()).getAll(type)).map(m(type)),
    setAll: async <T extends 'IR' | 'SP'>(type: T, values: { [id in ID<T>]: Data<T> }) => {
        await (await db()).transaction(type, 'readwrite').let(async tx => {
            tx.objectStore(type).clear();
            await values.mapTo((id, value) =>
                tx.objectStore(type).put(value, id),
            ).awaitAll();
            await tx.done;
        });
        if (type === 'IR') storedIR.set(values);
        if (type === 'SP') storedSP.set(values);
    },
    update: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>, update: (value: (Data<T>)) => Data<T>) => {
        const tx = (await db()).transaction(type, 'readwrite');
        const store = tx.objectStore(type);
        const current = (await store.get(id))?.let(m(type)) as Data<T>;
        const updated = update(current);
        // const uw = unwrap(store);
        // const rq = uw.put($state.snapshot(updated), id);
        // await wrap(rq);
        await store.put($state.snapshot(updated) as Data<T>, id);
        await tx.done;
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: updated }));
        if (type === 'SP') storedSP.update(sp => ({ ...sp, [id]: updated }));
    },
};

export const offlineDatabaseManager = {
    ...odm,
    putOrDelete: <T extends 'IR' | 'SP'>(type: T, id: ID<T>, value: Data<T> | undefined) =>
        value ? odm.put(type, id, value) : odm.delete(type, id),
};

const readDatabase: ReadDatabase = {
    getIR: irid => odm.get('IR', irid),
    getChangedIRs: async () => [],
    getDeletedIRs: async () => [],
    existsIR: async irid => Boolean(await odm.get('IR', irid)),

    getIndependentProtocol: spid => odm.get('SP', spid),
    getChangedIndependentProtocols: async () => [],
    getDeletedIndependentProtocols: async () => [],
};

const writeDatabase: WriteDatabase = {
    addIR: ir => odm.put('IR', ir.meta.id, ir),
    deleteIR: (irid, movedTo) => odm.update('IR', irid, ir => deletedIR(ir, movedTo)),
    updateIRRecord: (irid, rawData, isDraft) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.IN = rawData;
        ir.isDraft = isDraft;
        return ir;
    }),
    addHeatPumpCheck: (irid, pump, year, check) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.RK.TC[pump] = ir.RK.TC[pump] ?? {};
        ir.RK.TC[pump][year] = check;
        return ir;
    }),
    addSolarSystemCheck: (irid, year, check) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.RK.SOL = ir.RK.SOL ?? {};
        ir.RK.SOL[year] = check;
        return ir;
    }),
    addServiceProtocol: (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.SPs.push(protocol);
        return ir;
    }),
    updateServiceProtocol: async (irid, index, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.SPs[index] = protocol;
        return ir;
    }),
    updateHeatPumpCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.UP.TC = protocol;
        return ir;
    }),
    updateHeatPumpCommissionDate: async (irid, date) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.UP.dateTC = date;
        return ir;
    }),
    addSolarSystemCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.UP.SOL = protocol;
        return ir;
    }),
    updateSolarSystemCommissionDate: async (irid, date) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.UP.dateTC = date;
        return ir;
    }),
    addPhotovoltaicSystemCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.UP.FVE = protocol;
        return ir;
    }),
    addFaceTable: async (irid, faceTable) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.FT = faceTable;
        return ir;
    }),
    updateIRUsers: async (irid, users) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.meta.usersWithAccess = users;
        return ir;
    }),
    updateHeatPumpRecommendationsSettings: async (irid, enabled, executingCompany) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.RK.DK.TC = enabled ? {
            state: 'waiting',
            ...ir.RK.DK.TC ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        return ir;
    }),
    updateSolarSystemRecommendationsSettings: async (irid, enabled, executingCompany) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.RK.DK.SOL = enabled ? {
            state: 'waiting',
            ...ir.RK.DK.SOL ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        return ir;
    }),

    addIndependentServiceProtocol: nsp => odm.put('SP', nsp.meta.id, nsp),
    updateIndependentServiceProtocol: (spid, rawData) => odm.update('SP', spid, nsp => {
        if (nsp.deleted) return nsp;
        nsp.NSP = rawData;
        return nsp;
    }),
    deleteIndependentProtocol: async spid => await odm.update('SP', spid, sp => ({
        ...sp,
        deleted: true,
        meta: {
            ...sp.meta,
            deletedAt: serverTimestamp() as Timestamp,
        },
    } satisfies DeletedNSP)),
};

export const offlineDatabase: Database = {
    ...readDatabase,
    ...writeDatabase,
};

export const getOfflineStoreIR = (irid: IRID) =>
    derived(storedIR, irs => irs[irid]);
export const getOfflineStoreIndependentProtocol = (spid: SPID) =>
    derived(storedSP, sps => sps[spid]);