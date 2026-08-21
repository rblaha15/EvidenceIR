import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { checkedIsLoggedIn, checkIsAdmin, checkIsAnyRegulusOrAdmin, checkIsRegulusOrAdmin } from '$lib/client/auth';
import { authDB } from '$lib/server/db';
import { validateToken } from '$lib/server/db/tokens';
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
    },
    hooks: {
        before: createAuthMiddleware(async ctx => {
            if (ctx.path !== '/sign-up/email') return;

            console.log(ctx, ctx.body);
            const email = ctx.body.email;

            const tokenVerified = await validateToken(ctx.body.token, email, 'register');
            if (!tokenVerified) throw new APIError(401);

            const person = await getPersonByEmail(email);
            if (!person) throw new APIError(400);

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
        },
    },
    secret: building ? 'DUMMY' : env.BETTER_AUTH_SECRET,
    baseURL: {
        allowedHosts: [
            'localhost:5006',
            'localhost',
            '192.168.100.197:8080',
            '192.168.100.197',
        ],
    },
    trustedOrigins: [
        'http://localhost:5006',
        'http://192.168.100.197:8080',
        'https://localhost:5006',
        'https://192.168.100.197:8080',
    ],
    advanced: {
        useSecureCookies: false, // TODO: enable when HTTPS is configured
    },
});

export type User = typeof auth['$Infer']['Session']['user'];
export type Session = typeof auth['$Infer']['Session']['session'];

export const getIsLoggedIn = (locals: App.Locals) => checkedIsLoggedIn(locals.user);
export const getIsAdmin = (locals: App.Locals) => checkIsAdmin(locals.user);
export const getIsRegulusOrAdmin = (locals: App.Locals) => checkIsRegulusOrAdmin(locals.user);
export const getIsAnyRegulusOrAdmin = (locals: App.Locals) => checkIsAnyRegulusOrAdmin(locals.user);