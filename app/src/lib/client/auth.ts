import { waitForFirst, filtered } from '$lib/helpers/stores';
import type { auth } from '$lib/server/auth';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { type FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { derived, get } from 'svelte/store';

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
    ],
});

export type SessionData = typeof authClient['$Infer']['Session'];
export type User = SessionData['user'];
export type Session = SessionData['session'];

export const pendingSessionData = derived(authClient.useSession(),
    (response): SessionData | null | 'pending' => response.isPending ? 'pending' : response.data,
);
export const pendingUser = derived(pendingSessionData,
    ($data): User | null | 'pending' => $data == 'pending' || !$data ? $data : $data.user,
);
export const pendingSession = derived(pendingSessionData,
    ($data): Session | null | 'pending' => $data == 'pending' || !$data ? $data : $data.session,
);

export const sessionData = filtered(pendingSessionData, $data => $data != 'pending');
export const user = filtered(pendingUser, $data => $data != 'pending');
export const session = filtered(pendingSession, $data => $data != 'pending');

export const getCachedSessionData = (): SessionData | null => get(sessionData) ?? null;
export const getCachedUser = (): User | null => get(user) ?? null;
export const getCachedSession = (): Session | null => get(session) ?? null;

export const getSessionData = (): Promise<SessionData | null> => waitForFirst(pendingSessionData, $data => $data != 'pending');
export const getUser = (): Promise<User | null> => waitForFirst(pendingUser, $data => $data != 'pending');
export const getSession = (): Promise<Session | null> => waitForFirst(pendingSession, $data => $data != 'pending');

type Check1 = (user: User | null) => user is User;
type Check2 = (user: User | null) => boolean;
export const checkedIsLoggedIn: Check1 = user => user != undefined;
export const checkIsAdmin: Check2 = user => checkedIsLoggedIn(user) && user.role == 'admin';
export const checkIsRegulus: Check2 = user => checkedIsLoggedIn(user) && user.email.endsWith('@regulus.cz');
export const checkIsSlovakRegulus: Check2 = user => checkedIsLoggedIn(user) && user.email.endsWith('@regulus.sk');
export const checkIsRegulusOrAdmin: Check2 = user => checkIsRegulus(user) || checkIsAdmin(user);
export const checkIsAnyRegulusOrAdmin: Check2 = user => checkIsSlovakRegulus(user) || checkIsRegulus(user) || checkIsAdmin(user);

export const getCachedIsLoggedIn = () => checkedIsLoggedIn(getCachedUser());
export const getCachedIsAdmin = () => checkIsAdmin(getCachedUser());
export const getCachedIsRegulusOrAdmin = () => checkIsRegulusOrAdmin(getCachedUser());
export const getCachedIsAnyRegulusOrAdmin = () => checkIsAnyRegulusOrAdmin(getCachedUser());

export const getIsLoggedIn = () => getUser().then(checkedIsLoggedIn);
export const getIsAdmin = () => getUser().then(checkIsAdmin);
export const getIsRegulusOrAdmin = () => getUser().then(checkIsRegulusOrAdmin);
export const getIsAnyRegulusOrAdmin = () => getUser().then(checkIsAnyRegulusOrAdmin);

export const isLoggedIn = derived(user, checkedIsLoggedIn);
export const isAdmin = derived(user, checkIsAdmin);
export const isRegulusOrAdmin = derived(user, checkIsRegulusOrAdmin);
export const isAnyRegulusOrAdmin = derived(user, checkIsAnyRegulusOrAdmin);

export const signOut = async () => {
    await authClient.signOut().thenAlso(console.log).catchAlso(console.log);
};
export const signIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    console.log(result);
    if (result.data) return 'success';
    else return result.error.code! as 'INVALID_EMAIL_OR_PASSWORD' | 'INVALID_EMAIL';
};
export const signUp = async (
    token: string, email: string, password: string, isFromFirebase: boolean = false,
) => {
    const result = await authClient.signUp.email({
        token, source: isFromFirebase ? 'firebase' : 'better-auth', email, password, name: '',
    } as Parameters<typeof authClient.signUp.email>[0]);
    console.log(result);
    if (result.data) return 'success';
    return result.error.code!;
};
export const editPassword = async (currentPassword: string, newPassword: string) => {
    const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    console.log(result);
    if (result.data) return 'success';
    return result.error.code! as 'PASSWORD_TOO_SHORT' | 'INVALID_PASSWORD';
};

const firebaseConfig: FirebaseOptions = {
    apiKey: 'AIzaSyCKu8Z4wx55DfrZdYtKvrqvwZ2Y6nQvx24',
    authDomain: 'evidence-ir.firebaseapp.com',
    projectId: 'evidence-ir',
    storageBucket: 'evidence-ir.appspot.com',
    messagingSenderId: '1021340777991',
    appId: '1:1021340777991:web:d44750968c2d8dbc8834a2',
    measurementId: 'G-8KZH7Q0ZLC',
    databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app/',
};

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

export const tryFirebase = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);

        const token = await firebaseAuth.currentUser!.getIdToken();
        await signUp(token, email, password, true);

        await signIn(email, password);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}