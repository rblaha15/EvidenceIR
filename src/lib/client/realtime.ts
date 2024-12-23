import { derived, get as getFromStore, readonly, writable } from 'svelte/store';
import { checkAdmin, currentUser } from './auth';
import type { User } from 'firebase/auth';
import { onValue, type Query, ref } from 'firebase/database';
import { storable } from '$lib/helpers/stores';
import { realtime } from '../../hooks.client';

type SelfObject<T extends PropertyKey> = { [key in T]: key };
type CRN = string;

export type Company = {
	crn: CRN;
	companyName: string;
	email?: string;
	phone?: string;
	representative?: string;
};
export type Person = {
	email: string;
	assemblyCompanies: SelfObject<CRN>;
	commissioningCompanies: SelfObject<CRN>;
	responsiblePerson?: string;
};
export type FriendlyCompanies = {
	assemblyCompanies: Company[];
	commissioningCompanies: Company[];
};
const FriendlyCompanies = (
	assemblyCompanies: Company[],
	commissioningCompanies?: Company[]
): FriendlyCompanies => ({
	assemblyCompanies,
	commissioningCompanies: commissioningCompanies ?? assemblyCompanies
});

const firmyRef = ref(realtime, '/companies');
const lidiRef = ref(realtime, '/people');
const connectedRef = ref(realtime, '.info/connected');

const _isOnline = writable(false);
export const isOnline = readonly(_isOnline);
export const getIsOnline = () => getFromStore(isOnline);
onValue(connectedRef, (sn) => _isOnline.set(sn.val() === true));

const getWithCache = async <T>(query: Query) => {
	const { get } = await import('firebase/database');
	const store = storable<T>(
		'realtime_' + query.ref.toString().substring(query.ref.root.toString().length - 1)
	);
	if (getIsOnline()) {
		const value = (await get(query)).val() as T | undefined;
		if (value != undefined) store.set(value);
		return value;
	} else {
		return getFromStore(store);
	}
};

const _friendlyCompanies = async (user: User | null): Promise<FriendlyCompanies> => {
	if (!user) {
		return FriendlyCompanies([]);
	}
	const { child } = await import('firebase/database');
	if (user.email?.endsWith('@regulus.cz') || (await checkAdmin())) {
		const vsechnyFirmy = await getWithCache<{ [crn: CRN]: Company }>(firmyRef);
		return FriendlyCompanies(Object.values(vsechnyFirmy!));
	}
	const ja = await getWithCache<Person>(child(lidiRef, user.uid));
	if (!ja || ja.email !== user.email) {
		return FriendlyCompanies([]);
	}
	const dovolenaIca = {
		assembly: Object.keys(ja.assemblyCompanies) as CRN[],
		commissioning: Object.keys(ja.commissioningCompanies) as CRN[]
	};
	return {
		assemblyCompanies: await Promise.all(
			dovolenaIca.assembly.map(async (crn) => await getWithCache<Company>(child(firmyRef, crn)))
		),
		commissioningCompanies: await Promise.all(
			dovolenaIca.commissioning.map(
				async (crn) => await getWithCache<Company>(child(firmyRef, crn))
			)
		)
	} as FriendlyCompanies;
};

export const friendlyCompanies = derived(
	currentUser,
	(user, set) => {
		setTimeout(async () => {
			set(user ? await _friendlyCompanies(user) : FriendlyCompanies([]));
		}, 500);
	},
	FriendlyCompanies([])
);

const _responsiblePerson = async (user: User | null) => {
	if (!user) return null;
	const { child } = await import('firebase/database');
	const ja = await getWithCache<Person>(child(lidiRef, user.uid));
	return ja?.responsiblePerson ?? null;
};

export const responsiblePerson = derived(
	currentUser,
	(user, set) => {
		setTimeout(async () => {
			set(user ? await _responsiblePerson(user) : null);
		}, 500);
	},
	null as string | null
);

export const seznamLidi = writable([] as Person[]);

export const startLidiListening = async () => {
	const { onValue } = await import('firebase/database');
	return onValue(lidiRef, (data) => {
		seznamLidi.set(Object.values((data.val() as { [uid: string]: Person }) ?? {}));
	});
};

export const seznamFirmy = writable([] as Company[]);

export const startFirmyListening = async () => {
	const { onValue } = await import('firebase/database');
	return onValue(firmyRef, (data) => {
		seznamFirmy.set(Object.values((data.val() as { [crn: CRN]: Company }) ?? {}));
	});
};
