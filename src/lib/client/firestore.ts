import {
    collection,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    query,
    type QueryDocumentSnapshot,
    serverTimestamp,
    setDoc,
    type Timestamp,
    updateDoc,
    where,
    type WithFieldValue,
} from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import type { Raw } from '$lib/forms/Form';
import { get } from 'svelte/store';
import { checkAdmin, checkRegulusOrAdmin, currentUser } from './auth';
import { analytics, firestore } from '../../hooks.client';
import { type IRID, irWholeName, type SPID } from '$lib/helpers/ir';
import { offlineDatabase, offlineDatabaseManager as odm } from '$lib/client/offline.svelte';
import { deleteField, Query } from '@firebase/firestore';
import type { Database, ReadDatabase, WriteDatabase } from '$lib/Database';
import type { FormIN } from '$lib/forms/IN/formIN';
import { deletedIR, type DeletedIR, deletedNSP, type DeletedNSP, type ExistingIR, type ExistingNSP, type IR, type NSP } from '$lib/data';

const irCollection = collection(firestore, 'ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
});
const spCollection = collection(firestore, 'sp').withConverter<NSP>({
    toFirestore: (modelObject: WithFieldValue<NSP>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as NSP,
});

const checkCollection = collection(firestore, 'check');
const irDoc = (irid: IRID) => doc(irCollection, irid);
const spDoc = (spid: SPID) => doc(spCollection, spid);
const checkDoc = (irid: IRID) => doc(checkCollection, irid);

const getSnp = async <T>(reference: DocumentReference<T>) => {
    try {
        const snp = await getDoc(reference);
        return snp.exists() ? snp.data() : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
};
const getSnps = async <T>(reference: Query<T>) => {
    try {
        const snp = await getDocs(reference);
        return snp.docs
            .mapNotUndefined(snp => snp.exists() ? snp.data() : undefined);
    } catch (e) {
        console.error(e);
        return [];
    }
};

const shouldUpdateKeyChangeIR = async (irid: IRID, newIN: Raw<FormIN>, isDraft: boolean) => {
    const oldIR = await odm.get('IR', irid) as ExistingIR;
    return irWholeName(newIN) != irWholeName(oldIR.IN) || isDraft != oldIR.isDraft;
};

const addStampIR = (field: keyof IR | string, value: unknown) => ({
    [field]: value,
    'meta.changedAt': serverTimestamp() as Timestamp,
});

const readDatabase: ReadDatabase = {
    getIR: irid => getSnp(irDoc(irid))
        .thenAlso(v => odm.putOrDelete('IR', irid, v)),
    getChangedIRs: async lastUpdatedAt => {
        const user = get(currentUser);
        const q = await checkRegulusOrAdmin() ? query(
            irCollection,
            where('deleted', '!=', true),
            where('meta.keysChangedAt', '>', lastUpdatedAt),
        ) : query(
            irCollection,
            where('meta.usersWithAccess', 'array-contains', user?.email ?? ''),
            where('deleted', '!=', true),
            where('meta.keysChangedAt', '>', lastUpdatedAt),
        );
        return await getSnps(q) as ExistingIR[];
    },
    getDeletedIRs: async lastUpdatedAt => {
        const user = get(currentUser);
        const q = await checkRegulusOrAdmin() ? query(
            irCollection,
            where('deleted', '==', true),
            where('meta.deletedAt', '>', lastUpdatedAt),
        ) : query(
            irCollection,
            where('meta.usersWithAccess', 'array-contains', user?.email ?? ''),
            where('deleted', '==', true),
            where('meta.deletedAt', '>', lastUpdatedAt),
        );
        return await getSnps(q) as DeletedIR[];
    },
    existsIR: async irid => {
        try {
            await getDoc(checkDoc(irid));
            return true;
        } catch (e) {
            if ((e as Record<string, string>)?.code == 'permission-denied') return false;
            else throw e;
        }
    },

    getIndependentProtocol: spid => getSnp(spDoc(spid))
        .thenAlso(v => odm.putOrDelete('SP', spid, v)),
    getChangedIndependentProtocols: async lastUpdatedAt => await getSnps(query(
        spCollection,
        where('deleted', '!=', true),
        where('meta.createdAt', '>', lastUpdatedAt),
    )) as ExistingNSP[],
    getDeletedIndependentProtocols: async lastUpdatedAt => await getSnps(query(
        spCollection,
        where('deleted', '==', true),
        where('meta.deletedAt', '>', lastUpdatedAt),
    )) as DeletedNSP[],
};

const writeDatabase: WriteDatabase = {
    addIR: async ir => {
        if (await readDatabase.existsIR(ir.meta.id)) throw new Error(`IR ${ir.meta.id} already exists`);
        await setDoc(irDoc(ir.meta.id), ir);
    },
    deleteIR: async (irid, movedTo) => {
        const ir = await readDatabase.getIR(irid);
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        await setDoc(irDoc(irid), deletedIR(ir, movedTo));
    },
    updateIRRecord: async (irid, rawData, isDraft) => await updateDoc(irDoc(irid), {
        IN: rawData, isDraft,
        'meta.changedAt': serverTimestamp() as Timestamp,
        ...await shouldUpdateKeyChangeIR(irid, rawData, isDraft)
            ? { 'meta.keysChangedAt': serverTimestamp() as Timestamp } : {},
    }),
    addHeatPumpCheck: (irid, pump, year, check) =>
        updateDoc(irDoc(irid), addStampIR(`RK.TC.${pump}.${year}`, check)),
    addSolarSystemCheck: (irid, year, check) =>
        updateDoc(irDoc(irid), addStampIR(`RK.SOL.${year}`, check)),
    addServiceProtocol: async (irid, protocol) => {
        const ir = await readDatabase.getIR(irid);
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        await updateDoc(irDoc(irid), {
            SPs: [...ir.SPs, protocol],
            'meta.changedAt': serverTimestamp() as Timestamp,
            'meta.keysChangedAt': serverTimestamp() as Timestamp,
        });
    },
    updateServiceProtocol: (irid, index, protocol) =>
        updateDoc(irDoc(irid), addStampIR(`SPs.${index}`, protocol)),
    updateHeatPumpCommissioningProtocol: (irid, protocol) =>
        updateDoc(irDoc(irid), addStampIR(`UP.TC`, protocol)),
    updateHeatPumpCommissionDate: (irid, date) =>
        updateDoc(irDoc(irid), addStampIR(`UP.dateTC`, date)),
    addSolarSystemCommissioningProtocol: (irid, protocol) =>
        updateDoc(irDoc(irid), addStampIR(`UP.SOL`, protocol)),
    updateSolarSystemCommissionDate: (irid, date) =>
        updateDoc(irDoc(irid), addStampIR(`UP.dateSOL`, date)),
    addPhotovoltaicSystemCommissioningProtocol: (irid, protocol) =>
        updateDoc(irDoc(irid), addStampIR(`UP.FVE`, protocol)),
    addFaceTable: (irid, faceTable) =>
        updateDoc(irDoc(irid), addStampIR(`FT`, faceTable)),
    updateIRUsers: (irid, users) =>
        updateDoc(irDoc(irid), addStampIR(`meta.usersWithAccess`, users)),
    updateHeatPumpRecommendationsSettings: async (irid, enabled, executingCompany) => {
        const ir = await getSnp(irDoc(irid));
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        const dk = enabled ? {
            state: 'waiting',
            ...ir.RK.DK.TC ?? {},
            executingCompany: executingCompany!,
        } : deleteField();
        await updateDoc(irDoc(irid), addStampIR(`RK.DK.TC`, dk));
    },
    updateSolarSystemRecommendationsSettings: async (irid, enabled, executingCompany) => {
        const ir = await getSnp(irDoc(irid));
        if (!ir) throw new Error(`IR ${irid} doesn't exists`);
        if (ir.deleted) throw new Error(`IR ${irid} is deleted`);
        const dk = enabled ? {
            state: 'waiting',
            ...ir.RK.DK.SOL ?? {},
            executingCompany: executingCompany!,
        } : deleteField();
        await updateDoc(irDoc(irid), addStampIR(`RK.DK.SOL`, dk));
    },
    addIndependentServiceProtocol: async (nsp) => {
        if (await readDatabase.getIndependentProtocol(nsp.meta.id)) throw new Error(`NSP ${nsp.meta.id} already exists`);
        await setDoc(spDoc(nsp.meta.id), nsp);
    },
    updateIndependentServiceProtocol: (spid, protocol) => updateDoc(spDoc(spid), {
        ...protocol, 'meta.changedAt': serverTimestamp() as Timestamp, deleted: false,
    }),
    deleteIndependentProtocol: async spid => {
        const nsp = await readDatabase.getIndependentProtocol(spid);
        if (!nsp) throw new Error(`NSP ${spid} doesn't exists`);
        await setDoc(spDoc(spid), deletedNSP(nsp));
    },
};

export const firestoreDatabase: Database = [...readDatabase.keys(), ...writeDatabase.keys()].associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => {
        logEvent(analytics(), 'fetch_database', { name, args });
        if (name in readDatabase) {
            const func = readDatabase[name as keyof ReadDatabase];
            // @ts-expect-error TS doesn't know it's a tuple
            return func(...args);
        } else {
            const func = writeDatabase[name as keyof WriteDatabase];
            // @ts-expect-error TS doesn't know it's a tuple
            func(...args).then(result => {
                const func = offlineDatabase[name];
                // @ts-expect-error TS doesn't know it's a tuple
                func(...args);
                return result;
            });
        }
    },
) as Database;

export const adminDatabase = {
    getAllIRs: async () => {
        if (!await checkAdmin()) throw new Error('Unauthorized');
        return await getSnps(irCollection);
    },
    getAllNSPs: async () => {
        if (!await checkAdmin()) throw new Error('Unauthorized');
        return await getSnps(spCollection);
    },
}