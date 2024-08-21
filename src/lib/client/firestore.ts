import { collection, getFirestore, QueryDocumentSnapshot, type WithFieldValue } from '@firebase/firestore';
import { app } from './firebase';
import type { RawData } from '$lib/Data';
import type { Kontrola } from '$lib/Kontrola';

export const firestore = getFirestore(app);

export type IR = {
	evidence: RawData,
	kontroly: {
		0?: Kontrola,
		1?: Kontrola,
		2?: Kontrola,
		3?: Kontrola,
	}
}

const irCollection = collection(firestore, 'ir').withConverter<IR>({
	toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
	fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
})

export const evidence = async (ir: string) => {
	const { getDoc, doc } = await import('@firebase/firestore');
	return await getDoc(doc(irCollection, ir.replace(" ", "")));
};
export const novaEvidence = async (data: IR) => {
	const { doc, setDoc } = await import('@firebase/firestore');
	const ir = data.evidence.ir.cislo.replace(" ", "")
	return await setDoc(doc(irCollection, ir), data);
};
export const odstranitEvidenci = async (ir: string) => {
	const { deleteDoc, doc } = await import('@firebase/firestore');
	return await deleteDoc(doc(firestore, 'ir', `/${ir.replace(" ", "")}`));
};