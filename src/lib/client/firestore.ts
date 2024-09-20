import { collection, deleteDoc, where, query, getDocs, doc, getDoc, onSnapshot, type QueryDocumentSnapshot, setDoc, updateDoc, type WithFieldValue } from 'firebase/firestore';
import type { RawData } from '$lib/Data';
import type { Kontrola } from '$lib/Kontrola';
import type { RawUvedeni } from '$lib/Uvedeni';
import { get, readonly, writable } from 'svelte/store';
import { checkAdmin, currentUser } from './auth';
import { firestore } from '../../hooks.client';

export type IR = {
	evidence: RawData,
	uvedeni?: RawUvedeni,
	kontroly: {
		1?: Kontrola,
		2?: Kontrola,
		3?: Kontrola,
		4?: Kontrola,
	},
	users: string[],
}

const irCollection = collection(firestore, 'ir').withConverter<IR>({
	toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
	fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as IR,
})
const irDoc = (ir: string) => doc(irCollection, ir.replace(' ', ''))

export const evidence = (ir: string) => {
	return getDoc(irDoc(ir));
};
export const novaEvidence = (data: IR) => {
	const ir = data.evidence.ir.cislo
	return setDoc(irDoc(ir), data);
};
export const upravitEvidenci = (rawData: RawData) => {
	const ir = rawData.ir.cislo
	return updateDoc(irDoc(ir), `evidence`, rawData)
};
export const odstranitEvidenci = (ir: string) => {
	return deleteDoc(irDoc(ir));
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

export const upravitUzivatele = (ir: string, users: string[]) => {
	return updateDoc(irDoc(ir), `users`, users)
}

export const evidenceStore = (ir: string) => {
	const currentState = writable<IR>(undefined as IR | undefined);
	onSnapshot(irDoc(ir), (data) => currentState.set(data.data()!));
	return readonly(currentState)
}
export const getAll = async () => {
	const user = get(currentUser)
	if (user?.email?.endsWith('@regulus.cz') || await checkAdmin())
		return await getDocs(irCollection)
	return await getDocs(query(irCollection, where('users', 'array-contains', user?.email)))
}