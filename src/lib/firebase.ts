import { initializeApp } from '@firebase/app';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getDatabase, ref, onValue } from '@firebase/database';
import { writable, derived } from 'svelte/store';

export type Firma = [string, string, string, string];

const firebaseConfig: import('@firebase/app').FirebaseOptions = {
	apiKey: 'AIzaSyCKu8Z4wx55DfrZdYtKvrqvwZ2Y6nQvx24',
	authDomain: 'evidence-ir.firebaseapp.com',
	projectId: 'evidence-ir',
	storageBucket: 'evidence-ir.appspot.com',
	messagingSenderId: '1021340777991',
	appId: '1:1021340777991:web:d44750968c2d8dbc8834a2',
	measurementId: 'G-8KZH7Q0ZLC',
	databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app/'
};

const app = initializeApp(firebaseConfig);

//// AUTH: lidé

const auth = getAuth(app);

export const prihlasenState = writable(null as import('@firebase/auth').User | null);
onAuthStateChanged(auth, (usr) => prihlasenState.set(usr));

export const prihlasit = async (email: string, heslo: string) => {
	const { signInWithEmailAndPassword } = await import('@firebase/auth');
	return signInWithEmailAndPassword(auth, email, heslo);
};
export const zaregistovat = async (email: string, heslo: string) => {
	const { createUserWithEmailAndPassword } = await import('@firebase/auth');
	return createUserWithEmailAndPassword(auth, email, heslo);
};
export const odhlasit = async () => {
	const { signOut } = await import('@firebase/auth');
	return signOut(auth);
};

//// REALTIME: lidé a firmy k nim příslušející + admini

export const realtime = getDatabase(app);

const firmyRef = ref(realtime, '/firmy');
const lidiRef = ref(realtime, '/lidi');

const seznamFirem_ = async () => {
	const { get } = await import('@firebase/database');
	return (await get(firmyRef)).val() as Firma[];
};

const sprateleneFirmy_ = async (
	user: import('@firebase/auth').User | null
): Promise<[Firma[], Firma[]]> => {
	if (!user) {
		return [[], []];
	}
	if (user.email?.endsWith('@regulus.cz')) {
		const vsechnyFirmy = await seznamFirem_();
		return [vsechnyFirmy, vsechnyFirmy];
	}
	const { get, query, orderByChild, equalTo, child } = await import('@firebase/database');
	const { ref } = child(query(lidiRef, orderByChild('0'), equalTo(user.email)).ref, '0');
	const vysledky = (await get(ref)).val() as [string, string[], string[]];
	if (vysledky[0] !== user.email) {
		return [[], []];
	}
	const dovolenaIca = (vysledky?.splice(1) as [string[], string[]] | null) ?? [];
	const vsechnyFirmy = await seznamFirem_();
	return dovolenaIca.map((ica) => vsechnyFirmy.filter(([_, ico]) => ica.includes(ico)) ?? []) as [
		Firma[],
		Firma[]
	];
};
export const sprateleneFirmy = derived(
	prihlasenState,
	(user, set) => {
		(async () => set(await sprateleneFirmy_(user)))();
	},
	[[], []] as [Firma[], Firma[]]
);

const jeAdmin_ = async (user: import('@firebase/auth').User | null) =>
	!!(await user?.getIdTokenResult())?.claims?.admin;
export const jeAdmin = derived(
	prihlasenState,
	(user, set) => {
		(async () => set(await jeAdmin_(user)))();
	},
	false
);

export const aktualizovatSeznamLidi = async (data: [string, string[], string[]][]) => {
	const { set } = await import('@firebase/database');
	if (await jeAdmin_(auth.currentUser)) {
		console.log({ staraData: await seznamLidi_(), novaData: data });
		set(lidiRef, data);
	}
};

const seznamLidi_ = async () => {
	const { get } = await import('@firebase/database');
	return (await get(lidiRef)).val() as [string, string[], string[]][];
};
export const seznamLidi = writable([] as [string, string[], string[]][]);

jeAdmin.subscribe(() => {
	onValue(lidiRef, (data) => {
		seznamLidi.set(data.val());
	});
});

//// FIRESTORE: vyplnění uživatelé žádající vzdálený přístup

export const db = getFirestore(app);

export const uzivatel = async (uid: string) => {
	const { getDoc, doc } = await import('@firebase/firestore');
	return await getDoc(doc(db, 'uzivatele', `/${uid}`));
};
export const novyUzivatel = async (data: { veci: string }) => {
	const { addDoc, collection } = await import('@firebase/firestore');
	return (await addDoc(collection(db, 'uzivatele'), data)).id;
};
export const odstranitUzivatele = async (uid: string) => {
	const { deleteDoc, doc } = await import('@firebase/firestore');
	return await deleteDoc(doc(db, 'uzivatele', `/${uid}`));
};
