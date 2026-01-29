import {
    confirmPasswordReset,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type User,
    verifyPasswordResetCode
} from 'firebase/auth';
import { derived, readonly, writable } from 'svelte/store';
import { auth } from '../../hooks.client';
import { getIsOnline } from '$lib/client/realtimeOnline';

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
    return auth.currentUser!.getIdToken()
}

const _checkAdmin = async (user: User) =>
    /*getIsOnline() ? */!!(await user.getIdTokenResult()).claims.admin/* : false*/;

export const checkAdmin = async () => {
    await auth.authStateReady()
    return await checkAuth() && _checkAdmin(auth.currentUser!)
}

const _checkRegulus = (user: User) =>
    user.email?.endsWith('@regulus.cz');

export const checkRegulusOrAdmin = async () => {
    await auth.authStateReady()
    return await checkAuth() && (_checkRegulus(auth.currentUser!) || await _checkAdmin(auth.currentUser!))
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
        (async () => set(user != null ? (_checkRegulus(user) || await checkAdmin()) : false))();
    },
    false
);

export const userInfo = derived(
    [currentUser, isUserAdmin, isUserRegulusOrAdmin],
    ([currentUser, isUserAdmin, isUserRegulusOrAdmin]) =>
        ({ ...currentUser, isUserAdmin, isUserRegulusOrAdmin })
);

export const setName = (name: string | null | undefined) => updateProfile(auth.currentUser!, { displayName: name });
export const logIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)

export const verifyCode = (oobCode: string) => new Promise<string | null>(resolve => {
    verifyPasswordResetCode(auth, oobCode)
        .then(e => resolve(e))
        .catch(() => resolve(null))
})

export const changePassword = (oobCode: string, newPassword: string) => confirmPasswordReset(auth, oobCode, newPassword)