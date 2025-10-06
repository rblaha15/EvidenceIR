import type { IR, RecommendationData, RecommendationState } from '$lib/data';
import { app } from '$lib/server/firebase';
import { getFirestore, QueryDocumentSnapshot, type WithFieldValue } from 'firebase-admin/firestore';
import type { IRID } from '$lib/helpers/ir';

const firestore = app ? getFirestore(app) : getFirestore();

const irCollection = firestore.collection('ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
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

export const changeState = (irid: IRID, value: RecommendationState) =>
    irCollection.doc(irid).update('yearlyHeatPumpCheckRecommendation.state', value);

export const changeCode = (irid: IRID, code: string) =>
    irCollection.doc(irid).update('yearlyHeatPumpCheckRecommendation.code', code);