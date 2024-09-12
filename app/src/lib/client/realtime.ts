import { derived, writable } from 'svelte/store';
import { checkAdmin, currentUser } from './auth';
import type { User } from 'firebase/auth';
import { getDatabase, ref } from 'firebase/database';
import { app } from './firebase';

type SelfObject<T extends PropertyKey> = { [key in T]: key }
type CRN = string

export type Company = {
	companyName: string,
	crn: CRN,
	email?: string,
	representative?: string
};
export type Person = {
	email: string,
	assemblyCompanies: SelfObject<CRN>,
	commissioningCompanies: SelfObject<CRN>,
	responsiblePerson?: string
};
export type FriendlyCompanies = {
	assemblyCompanies: Company[]
	commissioningCompanies: Company[]
}
const FriendlyCompanies = (assemblyCompanies: Company[], commissioningCompanies?: Company[]): FriendlyCompanies => ({
	assemblyCompanies, commissioningCompanies: commissioningCompanies ?? assemblyCompanies,
})

export const realtime = getDatabase(app);

const firmyRef = ref(realtime, '/companies');
const lidiRef = ref(realtime, '/people');

const _friendlyCompanies = async (
	user: User | null
): Promise<FriendlyCompanies> => {
	if (!user) {
		return FriendlyCompanies([]);
	}
	const { get, child } = await import('firebase/database');
	if (user.email?.endsWith('@regulus.cz') || (await checkAdmin())) {
		const vsechnyFirmy = (await get(firmyRef)).val() as { [crn: CRN]: Company };
		return FriendlyCompanies(Object.values(vsechnyFirmy));
	}
	const ja = (await get(child(lidiRef, user.uid))).val() as Person | undefined;
	if (!ja || ja.email !== user.email) {
		return FriendlyCompanies([]);
	}
	const dovolenaIca = {
		assembly: Object.keys(ja.assemblyCompanies) as CRN[],
		commissioning: Object.keys(ja.commissioningCompanies) as CRN[],
	}
	console.log({
		assemblyCompanies: await Promise.all(
			dovolenaIca.assembly.map(async (crn) => (await get(child(firmyRef, crn))).val() as Company)
		),
		commissioningCompanies: await Promise.all(
			dovolenaIca.commissioning.map(async (crn) => (await get(child(firmyRef, crn))).val() as Company)
		),
	} as FriendlyCompanies)
	return {
		assemblyCompanies: await Promise.all(
			dovolenaIca.assembly.map(async (crn) => (await get(child(firmyRef, crn))).val() as Company)
		),
		commissioningCompanies: await Promise.all(
			dovolenaIca.commissioning.map(async (crn) => (await get(child(firmyRef, crn))).val() as Company)
		),
	} as FriendlyCompanies
};

export const friendlyCompanies = derived(
	currentUser,
	(user, set) => {
		(async () => set(user ? await _friendlyCompanies(user) : FriendlyCompanies([])))();
	},
	FriendlyCompanies([])
);

const _responsiblePerson = async (user: import('firebase/auth').User | null) => {
	if (!user) return null;
	const { get, child } = await import('firebase/database');
	const ja = (await get(child(lidiRef, user.uid))).val() as Person | null;
	return ja?.responsiblePerson ?? null;
};

export const responsiblePerson = derived(
	currentUser,
	(user, set) => {
		(async () => set(user ? await _responsiblePerson(user) : null))();
	},
	null as string | null
);

export const seznamLidi = writable([] as Person[]);

export const startLidiListening = async () => {
	const { onValue } = await import('firebase/database')
	return onValue(lidiRef, (data) => {
		seznamLidi.set(Object.values(data.val() as { [uid: string]: Person } ?? {}));
	});
}