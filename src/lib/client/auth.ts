import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { app } from './firebase';
import { derived, writable } from 'svelte/store';

const auth = getAuth(app);

let lock = false;

export const prihlasenState = writable('null' as import('@firebase/auth').User | null | 'null');
onAuthStateChanged(auth, (usr) => prihlasenState.set(lock ? "null" : usr));

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

export const checkAuth = async () => {
	await auth.authStateReady()
	return auth.currentUser != null
}

export const getToken = async () => {
	await auth.authStateReady()
	return auth.currentUser!.getIdToken(true)
}

export const checkAdmin = async (user: import('@firebase/auth').User | null) =>
	!!(await user?.getIdTokenResult())?.claims?.admin;

export const isAdmin = derived(
	prihlasenState,
	(user, set) => {
		(async () => set(user != 'null' ? await checkAdmin(user) : false))();
	},
	false
);