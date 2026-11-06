import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { checkedIsLoggedIn, checkIsAdmin, checkIsAnyRegulusOrAdmin, checkIsRegulusOrAdmin } from '$lib/client/auth';
import type { LanguageCode } from '$lib/languageCodes';
import { sendResetEmail } from '$lib/server/auth/endpoints';
import { authDB } from '$lib/server/db';
import { deleteToken, storeToken, validateToken } from '$lib/server/db/tokens';
import { getPersonByEmail } from '$lib/server/db/arrays';
import { APIError } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { createAuthMiddleware } from 'better-auth/api';
import { betterAuth } from 'better-auth/minimal';

export const auth = betterAuth({
    database: mongodbAdapter(authDB),
    emailAndPassword: {
        enabled: true,
        revokeSessionsOnPasswordReset: true,
        autoSignIn: false,
        sendResetPassword: async ({ user, url, token }) => {
            const redirectTo = decodeURIComponent(new URL(url).searchParams.get('callbackURL')!);
            const [redirect, lang] = redirectTo.split('###lang=') as [string, LanguageCode];
            const email = user.email;

            await storeToken({ redirect, email, mode: 'reset' }, token);
            void sendResetEmail({ email, lang, token });
        },
    },
    hooks: {
        before: createAuthMiddleware(async ctx => {
            if (ctx.path !== '/sign-up/email') return;

            const email = ctx.body.email;

            const tokenVerified = await validateToken(ctx.body.token, email, 'register');
            if (!tokenVerified) throw new APIError(401, { code: 'TOKEN_INVALID' });
            await deleteToken(ctx.body.token, email, 'register');

            const person = await getPersonByEmail(email) || email.endsWith('@regulus.cz');
            if (!person) throw new APIError(400, { code: 'PERSON_INVALID' });

            return {
                context: {
                    ...ctx,
                    body: {
                        ...ctx.body,
                        name: person.name,
                    },
                }
            };
        }),
    },
    user: {
        additionalFields: {
            role: {
                type: ['user', 'admin'],
                defaultValue: 'user',
            },
            lastSeenAt: {
                type: 'date',
                required: false,
            },
        },
    },
    secret: building ? 'DUMMY' : env.BETTER_AUTH_SECRET,
    baseURL: {
        allowedHosts: [
            'localhost:5006',
            'localhost',
            '192.168.100.197:3002',
            '192.168.100.197:8002',
            '192.168.100.197',
            'seir.regulus.cz',
        ],
    },
    trustedOrigins: [
        'http://localhost:5006',
        'http://192.168.100.197:3002',
        'http://192.168.100.197:8002',
        'https://localhost:5006',
        'https://192.168.100.197:8002',
        'https://seir.regulus.cz',
    ],
    advanced: {
        useSecureCookies: false,
    },
});

export type User = typeof auth['$Infer']['Session']['user'];
export type Session = typeof auth['$Infer']['Session']['session'];

export const getIsLoggedIn = (locals: App.Locals) => checkedIsLoggedIn(locals.user);
export const getIsAdmin = (locals: App.Locals) => checkIsAdmin(locals.user);
export const getIsRegulusOrAdmin = (locals: App.Locals) => checkIsRegulusOrAdmin(locals.user);
export const getIsAnyRegulusOrAdmin = (locals: App.Locals) => checkIsAnyRegulusOrAdmin(locals.user);