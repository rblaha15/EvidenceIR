import { initializeApp } from '@firebase/app';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { getDatabase, ref, onValue } from '@firebase/database';
import { getFirestore } from '@firebase/firestore';
import { writable, derived } from 'svelte/store';
import type { RawData } from './Vec';

export type Firma = [string, string, string, string];
export type Clovek = [string, { [ico: string]: string }, { [ico: string]: string }, string];

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

let lock = false;

export const prihlasenState = writable('null' as import('@firebase/auth').User | null | 'null');
onAuthStateChanged(auth, (usr) => prihlasenState.set(lock ? null : usr));

export const prihlasit = async (email: string, heslo: string) => {
	if (heslo == '123456')
		throw {
			code: 'auth/user-not-found'
		};
	const { signInWithEmailAndPassword } = await import('@firebase/auth');
	try {
		return await signInWithEmailAndPassword(auth, email, heslo);
	} catch (err) {
		if ((err as { code: string }).code == 'auth/wrong-password') {
			lock = true;

			try {
				await signInWithEmailAndPassword(auth, email, '123456');
			} catch (err) {
				lock = false;
				throw err;
			}

			const { signOut } = await import('@firebase/auth');
			await signOut(auth);

			lock = false;
			throw { code: 'auth/user-not-found' };
		}
		throw err;
	}
};
export const zmenitHeslo = async (email: string, heslo: string) => {
	if (heslo == '123456')
		throw {
			code: 'auth/weak-password'
		};
	const { signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword } =
		await import('@firebase/auth');
	try {
		const user = await signInWithEmailAndPassword(auth, email, '123456');
		return await updatePassword(user.user, heslo);
	} catch (err) {
		if ((err as { code: string }).code == 'auth/wrong-password') {
			throw {
				code: 'auth/email-already-in-use'
			};
		} else if ((err as { code: string }).code == 'auth/user-not-found') {
			if (email.endsWith('@regulus.cz')) {
				await createUserWithEmailAndPassword(auth, email, heslo);
				return;
			}
		}
		throw err;
	}
};
export const odhlasit = async () => {
	const { signOut } = await import('@firebase/auth');
	return signOut(auth);
};

//// REALTIME: lidé a firmy k nim příslušející + admini

export const realtime = getDatabase(app);

const firmyRef = ref(realtime, '/firmy');
const lidiRef = ref(realtime, '/lidi');

const sprateleneFirmy_ = async (
	user: import('@firebase/auth').User | null
): Promise<[Firma[], Firma[]]> => {
	if (!user) {
		return [[], []];
	}
	const { get, child } = await import('@firebase/database');
	if (user.email?.endsWith('@regulus.cz') || (await jeAdmin_(user))) {
		const vsechnyFirmy = (await get(firmyRef)).val() as { [ico: string]: Firma };
		return [Object.values(vsechnyFirmy), Object.values(vsechnyFirmy)];
	}
	const ja = (await get(child(lidiRef, user.uid))).val() as Clovek;
	if (ja[0] !== user.email) {
		return [[], []];
	}
	const dovolenaIca = (ja?.slice(1, 3).map((ica) => Object.keys(ica)) as
		| [string[], string[]]
		| null) ?? [[], []];
	return (await Promise.all(
		dovolenaIca.map(
			async (ica) =>
				(await Promise.all(
					ica.map(async (ico) => (await get(child(firmyRef, ico))).val() as Firma)
				)) as Firma[]
		)
	)) as [Firma[], Firma[]];
};
export const sprateleneFirmy = derived(
	prihlasenState,
	(user, set) => {
		(async () => set(user != 'null' ? await sprateleneFirmy_(user) : [[], []]))();
	},
	[[], []] as [Firma[], Firma[]]
);

const jeAdmin_ = async (user: import('@firebase/auth').User | null) =>
	!!(await user?.getIdTokenResult())?.claims?.admin;
export const jeAdmin = derived(
	prihlasenState,
	(user, set) => {
		(async () => set(user != 'null' ? await jeAdmin_(user) : false))();
	},
	false
);

const zodpovednaOsoba_ = async (user: import('@firebase/auth').User | null) => {
	if (!user) return null;
	const { get, child } = await import('@firebase/database');
	const ja = (await get(child(lidiRef, user.uid))).val() as Clovek;
	return ja?.[3];
};

export const zodpovednaOsoba = derived(
	prihlasenState,
	(user, set) => {
		(async () => set(user != 'null' ? await zodpovednaOsoba_(user) : null))();
	},
	null as string | null
);

export const seznamLidi = writable([] as Clovek[]);

jeAdmin.subscribe(() => {
	onValue(lidiRef, (data) => {
		seznamLidi.set(Object.values(data.val() as { [uid: string]: Clovek }));
	});
});


export const db = getFirestore(app);

export const evidence = async (user: string, id: string) => {
	const { getDoc, doc } = await import('@firebase/firestore');
	return await getDoc(doc(db, 'uzivatele', `/${user}`, "evidence", `/${id}`));
};
export const novaEvidence = async (data: RawData) => {
	const { addDoc, collection } = await import('@firebase/firestore');
	const user = auth.currentUser?.uid
	return (await addDoc(collection(db, 'uzivatele', `/${user}`, "evidence"), data)).id;
};
export const odstranitEvidenci = async (user: string, id: string) => {
	const { deleteDoc, doc } = await import('@firebase/firestore');
	return await deleteDoc(doc(db, 'uzivatele', `/${user}`, 'evidence', `/${id}`));
};