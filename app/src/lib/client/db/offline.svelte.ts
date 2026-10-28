import { getUser } from '$lib/client/auth';
import { type Database, isWriteFunctionIR, type ReadDatabase, type WriteDatabase } from '$lib/client/db/def';
import { updates } from '$lib/client/db/performChange';
import { type Data, type DataType, deletedIR, type ID, type IR, type NSP } from '$lib/data';
import { removeSignaturesFromData } from '$lib/features/signing/actions/changes';
import { type IRID, type NSPID } from '$lib/helpers/ir';
import { type IDBPDatabase, openDB } from 'idb';
import { derived, writable } from 'svelte/store';

type DBSchema = {
    IR: {
        key: IRID;
        value: IR;
    };
    NSP: {
        key: NSPID;
        value: NSP;
    };
}


const storedIR = writable<Record<IRID, IR>>({}, (set) => {
    (async () => {
        set((await odm.getAll('IR')).associateBy(ir => ir.meta.id));
    })();
});
const storedSP = writable<Record<NSPID, NSP>>({}, (set) => {
    (async () => {
        set((await odm.getAll('NSP')).associateBy(nsp => nsp.meta.id));
    })();
});

let dbMap: Record<string, IDBPDatabase<DBSchema>> = {};

const newDb = (email: string) => openDB<DBSchema>(`offlineData2_${email}`, 2, {
    upgrade: db => {
        if (!db.objectStoreNames.contains('IR'))
            db.createObjectStore('IR');
        if (!db.objectStoreNames.contains('NSP'))
            db.createObjectStore('NSP');
    },
});

const db = async () => {
    const email = (await getUser())?.email ?? 'anonymous';
    return dbMap[email] || (dbMap[email] = await newDb(email));
};

export const clearLocalDatabase = async () => {
    storedIR.set({});
    storedSP.set({});
    await (await db()).clear('IR');
    await (await db()).clear('NSP');
};

const odm = {
    set: async <T extends DataType>(type: T, id: ID<T>, value: Data<T>) => {
        await (await db()).put(type, $state.snapshot(value) as Data<T>, id);
        if (type === 'IR') storedIR.update(ir => ({ ...ir, [id]: value }));
        if (type === 'NSP') storedSP.update(sp => ({ ...sp, [id]: value }));
    },
    get: async <T extends DataType>(type: T, id: ID<T>) =>
        await (await db()).get(type, id) as Data<T>,
    getAll: async <T extends DataType>(type: T) =>
        await (await db()).getAll(type) as Data<T>[],
    setAll: async <T extends DataType>(type: T, values: { [id in ID<T>]: Data<T> }) => {
        console.trace('set', values.keys());
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
    update: async <T extends DataType>(type: T, id: ID<T>, update: (value: (Data<T>)) => Data<T> | Promise<Data<T>>) => {
        const current = await odm.get(type, id);
        const updated = await update(current! as Data<T>);
        await odm.set(type, id, $state.snapshot(updated) as Data<T>);
    },
};

export const offlineDatabaseManager = odm;

const readDatabase: ReadDatabase = {
    getIR: irid => odm.get('IR', irid),
    getChangedIRs: async () => [],
    existsIR: async irid => Boolean(await odm.get('IR', irid)),

    getNSP: nspid => odm.get('NSP', nspid),
    getChangedNSPs: async () => [],
};

const simpleUpdates = updates.keys().associateWith(name =>
    (...[id, ...args]: Parameters<WriteDatabase[typeof name]>) =>
        odm.update(isWriteFunctionIR(name) ? 'IR' : 'NSP', id, oldData => {
            const updateFunction = updates[name];
            // @ts-expect-error TS doesn't know it's a tuple
            const newData = updateFunction(oldData, ...args);
            return oldData.deleted || newData.deleted ? newData
                : removeSignaturesFromData(oldData, newData);
        }),
) as Pick<WriteDatabase, keyof typeof updates>;

const writeDatabase: WriteDatabase = {
    ...simpleUpdates,
    addIR: ir => odm.set('IR', ir.meta.id, ir),
    moveIR: async (oldIRID, newIR) => {
        const newIRID = newIR.meta.id;
        if (await readDatabase.existsIR(newIRID)) throw new Error(`IR ${newIRID} already exists`);

        const oldIR = await readDatabase.getIR(oldIRID);
        if (!oldIR) throw new Error(`IR ${oldIRID} doesn't exists`);

        const withoutSignatures = oldIR.deleted || newIR.deleted ? newIR
            : await removeSignaturesFromData<'IR'>(oldIR, newIR);

        await odm.set('IR', newIRID, withoutSignatures);
        await odm.update('IR', oldIRID, _ => deletedIR(oldIR, newIRID));
    },

    addNSP: nsp => odm.set('NSP', nsp.meta.id, nsp),
};

export const offlineDatabase: Database = {
    ...readDatabase,
    ...writeDatabase,
};

export const getOfflineStoreIR = (irid: IRID) =>
    derived(storedIR, irs => irs[irid]);
export const getOfflineStoreIndependentProtocol = (nspid: NSPID) =>
    derived(storedSP, sps => sps[nspid]);