import type { Deleted, IR } from '$lib/data';
import { derived, get, writable } from 'svelte/store';
import { type DBSchema as DBS, type IDBPDatabase, openDB } from 'idb';
import { extractIRID, extractIRIDFromRawData, extractSPID, extractSPIDFromRawData, type IRID, type SPID } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import { currentUser } from '$lib/client/auth';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { Database } from '$lib/Database';
import { serverTimestamp, type Timestamp, updateDoc } from 'firebase/firestore';

interface DBSchema extends DBS {
    IR: {
        key: IRID;
        value: IR | Deleted<IRID>;
    };
    SP: {
        key: SPID;
        value: Raw<FormNSP> | Deleted<SPID>;
    };
}

type Data<T extends 'IR' | 'SP'> = DBSchema[T]['value']
type ID<T extends 'IR' | 'SP'> = DBSchema[T]['key']

const storedIR = writable<Record<IRID, IR | Deleted<IRID>>>({}, (set) => {
    (async () => {
        set((await odm.getAll('IR')).associateBy(extractIRID));
    })();
});
const storedSP = writable<Record<SPID, Raw<FormNSP> | Deleted<SPID>>>({}, (set) => {
    (async () => {
        set((await odm.getAll('SP')).associateBy(extractSPID));
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
    return dbMap[uid] || (dbMap[uid] = await newDb(uid));
};

const mIR = (i: IR) => i;
const mSP = (s: Raw<FormNSP>) => s;
const m = <T extends 'IR' | 'SP'>(type: T) => (v: Data<T>) => (type === 'IR' ? mIR(v as IR) : mSP(v as Raw<FormNSP>)) as Data<T>;

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

export const offlineDatabase: Database = {
    getIR: irid => odm.get('IR', irid),
    getChangedIRs: async () => [],
    getDeletedIRs: async () => [],
    addIR: ir => odm.put('IR', extractIRIDFromRawData(ir.evidence), ir),
    deleteIR: async (irid, movedTo) => {
        const deleted: Deleted<IRID> = { deleted: true, deletedAt: serverTimestamp() as Timestamp, id: irid, movedTo };
        await odm.update('IR', irid, ir => ({ ...ir, ...deleted }));
    },
    existsIR: async irid => !!(await odm.get('IR', irid))?.let(ir => !ir.deleted),
    updateIRRecord: (rawData, isDraft) => {
        const irid = extractIRIDFromRawData(rawData);
        return odm.update('IR', irid, ir => ({ ...ir, evidence: rawData, isDraft }));
    },
    addHeatPumpCheck: (irid, pump, year, check) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.kontrolyTC[pump] = ir.kontrolyTC[pump] ?? {};
        ir.kontrolyTC[pump][year] = check;
        return ir;
    }),
    addSolarSystemCheck: (irid, year, check) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.kontrolySOL = ir.kontrolySOL ?? {};
        ir.kontrolySOL[year] = check;
        return ir;
    }),
    addServiceProtocol: (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.installationProtocols.push(protocol);
        return ir;
    }),
    updateServiceProtocol: async (irid, index, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.installationProtocols[index] = protocol;
        return ir;
    }),
    updateHeatPumpCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.uvedeniTC = protocol;
        return ir;
    }),
    updateHeatPumpCommissionDate: async (irid, date) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.heatPumpCommissionDate = date;
        return ir;
    }),
    addSolarSystemCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.uvedeniSOL = protocol;
        return ir;
    }),
    updateSolarSystemCommissionDate: async (irid, date) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.solarSystemCommissionDate = date;
        return ir;
    }),
    addPhotovoltaicSystemCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.uvedeniFVE = protocol;
        return ir;
    }),
    addFaceTable: async (irid, faceTable) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.faceTable = faceTable;
        return ir;
    }),
    updateIRUsers: async (irid, users) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.users = users;
        return ir;
    }),
    updateHeatPumpRecommendationsSettings: async (irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.yearlyHeatPumpCheckRecommendation = enabled ? {
            state: 'waiting',
            ...ir.yearlyHeatPumpCheckRecommendation ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        return ir;
    }),
    updateSolarSystemRecommendationsSettings: async (irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null) => odm.update('IR', irid, ir => {
        if (ir.deleted) return ir;
        ir.yearlySolarSystemCheckRecommendation = enabled ? {
            state: 'waiting',
            ...ir.yearlySolarSystemCheckRecommendation ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        return ir;
    }),
    addIndependentServiceProtocol: protocol => odm.put('SP', extractSPIDFromRawData(protocol.zasah), protocol),
    updateIndependentServiceProtocol: protocol => odm.put('SP', extractSPIDFromRawData(protocol.zasah), protocol),
    deleteIndependentProtocol: async spid => {
        const deleted: Deleted<SPID> = { deleted: true, deletedAt: serverTimestamp() as Timestamp, id: spid };
        await odm.update('SP', spid, sp => ({ ...sp, ...deleted }));
    },
    getIndependentProtocol: spid => odm.get('SP', spid),
    getChangedIndependentProtocols: async () => [],
    getDeletedIndependentProtocols: async () => [],
};

export const getOfflineStoreIR = (irid: IRID) =>
    derived(storedIR, irs => irs[irid]);
export const getOfflineStoreIndependentProtocol = (spid: SPID) =>
    derived(storedSP, sps => sps[spid]);