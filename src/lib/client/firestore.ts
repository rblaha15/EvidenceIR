import { collection, deleteDoc, doc, getDoc, getFirestore, type QueryDocumentSnapshot, setDoc, updateDoc, type WithFieldValue } from 'firebase/firestore';
import { app } from './firebase';
import type { RawData } from '$lib/Data';
import type { Kontrola } from '$lib/Kontrola';
import type { RawUvedeni } from '$lib/Uvedeni';

export const firestore = getFirestore(app);

export type IR = {
	evidence: RawData,
	uvedeni?: RawUvedeni,
	kontroly: {
		1?: Kontrola,
		2?: Kontrola,
		3?: Kontrola,
		4?: Kontrola,
	},
}

const irCollection = collection(firestore, 'ir').withConverter<IR>({
	toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
	fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
})
const irDoc = (ir: string) => doc(irCollection, ir)

export const evidence = (ir: string) => {
	return getDoc(irDoc(ir));
};
export const novaEvidence = (data: IR) => {
	const ir = data.evidence.ir.cislo.replace(' ', '')
	return setDoc(irDoc(ir), data);
};
export const upravitEvidenci = (rawData: RawData) => {
	const ir = rawData.ir.cislo.replace(' ', '')
	return updateDoc(irDoc(ir), `evidence`, rawData)
};
export const odstranitEvidenci = (ir: string) => {
	return deleteDoc(doc(firestore, 'ir', `/${ir}`));
};
export const existuje = async (ir: string) => {
	return (await getDoc(irDoc(ir))).exists();
};

export const posledniKontrola = async (ir: string) => {
	const snapshot = await getDoc(irDoc(ir));
	const kontroly = snapshot.data()!.kontroly
	if (kontroly?.[1] == undefined) return 0
	return Math.max(...Object.keys(kontroly).map(it => Number(it)))
}

export const pridatKontrolu = (ir: string, rok: number, kontrola: Kontrola) => {
	return updateDoc(irDoc(ir), `kontroly.${rok}`, kontrola)
}

export const uvestDoProvozu = (ir: string, uvedeni: RawUvedeni) => {
	return updateDoc(irDoc(ir), `uvedeni`, uvedeni)
}