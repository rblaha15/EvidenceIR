import { onAuthStateChanged, verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword, type User, signOut } from 'firebase/auth';
import { derived, readonly, writable } from 'svelte/store';
import { auth } from '../../hooks.client';

const _currentUser = writable(null as User | null);
onAuthStateChanged(auth, (usr) => _currentUser.set(usr));
export const currentUser = readonly(_currentUser)

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

const _checkRegulus = (user: User) =>
	user.email?.endsWith('@regulus.cz');

export const checkRegulusOrAdmin = async () => {
	await auth.authStateReady()
	return await checkAuth() && (_checkRegulus(auth.currentUser!) || _checkAdmin(auth.currentUser!))
}

export const isUserAdmin = derived(
	currentUser,
	(user, set) => {
		(async () => set(user != null ? await _checkAdmin(user) : false))();
	},
	false
);

export const isUserRegulusOrAdmin = derived(
	currentUser,
	(user, set) => {
		(async () => set(user != null ? (await _checkRegulus(user) || await checkAdmin()) : false))();
	},
	false
);

export const logIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)

export const verifyCode = (oobCode: string) => new Promise<string | null>(resolve => {
	verifyPasswordResetCode(auth, oobCode)
		.then(e => resolve(e))
		.catch(() => resolve(null))
})

export const changePassword = (oobCode: string, newPassword: string) => confirmPasswordReset(auth, oobCode, newPassword)