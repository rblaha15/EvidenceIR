import { type DocumentSnapshot, getFirestore, type QueryDocumentSnapshot, type WithFieldValue } from 'firebase-admin/firestore';
import { app } from './firebase';
import { type IR, type LegacyIR, type LegacySP, migrateSP, modernizeIR } from '$lib/client/firestore';
import type { DataSP2 } from '$lib/forms/SP2';
import type { Raw } from '$lib/forms/Form';
import type { DataOfType, ID } from '$lib/server/pdf';
import { isIRID } from '$lib/helpers/ir';

export const db = getFirestore(app!);

const irCollection = db.collection('ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => modernizeIR(snapshot.data().also(console.dir) as IR & LegacyIR),
});

const spCollection = db.collection('sp').withConverter<Raw<DataSP2>>({
    toFirestore: (modelObject: WithFieldValue<Raw<DataSP2>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => migrateSP(snapshot.data() as LegacySP & Raw<DataSP2>) as Raw<DataSP2>,
});

export const evidence_sp2 = <T extends 'IR' | 'SP'>(irid_spid: ID<T>) => (
    isIRID(irid_spid)
        ? irCollection.doc(irid_spid).get()
        : spCollection.doc(irid_spid).get()
) as Promise<DocumentSnapshot<DataOfType<T> | undefined>>;