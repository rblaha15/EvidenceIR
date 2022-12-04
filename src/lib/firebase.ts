import { initializeApp } from '@firebase/app';
import type { FirebaseOptions } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getFirestore, getDoc, addDoc, doc, deleteDoc, collection } from '@firebase/firestore';
import { getDatabase, ref, onValue } from '@firebase/database';
import { writable } from 'svelte/store';
import type { Data } from './Vec';

const firebaseConfig: FirebaseOptions = {
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

export const db = getFirestore(app);
export const realtime = getDatabase(app);
export const auth = getAuth(app);

const firmyRef = ref(realtime, '/firmy');

export const seznamFirem = writable([] as string[][]);

onValue(firmyRef, (snapshot) => {
	seznamFirem.set(snapshot.val());
});

export const uzivatel = async (uid: string) => await getDoc(doc(db, 'uzivatele', `/${uid}`));
export const novyUzivatel = async (data: { veci: string }) =>
	(await addDoc(collection(db, 'uzivatele'), data)).id;
export const odstranitUzivatele = async (uid: string) =>
	await deleteDoc(doc(db, 'uzivatele', `/${uid}`));