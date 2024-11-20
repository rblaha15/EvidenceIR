import { getFirestore, type QueryDocumentSnapshot, type WithFieldValue } from 'firebase-admin/firestore';
import { app } from './firebase';
import type { IR } from '$lib/client/firestore';

export const db = getFirestore(app!);

const irCollection = db.collection('ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
})

export const evidence = (ir: string) => irCollection.doc(ir).get();