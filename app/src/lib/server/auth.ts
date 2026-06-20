import { checkedIsLoggedIn, checkIsAdmin, checkIsAnyRegulusOrAdmin, checkIsRegulusOrAdmin } from '$lib/client/auth';
import { db } from '$lib/server/db';
import { enableUser } from '$lib/server/db/admin/auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { betterAuth } from 'better-auth/minimal';
import { admin, oneTimeToken } from 'better-auth/plugins';
import { writable } from 'svelte/store';

const tokens = writable(new Map<string, string>());

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            console.log({ user, url, token, request });
            tokens.update($tokens => {
                $tokens.set(user.email, token);
                return $tokens;
            });
        },
        onPasswordReset: ({ user }) => enableUser(user.id),
        autoSignIn: false,
    },
    plugins: [
        admin(),
        oneTimeToken({
            disableClientRequest: true,
        }),
    ],
});

export type User = typeof auth['$Infer']['Session']['user'];
export type Session = typeof auth['$Infer']['Session']['session'];

export const getIsLoggedIn = (locals: App.Locals) => checkedIsLoggedIn(locals.user);
export const getIsAdmin = (locals: App.Locals) => checkIsAdmin(locals.user);
export const getIsRegulusOrAdmin = (locals: App.Locals) => checkIsRegulusOrAdmin(locals.user);
export const getIsAnyRegulusOrAdmin = (locals: App.Locals) => checkIsAnyRegulusOrAdmin(locals.user);

export const generateToken = (email: string, headers: Headers) => new Promise<string>(async resolve => {
    await auth.api.requestPasswordReset({
        body: {
            email,
        },
        headers,
    });
    tokens.subscribe($tokens => {
        if ($tokens.has(email)) resolve($tokens.get(email)!);
    });
});