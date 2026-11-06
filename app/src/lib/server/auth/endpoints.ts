import { dev } from '$app/environment';
import { SENDER } from '$lib/client/email';
import { appUrl } from '$lib/helpers/globals';
import type { LanguageCode } from '$lib/languageCodes';
import { auth } from '$lib/server/auth';
import { checkUserByEmail } from '$lib/server/db/admin/auth';
import { addPerson, getPersonByEmail, getTechnicians } from '$lib/server/db/arrays';
import { createToken, deleteToken, getTokenData, type Token, validateToken } from '$lib/server/db/tokens';
import { defineEndpoint } from '$lib/server/defineEndpoints';
import { sendEmail } from '$lib/server/email';
import { getTranslations } from '$lib/translations';
import { htmlToText } from 'html-to-text';

const sendRegisterEmail = async ({ email, lang, redirect }: {
    email: string,
    lang: LanguageCode,
    redirect: string,
}) => {
    const token = await createToken({ email, mode: 'register', redirect });

    const link = `${appUrl}/${lang}/new-password?token=${token}`;
    const t = getTranslations(lang).auth;
    const html = t.signUpEmailHtml({ link, email });
    const subject = t.signUpEmailSubject;
    return await sendEmail({
        from: SENDER(),
        to: dev ? 'radek.blaha.15@gmail.com' : email,
        subject,
        html,
        text: htmlToText(html)
    });
};

export const sendResetEmail = async ({ email, lang, token }: {
    email: string,
    lang: LanguageCode,
    token: string,
}) => {
    const link = `${appUrl}/${lang}/new-password?token=${token}`;
    const t = getTranslations(lang).auth;
    const html = t.passwordResetEmailHtml({ link, email });
    const subject = t.passwordReset;
    return await sendEmail({
        from: SENDER(),
        to: dev ? 'radek.blaha.15@gmail.com' : email,
        subject,
        html,
        text: htmlToText(html)
    });
};

export const authEndpoints = {
    getTokenData: defineEndpoint<{ token: string }, Token | null>(async ({ token }) => {
        return await getTokenData(token);
    }),
    trySignUp: defineEndpoint<{
        email: string, redirect: string, lang: LanguageCode,
    }, {
        result: 'emailInUse' | 'useNameSurnameEmail' | 'useBusinessEmail' | 'sent',
    }>(async ({ email, redirect, lang }) => {
        const userAlreadyExists = await checkUserByEmail(email);
        const person = await getPersonByEmail(email);
        if (person && userAlreadyExists)
            return { result: 'emailInUse' };
        if (!person && !email.endsWith('@regulus.cz'))
            return { result: 'useBusinessEmail' };
        if (!person && !email.split('@')[0].includes('.'))
            return { result: 'useNameSurnameEmail' };
        if (!person) await addPerson({
            email: email,
            name: (await getTechnicians()).find(t => t.email == email)?.name ?? email,
            allowUPT: true,
            assemblyCompanies: [],
            commissioningCompanies: []
        });

        await sendRegisterEmail({ email, lang, redirect });
        return { result: 'sent' };
    }),
    sendPasswordResetEmail: defineEndpoint<{
        email: string, redirect: string, lang: LanguageCode,
    }, undefined>(async ({ email, redirect, lang }, { headers }) => {
        const person = await getPersonByEmail(email);
        if (!person) {
            console.log(`Person ${email} not found, pretending email sent`);
            return undefined;
        }

        const user = await checkUserByEmail(email);
        if (!user) await sendRegisterEmail({ email, lang, redirect });
        else await auth.api.requestPasswordReset({
            body: {
                email, redirectTo: redirect + `###lang=${lang}`
            },
            headers,
        });
        return undefined;
    }),
    setPassword: defineEndpoint<{
        token: string, email: string, password: string,
    }, {
        result: 'success' | 'fail' | 'tokenInvalid',
    }>(async ({ token, email, password }, { headers }) => {
        const tokenVerified = await validateToken(token, email, 'reset');
        if (!tokenVerified) return { result: 'tokenInvalid' };

        const person = await getPersonByEmail(email);
        if (!person) return { result: 'fail' };

        const user = await checkUserByEmail(email);
        if (!user) return { result: 'fail' };

        const result = await auth.api.resetPassword({
            body: {
                newPassword: password,
                token,
            },
            headers,
        });
        if (result) await deleteToken(token, 'email', 'reset');
        return {
            result: result ? 'success' : 'fail',
        };
    }),
};