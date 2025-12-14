import {
    collection,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    onSnapshot,
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
import { get, readonly, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser } from './auth';
import { analytics, firestore } from '../../hooks.client';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, irWholeName, type SPID } from '$lib/helpers/ir';
import { type Deleted, type IR } from '$lib/data';
import { offlineDatabaseManager as odm } from '$lib/client/offline.svelte';
import { deleteField, Query } from '@firebase/firestore';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { type Database, databaseMethods } from '$lib/Database';
import type { FormIN } from '$lib/forms/IN/formIN';

const irCollection = collection(firestore, 'ir').withConverter<IR | Deleted<IRID>>({
    toFirestore: (modelObject: WithFieldValue<IR | Deleted<IRID>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR | Deleted<IRID>,
});
const spCollection = collection(firestore, 'sp').withConverter<Raw<FormNSP> & { deleted: false } | Deleted<SPID>>({
    toFirestore: (modelObject: WithFieldValue<Raw<FormNSP> & { deleted: false } | Deleted<SPID>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Raw<FormNSP> & { deleted: false } | Deleted<SPID>,
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
const getAsStore = <T>(reference: DocumentReference<T>) => {
    const currentState = writable<T | undefined | 'loading'>('loading');
    onSnapshot(reference, data => {
        logEvent(analytics(), 'snapshot');
        currentState.set(data.exists() ? data.data() : undefined);
    });
    return readonly(currentState);
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

const shouldUpdateKeyChangeIR = async (newIR: Raw<FormIN>) => {
    const oldIR = await odm.get('IR', extractIRIDFromRawData(newIR)) as IR;
    return irWholeName(newIR) != irWholeName(oldIR.evidence);
};

const addStampIR = (field: string, value: unknown) => ({
    [field]: value,
    changedAt: serverTimestamp() as Timestamp,
});

const baseDatabase: Database = {
    getIR: irid => getSnp(irDoc(irid))
        .thenAlso(v => odm.putOrDelete('IR', irid, v)),
    getChangedIRs: async lastUpdatedAt => {
        const user = get(currentUser);
        const q = await checkRegulusOrAdmin() ? query(
            irCollection,
            where('deleted', '!=', true),
            where('keysChangedAt', '>', lastUpdatedAt),
        ) : query(
            irCollection,
            where('users', 'array-contains', user?.email ?? ''),
            where('deleted', '!=', true),
            where('keysChangedAt', '>', lastUpdatedAt),
        );
        return await getSnps(q) as IR[];
    },
    getDeletedIRs: async lastUpdatedAt => {
        const user = get(currentUser);
        const q = await checkRegulusOrAdmin() ? query(
            irCollection,
            where('deleted', '==', true),
            where('deletedAt', '>', lastUpdatedAt),
        ) : query(
            irCollection,
            where('users', 'array-contains', user?.email ?? ''),
            where('deleted', '==', true),
            where('deletedAt', '>', lastUpdatedAt),
        );
        return await getSnps(q) as Deleted<IRID>[];
    },
    getIRAsStore: irid => getAsStore(irDoc(irid))
        .also(r => r.subscribe(v => v != 'loading' ? odm.putOrDelete('IR', irid, v) : 0)),
    addIR: async ir => {
        const irid = extractIRIDFromRawData(ir.evidence);
        await setDoc(irDoc(irid), ir);
        await odm.put('IR', irid, ir);
    },
    deleteIR: async (irid, movedTo) => {
        const deleted: Deleted<IRID> = { deleted: true, deletedAt: serverTimestamp() as Timestamp, id: irid, movedTo };
        await updateDoc(irDoc(irid), deleted);
        await odm.update('IR', irid, ir => ({ ...ir, ...deleted }));
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
    updateIRRecord: async (rawData, isDraft) => {
        const irid = extractIRIDFromRawData(rawData);
        await updateDoc(irDoc(irid), {
            evidence: rawData, isDraft, changedAt: serverTimestamp() as Timestamp,
            ...await shouldUpdateKeyChangeIR(rawData) ? { keysChangedAt: serverTimestamp() as Timestamp } : {},
        });
        await updateDoc(irDoc(irid), `isDraft`, isDraft);
        await odm.update('IR', irid, ir => ({ ...ir!, evidence: rawData, isDraft }));
    },
    addHeatPumpCheck: async (irid, pump, year, check) => {
        await updateDoc(irDoc(irid), addStampIR(`kontrolyTC.${pump}.${year}`, check));
        await odm.update('IR', irid, ir => {
            if (ir.deleted) return ir;
            ir!.kontrolyTC[pump] = ir!.kontrolyTC[pump] ?? {};
            ir!.kontrolyTC[pump][year] = check;
            return ir!;
        });
    },
    addSolarSystemCheck: async (irid, year, check) => {
        await updateDoc(irDoc(irid), addStampIR(`kontrolySOL.${year}`, check));
        await odm.update('IR', irid, ir => {
            if (ir.deleted) return ir;
            ir!.kontrolySOL = ir!.kontrolySOL ?? {};
            ir!.kontrolySOL[year] = check;
            return ir!;
        });
    },
    addServiceProtocol: async (irid, protocol) => {
        const ir = await getSnp(irDoc(irid));
        if (!ir || ir.deleted) return;
        ir!.installationProtocols.push(protocol);
        await updateDoc(irDoc(irid), {
            installationProtocols: ir!.installationProtocols,
            changedAt: serverTimestamp() as Timestamp,
            keysChangedAt: serverTimestamp() as Timestamp,
        });
        await odm.put('IR', irid, ir!);
    },
    updateServiceProtocol: async (irid, index, protocol) => {
        const ir = await getSnp(irDoc(irid));
        if (!ir || ir.deleted) return;
        ir!.installationProtocols[index] = protocol;
        await updateDoc(irDoc(irid), addStampIR(`installationProtocols`, ir!.installationProtocols));
        await odm.put('IR', irid, ir!);
    },
    updateHeatPumpCommissioningProtocol: async (irid, protocol) => {
        await updateDoc(irDoc(irid), addStampIR(`uvedeniTC`, protocol));
        await odm.update('IR', irid, ir => ({ ...ir!, uvedeniTC: protocol }));
    },
    addSolarSystemCommissioningProtocol: async (irid, protocol) => {
        await updateDoc(irDoc(irid), addStampIR(`uvedeniSOL`, protocol));
        await odm.update('IR', irid, ir => ({ ...ir!, uvedeniSOL: protocol }));
    },
    addPhotovoltaicSystemCommissioningProtocol: async (irid, protocol) => {
        await updateDoc(irDoc(irid), addStampIR(`uvedeniFVE`, protocol));
        await odm.update('IR', irid, ir => ({ ...ir!, uvedeniFVE: protocol }));
    },
    addFaceTable: async (irid, faceTable) => {
        await updateDoc(irDoc(irid), addStampIR(`faceTable`, faceTable));
        await odm.update('IR', irid, ir => ({ ...ir!, faceTable: faceTable }));
    },
    updateIRUsers: async (irid, users) => {
        await updateDoc(irDoc(irid), addStampIR(`users`, users));
        await odm.update('IR', irid, ir => ({ ...ir!, users: users }));
    },
    updateHeatPumpRecommendationsSettings: async (irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null) => {
        const ir = await getSnp(irDoc(irid));
        if (!ir || ir.deleted) return;
        ir!.yearlyHeatPumpCheckRecommendation = enabled ? {
            state: 'waiting',
            ...ir!.yearlyHeatPumpCheckRecommendation ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        await updateDoc(irDoc(irid), addStampIR(`yearlyHeatPumpCheckRecommendation`, ir!.yearlyHeatPumpCheckRecommendation ?? deleteField()));
        await odm.put('IR', irid, ir!);
    },
    updateSolarSystemRecommendationsSettings: async (irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null) => {
        const ir = await getSnp(irDoc(irid));
        if (!ir || ir.deleted) return;
        ir!.yearlySolarSystemCheckRecommendation = enabled ? {
            state: 'waiting',
            ...ir!.yearlySolarSystemCheckRecommendation ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        await updateDoc(irDoc(irid), addStampIR(`yearlySolarSystemCheckRecommendation`, ir!.yearlySolarSystemCheckRecommendation ?? deleteField()));
        await odm.put('IR', irid, ir!);
    },
    addIndependentServiceProtocol: async protocol => {
        const spid = extractSPIDFromRawData(protocol.zasah);
        await setDoc(spDoc(spid), {
            ...protocol,
            zasah: { ...protocol.zasah, createdAt: serverTimestamp() as Timestamp, changedAt: serverTimestamp() as Timestamp },
            deleted: false,
        });
        await odm.put('SP', spid, protocol);
    },
    updateIndependentServiceProtocol: async protocol => {
        const spid = extractSPIDFromRawData(protocol.zasah);
        await updateDoc(spDoc(spid), { ...protocol, 'zasah.changedAt': serverTimestamp() as Timestamp, deleted: false });
        await odm.put('SP', spid, protocol);
    },
    deleteIndependentProtocol: async spid => {
        const deleted: Deleted<SPID> = { deleted: true, deletedAt: serverTimestamp() as Timestamp, id: spid };
        await updateDoc(spDoc(spid), deleted);
        await odm.update('SP', spid, sp => ({ ...sp, ...deleted }));
    },
    getIndependentProtocol: spid => getSnp(spDoc(spid))
        .thenAlso(v => odm.putOrDelete('SP', spid, v)),
    getIndependentProtocolAsStore: spid => getAsStore(spDoc(spid)).also(r =>
        r.subscribe(v => v != 'loading' ? odm.putOrDelete('SP', spid, v) : 0),
    ),
    getChangedIndependentProtocols: async lastUpdatedAt => await getSnps(query(
        spCollection,
        where('deleted', '!=', true),
        where('zasah.createdAt', '>', lastUpdatedAt),
    )) as Raw<FormNSP>[],
    getDeletedIndependentProtocols: async lastUpdatedAt => await getSnps(query(
        spCollection,
        where('deleted', '==', true),
        where('deletedAt', '>', lastUpdatedAt),
    )) as Deleted<SPID>[],
};

export const firestoreDatabase: Database = databaseMethods.associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => {
        logEvent(analytics(), 'fetch_database', { name, args });
        const func = baseDatabase[name];
        // @ts-expect-error TS doesn't know it's a tuple
        return func(...args);
    },
) as {
    [F in typeof databaseMethods[number]]: Database[F];
};