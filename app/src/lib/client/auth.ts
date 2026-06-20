import type { auth } from '$lib/server/auth';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { derived } from 'svelte/store';

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        adminClient(),
    ],
});

export type User = typeof authClient['$Infer']['Session']['user'];
export type Session = typeof authClient['$Infer']['Session']['session'];

export const sessionData = derived(authClient.useSession(), $session => $session.data);
export const user = derived(sessionData, $data => $data?.user);
export const session = derived(sessionData, $data => $data?.session);

export const getSessionData = () => authClient.getSession().then(session => session.data);
export const getUser = (): Promise<User | undefined> => getSessionData().then(data => data?.user);
export const getSession = (): Promise<Session | undefined> => getSessionData().then(data => data?.session);

type Check1 = (user: User | undefined) => user is User;
type Check2 = (user: User | undefined) => boolean;
export const checkedIsLoggedIn: Check1 = user => user != undefined;
export const checkIsAdmin: Check2 = user => checkedIsLoggedIn(user) && user.role == 'admin';
export const checkIsRegulus: Check2 = user => checkedIsLoggedIn(user) && user.email.endsWith('@regulus.cz');
export const checkIsSlovakRegulus: Check2 = user => checkedIsLoggedIn(user) && user.email.endsWith('@regulus.sk');
export const checkIsRegulusOrAdmin: Check2 = user => checkIsRegulus(user) || checkIsAdmin(user);
export const checkIsAnyRegulusOrAdmin: Check2 = user => checkIsSlovakRegulus(user) || checkIsRegulus(user) || checkIsAdmin(user);

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
    if (result.data) return 'success';
    console.log(result.error.code);
    return result.error.code! as 'INVALID_EMAIL_OR_PASSWORD';
};
export const changePassword = async (token: string, password: string) => {
    const result = await authClient.resetPassword({ token, newPassword: password });
    if (result.data) return 'success';
    console.log(result.error.code);
    return result.error.code! as 'PASSWORD_TOO_SHORT' | 'INVALID_TOKEN';
};