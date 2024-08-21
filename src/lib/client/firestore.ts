import { collection, deleteDoc, doc, getDoc, getFirestore, QueryDocumentSnapshot, setDoc, updateDoc, type WithFieldValue } from '@firebase/firestore';
import { app } from './firebase';
import type { RawData } from '$lib/Data';
import type { Kontrola } from '$lib/Kontrola';
import type { UpdateData } from 'firebase-admin/firestore';

export const firestore = getFirestore(app);

export type IR = {
	evidence: RawData,
	kontroly: {
		1?: Kontrola,
		2?: Kontrola,
		3?: Kontrola,
		4?: Kontrola,
	}
}

const irCollection = collection(firestore, 'ir').withConverter<IR>({
	toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
	fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
})

export const evidence = (ir: string) => {
	return getDoc(doc(irCollection, ir.replace(" ", "")));
};
export const novaEvidence = (data: IR) => {
	const ir = data.evidence.ir.cislo.replace(" ", "")
	return setDoc(doc(irCollection, ir), data);
};
export const odstranitEvidenci = (ir: string) => {
	return deleteDoc(doc(firestore, 'ir', `/${ir.replace(" ", "")}`));
};

export const posledniKontrola = async (ir: string) => {
	const snapshot = await getDoc(doc(irCollection, ir.replace(" ", "")));
	const kontroly = snapshot.data()!.kontroly
	if (kontroly?.[1] == undefined) return 0
	return Math.max(...Object.keys(kontroly).map(it => Number(it)))
}

export const pridatKontrolu = (ir: string, rok: number, kontrola: Kontrola) => {
	return updateDoc(doc(irCollection, ir.replace(" ", "")), `kontroly.${rok}`, kontrola)
}