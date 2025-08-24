import type { Database, IR } from '$lib/data';
import { derived, get, writable } from 'svelte/store';
import { type DBSchema as DBS, type IDBPDatabase, openDB } from 'idb';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, type SPID } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import { currentUser } from '$lib/client/auth';
import type { FormNSP } from '$lib/forms/NSP/formNSP';

interface DBSchema extends DBS {
    IR: {
        key: IRID;
        value: IR;
    };
    SP: {
        key: SPID;
        value: Raw<FormNSP>;
    };
}

type Data<T extends 'IR' | 'SP'> = DBSchema[T]['value']
type ID<T extends 'IR' | 'SP'> = DBSchema[T]['key']

const storedIR = writable<Record<IRID, IR>>({}, (set) => {
    (async () => {
        set((await odm.getAll('IR')).associateBy(ir => extractIRIDFromRawData(ir.evidence)));
    })();
});
const storedSP = writable<Record<SPID, Raw<FormNSP>>>({}, (set) => {
    (async () => {
        set((await odm.getAll('SP')).associateBy(sp => extractSPIDFromRawData(sp.zasah)));
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
    console.log(uid);
    return dbMap[uid] || (dbMap[uid] = await newDb(uid));
};

const mIR = (i: IR) => i
const mSP = (s: Raw<FormNSP>) => s;
const m = <T extends 'IR' | 'SP'>(type: T) => (v: Data<T>) => (type === 'IR' ? mIR(v as IR) : mSP(v as Raw<FormNSP>)) as Data<T>;

const odm = {
    put: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>, value: Data<T>) => {
        const _db2 = await db();
        await _db2.put(type, $state.snapshot(value), id);
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
    putAll: async <T extends 'IR' | 'SP'>(type: T, values: { [id in ID<T>]: Data<T> }) => {
        await (await db()).transaction(type, 'readwrite').let(async tx => {
            await values.mapTo((id, value) =>
                tx.objectStore(type).put(value, id),
            ).awaitAll();
            await tx.done;
        });
        if (type === 'IR') storedIR.update(ir => ({ ...ir, ...values }));
        if (type === 'SP') storedSP.update(sp => ({ ...sp, ...values }));
    },
    update: async <T extends 'IR' | 'SP'>(type: T, id: ID<T>, update: (value: (Data<T> | undefined)) => Data<T>) => {
        const tx = (await db()).transaction(type, 'readwrite');
        const store = tx.objectStore(type);
        const current = (await store.get(id))?.let(m(type)) as Data<T>;
        const updated = update(current);
        // const uw = unwrap(store);
        // const rq = uw.put($state.snapshot(updated), id);
        // await wrap(rq);
        await store.put($state.snapshot(updated), id);
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
    getAllIRs: () => odm.getAll('IR'),
    getAllIRsAsStore: () => derived(storedIR, irs => irs.getValues()),
    getIRAsStore: irid => derived(storedIR, irs => irs[irid]),
    addIR: ir => odm.put('IR', extractIRIDFromRawData(ir.evidence), ir),
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
    updateServiceProtocol: async (irid, index, protocol) => odm.update('IR', irid, ir => {
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
    addPhotovoltaicSystemCommissioningProtocol: async (irid, protocol) => odm.update('IR', irid, ir => {
        ir!.uvedeniFVE = protocol;
        return ir!;
    }),
    addFaceTable: async (irid, faceTable) => odm.update('IR', irid, ir => {
        ir!.faceTable = faceTable;
        return ir!;
    }),
    updateIRUsers: async (irid, users) => odm.update('IR', irid, ir => {
        ir!.users = users;
        return ir!;
    }),
    addIndependentServiceProtocol: protocol => odm.put('SP', extractSPIDFromRawData(protocol.zasah), protocol),
    updateIndependentServiceProtocol: protocol => odm.put('SP', extractSPIDFromRawData(protocol.zasah), protocol),
    deleteIndependentProtocol: spid => odm.delete('SP', spid),
    getIndependentProtocol: spid => odm.get('SP', spid),
    getIndependentProtocolAsStore: spid => derived(storedSP, sps => sps[spid]),
    getAllIndependentProtocols: () => odm.getAll('SP'),
    getAllIndependentProtocolsAsStore: () => derived(storedSP, sps => sps.getValues()),
};