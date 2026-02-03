import type { Deleted, IR, RecommendationData, RecommendationState } from '$lib/data';
import { app } from '$lib/server/firebase';
import { getFirestore, QueryDocumentSnapshot, type WithFieldValue } from 'firebase-admin/firestore';
import type { IRID, SPID } from '$lib/helpers/ir';
import type { DataNSP } from '$lib/forms/NSP/formNSP';
import type { Raw } from '$lib/forms/Form';

const firestore = app ? getFirestore(app) : getFirestore();

const irCollection = firestore.collection('ir').withConverter<IR | Deleted<IRID>>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR | Deleted<IRID>,
});

const spCollection = firestore.collection('sp').withConverter<Raw<DataNSP> | Deleted<SPID>>({
    toFirestore: (modelObject: WithFieldValue<Raw<DataNSP>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Raw<DataNSP> | Deleted<SPID>,
});

const rkCollection = firestore.collection('rk').withConverter<RecommendationData>({
    toFirestore: (modelObject: WithFieldValue<RecommendationData>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as RecommendationData,
});

export const createRK = (code: string, data: RecommendationData) =>
    rkCollection.doc(code).set(data);

export const getRK = (code: string) =>
    rkCollection.doc(code).get().then(s => s.data());

export const removeRK = (code: string) =>
    rkCollection.doc(code).delete();

export const getIRs = () =>
    irCollection.get().then(s => s.docs.map(d => d.data()));

export const changeState = (irid: IRID, value: RecommendationState, type: 'TČ' | 'SOL') => {
    const field = type == 'TČ' ? 'yearlyHeatPumpCheckRecommendation' : 'yearlySolarSystemCheckRecommendation';
    return irCollection.doc(irid).update(field + '.state', value);
};

export const changeCode = (irid: IRID, code: string, type: 'TČ' | 'SOL') => {
    const field = type == 'TČ' ? 'yearlyHeatPumpCheckRecommendation' : 'yearlySolarSystemCheckRecommendation';
    return irCollection.doc(irid).update(field + '.code', code);
};

export const getAllIRs = () => irCollection.get().then(
    snapshot => snapshot.docs.map(snapshot => snapshot.data()),
);

export const getAllSPs = () => spCollection.get().then(
    snapshot => snapshot.docs.map(snapshot => snapshot.data()),
);

export const getIR = (irid: IRID) => irCollection.doc(irid).get().then(s => s.data());
export const setCreatedIRBy = (irid: IRID, createdBy: IR['createdBy']) =>
    irCollection.doc(irid).update('createdBy', createdBy);
export const setGrantedCommission = (irid: IRID) =>
    irCollection.doc(irid).update('loyaltyProgram.grantedCommission', true);