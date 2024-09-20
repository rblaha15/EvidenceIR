import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig: import('firebase/app').FirebaseOptions = {
	apiKey: 'AIzaSyCKu8Z4wx55DfrZdYtKvrqvwZ2Y6nQvx24',
	authDomain: 'evidence-ir.firebaseapp.com',
	projectId: 'evidence-ir',
	storageBucket: 'evidence-ir.appspot.com',
	messagingSenderId: '1021340777991',
	appId: '1:1021340777991:web:d44750968c2d8dbc8834a2',
	measurementId: 'G-8KZH7Q0ZLC',
	databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app/'
};

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

export const firestore = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })

export const realtime = getDatabase(app);

export const auth = getAuth(app);