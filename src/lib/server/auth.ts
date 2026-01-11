import { type CreateRequest, type DecodedIdToken, getAuth, type UpdateRequest } from 'firebase-admin/auth';
import { app } from './firebase';
import '$lib/extensions';

import type { LanguageCode } from '$lib/languageCodes';

const auth = getAuth(app);

export const checkToken = (token: string | undefined | null) =>
    new Promise<DecodedIdToken | null>((resolve) => {
        if (!token) resolve(null);
        else auth.verifyIdToken(token, true)
            .then(resolve)
            .catch((e) => {
                console.log(e);
                resolve(null);
            });
    });

export const checkAdmin = (token: DecodedIdToken) => token.admin;
export const checkRegulus = (token: DecodedIdToken) => token.email!.endsWith('@regulus.cz');
export const checkRegulusOrAdmin = (token: DecodedIdToken) => checkAdmin(token) || checkRegulus(token);

export const getUsersByEmail = (emails: string[]) => promiseBy100(emails.map(email => ({ email })), ids => auth.getUsers(ids));
export const getUserByEmail = (email: string) => auth.getUserByEmail(email);
export const getUserByID = (uid: string) => auth.getUser(uid);
export const getUsersByID = (uids: string[]) => promiseBy100(uids.map(uid => ({ uid })), ids => auth.getUsers(ids));

export const createUser = (props: CreateRequest) => auth.createUser(props);
export const createUsers = (props: CreateRequest[]) => Promise.all(props.map(props => createUser(props)));

export const enableUser = (uid: string) => auth.updateUser(uid, { disabled: false });

export const removeUsers = (uids: string[]) => promiseBy100(uids, uids => auth.deleteUsers(uids));

const promiseBy100 = <T, U>(arr: T[], mapper: (value: T[], index: number, array: T[][]) => Promise<U>): Promise<U[]> =>
    Promise.all(arr.chunk(100).map(mapper));

export const removeAccounts = async () => {
    (await auth.deleteUsers((await auth.listUsers()).users.filter(u => u.disabled).map(u => u.uid))).errors.forEach(e => console.error(e));
};

export const getPasswordResetLink = async (email: string, lang: LanguageCode, redirect: string, mode: string) => {
    const link = await auth.generatePasswordResetLink(email);
    const url = new URL(link);

    return `/${lang}/newPassword?mode=${mode}&oobCode=${url.searchParams.get('oobCode')}&redirect=${redirect}`;
};

export const updateUser = (uid: string, properties: UpdateRequest) => auth.updateUser(uid, properties);