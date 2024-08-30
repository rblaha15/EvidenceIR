import { getAuth, onAuthStateChanged, verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword, type User, signOut } from 'firebase/auth';
import { app } from './firebase';
import { derived, writable } from 'svelte/store';

const auth = getAuth(app);

// let lock = false;

export const currentUser = writable(null as User | null);
onAuthStateChanged(auth, (usr) => currentUser.set(usr));

// export const prihlasit = async (email: string, heslo: string) => {
// 	if (heslo == '123456')
// 		throw {
// 			code: 'auth/user-not-found'
// 		};
// 	const { signInWithEmailAndPassword } = await import('firebase/auth');
// 	try {
// 		return await signInWithEmailAndPassword(auth, email, heslo);
// 	} catch (err) {
// 		if ((err as { code: string }).code == 'auth/wrong-password') {
// 			lock = true;

// 			try {
// 				await signInWithEmailAndPassword(auth, email, '123456');
// 			} catch (err) {
// 				lock = false;
// 				throw err;
// 			}

// 			const { signOut } = await import('firebase/auth');
// 			await signOut(auth);

// 			lock = false;
// 			throw { code: 'auth/user-not-found' };
// 		}
// 		throw err;
// 	}
// };
// export const zmenitHeslo = async (email: string, heslo: string) => {
// 	if (heslo == '123456')
// 		throw {
// 			code: 'auth/weak-password'
// 		};
// 	const { signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword } =
// 		await import('firebase/auth');
// 	try {
// 		const user = await signInWithEmailAndPassword(auth, email, '123456');
// 		return await updatePassword(user.user, heslo);
// 	} catch (err) {
// 		if ((err as { code: string }).code == 'auth/wrong-password') {
// 			throw {
// 				code: 'auth/email-already-in-use'
// 			};
// 		} else if ((err as { code: string }).code == 'auth/user-not-found') {
// 			if (email.endsWith('@regulus.cz')) {
// 				await createUserWithEmailAndPassword(auth, email, heslo);
// 				return;
// 			}
// 		}
// 		throw err;
// 	}
// };

export const logOut = () => signOut(auth)

export const checkAuth = async () => {
	await auth.authStateReady()
	return auth.currentUser != null
}

export const getToken = async () => {
	await auth.authStateReady()
	return auth.currentUser!.getIdToken(true)
}

const _checkAdmin = async (user: User) =>
	!!(await user.getIdTokenResult()).claims.admin;

export const checkAdmin = async () => {
	await auth.authStateReady()
	return await checkAuth() && _checkAdmin(auth.currentUser!)
}

// export const sendPasswordResetEmail = (email: string) => {
// 	spre(auth, email)
// }

// const lang = derived(page, page => page.data?.languageCode ?? '')

// if (browser) lang.subscribe(lang => auth.languageCode = lang)

export const isUserAdmin = derived(
	currentUser,
	(user, set) => {
		(async () => set(user != null ? await _checkAdmin(user) : false))();
	},
	false
);

export const logIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)

export const verifyCode = (oobCode: string) => new Promise<string | null>(resolve => {
	verifyPasswordResetCode(auth, oobCode)
		.then(e => resolve(e))
		.catch(_ => resolve(null))
})

export const changePassword = (oobCode: string, newPassword: string) => confirmPasswordReset(auth, oobCode, newPassword)