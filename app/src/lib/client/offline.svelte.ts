import { derived, get, writable } from 'svelte/store';
import { type DBSchema as DBS, type IDBPDatabase, openDB } from 'idb';
import { type IRID, type SPID } from '$lib/helpers/ir';
import { currentUser } from '$lib/client/auth';
import type { Database, ReadDatabase, WriteDatabase } from '$lib/Database';
import { serverTimestamp, type Timestamp } from 'firebase/firestore';
import { type Data, type DataType, deletedIR, type DeletedNSP, type ID, type IR, type NSP } from '$lib/data';

type DBSchema = {
    IR: {
        key: IRID;
        value: IR;
    };
    NSP: {
        key: SPID;
        value: NSP;
    };
}


const storedIR = writable<Record<IRID, IR>>({}, (set) => {
    (async () => {
        set((await odm.getAll('IR')).associateBy(ir => ir.meta.id));
    })();
});
const storedSP = writable<Record<SPID, NSP>>({}, (set) => {
    (async () => {
        set((await odm.getAll('NSP')).associateBy(nsp => nsp.meta.id));
    })();
});

let dbMap: Record<string, IDBPDatabase<DBSchema>> = {};

const newDb = (uid: string) => openDB<DBSchema>(`offlineData2_${uid}`, 2, {
    upgrade: db => {
        if (!db.objectStoreNames.contains('IR'))
            db.createObjectStore('IR');
        if (!db.objectStoreNames.contains('NSP'))
            db.createObjectStore('NSP');
    },
});

const db = async () => {
    const uid = get(currentUser)?.uid ?? 'anonymous';
    return dbMap[uid] || (dbMap[uid] = await newDb(uid));
};

export const clearLocalDatabase = async () => {
    storedIR.set({})
    storedSP.set({})
    await (await db()).clear('IR');
    await (await db()).clear('NSP');
};

const odm = {
    put: async <T extends DataType>(type: T, id: ID<T>, value: Data<T>) => {
        const _db2 = await db();
        await _db2.put(type, $state.snapshot(value) as Data<T>, id);
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: value }));
        if (type === 'NSP') storedSP.update(sp => ({ ...sp, [id]: value }));
    },
    delete: async <T extends DataType>(type: T, id: ID<T>) => {
        await (await db()).delete(type, id);
        if (type === 'IR') storedIR.update(ir => ir.omit(id as ID<'IR'>));
        if (type === 'NSP') storedSP.update(sp => sp.omit(id as ID<'NSP'>));
    },
    get: async <T extends DataType>(type: T, id: ID<T>) =>
        await (await db()).get(type, id) as Data<T>,
    getAll: async <T extends DataType>(type: T) =>
        await (await db()).getAll(type) as Data<T>[],
    setAll: async <T extends DataType>(type: T, values: { [id in ID<T>]: Data<T> }) => {
        await (await db()).transaction(type, 'readwrite').let(async tx => {
            tx.objectStore(type).clear();
            await values.mapTo((id, value) =>
                tx.objectStore(type).put(value, id),
            ).awaitAll();
            await tx.done;
        });
        if (type === 'IR') storedIR.set(values);
        if (type === 'NSP') storedSP.set(values);
    },
    update: async <T extends DataType>(type: T, id: ID<T>, update: (value: (Data<T>)) => Data<T>) => {
        const tx = (await db()).transaction(type, 'readwrite');
        const store = tx.objectStore(type);
        const current = await store.get(id);
        const updated = update(current! as Data<T>);
        // const uw = unwrap(store);
        // const rq = uw.put($state.snapshot(updated), id);
        // await wrap(rq);
        await store.put($state.snapshot(updated) as Data<T>, id);
        await tx.done;
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: updated }));
        if (type === 'NSP') storedSP.update(sp => ({ ...sp, [id]: updated }));
    },
};

export const offlineDatabaseManager = {
    ...odm,
    putOrDelete: <T extends DataType>(type: T, id: ID<T>, value: Data<T> | undefined) =>
        value ? odm.put(type, id, value) : odm.delete(type, id),
};

const readDatabase: ReadDatabase = {
    getIR: irid => odm.get('IR', irid),
    getChangedIRs: async () => [],
    getDeletedIRs: async () => [],
    existsIR: async irid => Boolean(await odm.get('IR', irid)),

    getNSP: spid => odm.get('NSP', spid),
    getChangedNSPs: async () => [],
    getDeletedNSPs: async () => [],
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

    addIndependentServiceProtocol: nsp => odm.put('NSP', nsp.meta.id, nsp),
    updateIndependentServiceProtocol: (spid, rawData) => odm.update('NSP', spid, nsp => {
        if (nsp.deleted) return nsp;
        nsp.NSP = rawData;
        return nsp;
    }),
    deleteIndependentProtocol: async spid => await odm.update('NSP', spid, sp => ({
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