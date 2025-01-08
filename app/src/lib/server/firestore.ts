import { getFirestore, type QueryDocumentSnapshot, type WithFieldValue } from 'firebase-admin/firestore';
import { app } from './firebase';
import { type IR, type LegacyIR, modernizeIR } from '$lib/client/firestore';

export const db = getFirestore(app!);

const irCollection = db.collection('ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => modernizeIR(snapshot.data() as IR & LegacyIR),
})

export const evidence = (ir: string) => irCollection.doc(ir).get();