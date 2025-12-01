import {
    collection,
    deleteDoc,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    type QueryDocumentSnapshot,
    setDoc,
    updateDoc,
    where,
    type WithFieldValue,
} from 'firebase/firestore';
import type { Raw } from '$lib/forms/Form';
import { get, readonly, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser, userInfo } from './auth';
import { firestore } from '../../hooks.client';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, type SPID } from '$lib/helpers/ir';
import { type Database, type IR } from '$lib/data';
import { offlineDatabaseManager as odm } from '$lib/client/offline.svelte';
import { deleteField, Query } from '@firebase/firestore';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { flatDerived } from '$lib/helpers/stores';

const irCollection = collection(firestore, 'ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
});
const spCollection = collection(firestore, 'sp').withConverter<Raw<FormNSP>>({
    toFirestore: (modelObject: WithFieldValue<Raw<FormNSP>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Raw<FormNSP>,
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
        console.error(e)
        return undefined;
    }
};
const getAsStore = <T>(reference: DocumentReference<T>) => {
    const currentState = writable<T | undefined | 'loading'>('loading');
    onSnapshot(reference, data => currentState.set(data.exists() ? data.data() : undefined));
    return readonly(currentState);
};
const getAllAsStore = <T>(reference: Query<T>) => {
    const currentState = writable<T[] | 'loading'>('loading');
    onSnapshot(reference, snps => currentState.set(snps.docs
        .mapNotUndefined(snp => snp.exists() ? snp.data() : undefined)), console.error);
    return readonly(currentState);
};
const getSnps = async <T>(reference: Query<T>) => {
    try {
        const snp = await getDocs(reference);
        return snp.docs
            .mapNotUndefined(snp => snp.exists() ? snp.data() : undefined);
    } catch (e) {
        console.error(e)
        return [];
    }
};

export const firestoreDatabase: Database = {
    getIR: irid => getSnp(irDoc(irid))
        .thenAlso(v => odm.putOrDelete('IR', irid, v)),
    getAllIRs: async () => {
        const user = get(currentUser);
        const q = await checkRegulusOrAdmin() ? irCollection
            : query(irCollection, where('users', 'array-contains', user?.email ?? ''));
        return await getSnps(q).thenAlso(v =>
            odm.putAll('IR', v.associateBy(v => extractIRIDFromRawData(v.evidence))),
        );
    },
    getAllIRsAsStore: () => flatDerived(userInfo,
        user => {
            const q = user.isUserRegulusOrAdmin ? irCollection
                : query(irCollection, where('users', 'array-contains', user?.email ?? ''));
            return getAllAsStore(q);
        },
        irs => irs != 'loading' ? odm.putAll('IR', irs.associateBy(v => extractIRIDFromRawData(v.evidence))) : 0,
    ),
    getIRAsStore: irid => getAsStore(irDoc(irid))
        .also(r => r.subscribe(v => v != 'loading' ? odm.putOrDelete('IR', irid, v) : 0)),
    addIR: async ir => {
        const irid = extractIRIDFromRawData(ir.evidence);
        await setDoc(irDoc(irid), ir);
        await odm.put('IR', irid, ir);
    },
    deleteIR: async irid => {
        await deleteDoc(irDoc(irid));
        await odm.delete('IR', irid);
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
    updateIRRecord: async rawData => {
        const irid = extractIRIDFromRawData(rawData);
        await updateDoc(irDoc(irid), `evidence`, rawData);
        await odm.update('IR', irid, ir => ({ ...ir!, evidence: rawData }));
    },
    addHeatPumpCheck: async (irid, pump, year, check) => {
        await updateDoc(irDoc(irid), `kontrolyTC.${pump}.${year}`, check);
        await odm.update('IR', irid, ir => {
            ir!.kontrolyTC[pump] = ir!.kontrolyTC[pump] ?? {};
            ir!.kontrolyTC[pump][year] = check;
            return ir!;
        });
    },
    addSolarSystemCheck: async (irid, year, check) => {
        await updateDoc(irDoc(irid), `kontrolySOL.${year}`, check);
        await odm.update('IR', irid, ir => {
            ir!.kontrolySOL = ir!.kontrolySOL ?? {};
            ir!.kontrolySOL[year] = check;
            return ir!;
        });
    },
    addServiceProtocol: async (irid, protocol) => {
        const ir = await getSnp(irDoc(irid));
        ir!.installationProtocols.push(protocol);
        await updateDoc(irDoc(irid), `installationProtocols`, ir!.installationProtocols);
        await odm.put('IR', irid, ir!);
    },
    updateServiceProtocol: async (irid, index, protocol) => {
        const ir = await getSnp(irDoc(irid));
        ir!.installationProtocols[index] = protocol;
        await updateDoc(irDoc(irid), `installationProtocols`, ir!.installationProtocols);
        await odm.put('IR', irid, ir!);
    },
    updateHeatPumpCommissioningProtocol: async (irid, protocol) => {
        await updateDoc(irDoc(irid), `uvedeniTC`, protocol);
        await odm.update('IR', irid, ir => ({ ...ir!, uvedeniTC: protocol }));
    },
    addSolarSystemCommissioningProtocol: async (irid, protocol) => {
        await updateDoc(irDoc(irid), `uvedeniSOL`, protocol);
        await odm.update('IR', irid, ir => ({ ...ir!, uvedeniSOL: protocol }));
    },
    addPhotovoltaicSystemCommissioningProtocol: async (irid, protocol) => {
        await updateDoc(irDoc(irid), `uvedeniFVE`, protocol);
        await odm.update('IR', irid, ir => ({ ...ir!, uvedeniFVE: protocol }));
    },
    addFaceTable: async (irid, faceTable) => {
        await updateDoc(irDoc(irid), `faceTable`, faceTable);
        await odm.update('IR', irid, ir => ({ ...ir!, faceTable: faceTable }));
    },
    updateIRUsers: async (irid, users) => {
        await updateDoc(irDoc(irid), `users`, users);
        await odm.update('IR', irid, ir => ({ ...ir!, users: users }));
    },
    updateHeatPumpRecommendationsSettings: async (irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null) => {
        const ir = await getSnp(irDoc(irid));
        ir!.yearlyHeatPumpCheckRecommendation = enabled ? {
            state: 'waiting',
            ...ir!.yearlyHeatPumpCheckRecommendation ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        await updateDoc(irDoc(irid), `yearlyHeatPumpCheckRecommendation`, ir!.yearlyHeatPumpCheckRecommendation ?? deleteField());
        await odm.put('IR', irid, ir!);
    },
    updateSolarSystemRecommendationsSettings: async (irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null) => {
        const ir = await getSnp(irDoc(irid));
        ir!.yearlySolarSystemCheckRecommendation = enabled ? {
            state: 'waiting',
            ...ir!.yearlySolarSystemCheckRecommendation ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        await updateDoc(irDoc(irid), `yearlySolarSystemCheckRecommendation`, ir!.yearlySolarSystemCheckRecommendation ?? deleteField());
        await odm.put('IR', irid, ir!);
    },
    addIndependentServiceProtocol: async protocol => {
        const spid = extractSPIDFromRawData(protocol.zasah);
        await setDoc(spDoc(spid), protocol);
        await odm.put('SP', spid, protocol);
    },
    updateIndependentServiceProtocol: async protocol => {
        const spid = extractSPIDFromRawData(protocol.zasah);
        await updateDoc(spDoc(spid), protocol);
        await odm.put('SP', spid, protocol);
    },
    deleteIndependentProtocol: async spid => {
        await deleteDoc(spDoc(spid));
        await odm.delete('SP', spid);
    },
    getIndependentProtocol: spid => getSnp(spDoc(spid))
        .thenAlso(v => odm.putOrDelete('SP', spid, v)),
    getIndependentProtocolAsStore: spid => getAsStore(spDoc(spid)).also(r =>
        r.subscribe(v => v != 'loading' ? odm.putOrDelete('SP', spid, v) : 0),
    ),
    getAllIndependentProtocols: () => getSnps(spCollection)
        .thenAlso(v => odm.putAll('SP', v.associateBy(v => extractSPIDFromRawData(v.zasah)))),
    getAllIndependentProtocolsAsStore: () => getAllAsStore(spCollection).also(r =>
        r.subscribe(v => v != 'loading' ? odm.putAll('SP', v.associateBy(v => extractSPIDFromRawData(v.zasah))) : 0),
    ),
};