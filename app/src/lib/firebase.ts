import { initializeApp } from '@firebase/app';
import type { FirebaseOptions } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getDatabase, ref } from '@firebase/database';
import { list } from 'rxfire/database';
import { map, startWith } from 'rxjs';

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
export const seznamFirem = list(firmyRef).pipe(startWith([]));
//.pipe(map((value) => value.map(({ snapshot }) => snapshot.val as unknown as string[])));
