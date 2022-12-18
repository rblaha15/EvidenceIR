import { initializeApp } from '@firebase/app';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getDatabase, ref, onValue } from '@firebase/database';
import { writable } from 'svelte/store';

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

export const realtime = getDatabase(app);

const firmyRef = ref(realtime, '/firmy');
const lidiRef = ref(realtime, '/lidi');

const seznamFirem = async () => {
	const { get } = await import('@firebase/database');
	return (await get(firmyRef)).val() as string[][];
};
export const sprateleneFirmy = async () => {
	const { get, query, orderByChild, equalTo } = await import('@firebase/database');
	const { ref } = query(lidiRef, orderByChild('0'), equalTo(auth.currentUser?.email ?? ''));
	const dovolenaIca = ((await get(ref)).val() as string[])?.splice(1) ?? [];
	return (await seznamFirem()).filter(([_, ico]) => dovolenaIca.includes(ico)) ?? [];
};

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
