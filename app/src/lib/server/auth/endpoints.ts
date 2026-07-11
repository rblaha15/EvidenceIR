import { SENDER } from '$lib/client/email';
import type { LanguageCode } from '$lib/languageCodes';
import { auth } from '$lib/server/auth';
import { checkUserByEmail } from '$lib/server/db/admin/auth';
import { addPerson, getPersonByEmail, getTechnicians } from '$lib/server/db/arrays';
import { createToken, getTokenData, type Token, validateToken } from '$lib/server/db/tokens';
import { defineEndpoint } from '$lib/server/defineEndpoints';
import { sendEmail } from '$lib/server/email';
import { getTranslations } from '$lib/translations';
import { htmlToText } from 'html-to-text';

const sendResetEmail = async ({ origin, email, lang, mode, redirect }: {
    origin: string,
    email: string,
    lang: LanguageCode,
    mode: 'reset' | 'register',
    redirect: string,
}) => {
    const token = await createToken({ email, mode, redirect });

    const link = `${origin}/${lang}/new-password?token=${token}`;
    const t = getTranslations(lang).auth;
    const html = mode == 'register' ? t.signUpEmailHtml({ link, email }) : t.passwordResetEmailHtml({ link, email });
    const subject = mode == 'register' ? t.signUpEmailSubject : t.passwordReset;
    return await sendEmail({
        from: SENDER(),
        to: email,
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
    }>(async ({ email, redirect, lang }, { origin }) => {
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

        await sendResetEmail({ origin, email: email, lang: lang, redirect: redirect, mode: 'register' });
        return { result: 'sent' };
    }),
    sendPasswordResetEmail: defineEndpoint<{
        email: string, redirect: string, lang: LanguageCode,
    }, undefined>(async ({ email, redirect, lang }, { origin }) => {
        const person = await getPersonByEmail(email);
        if (!person) {
            console.log(`Person ${email} not found, pretending email sent`);
            return undefined;
        }

        const user = await checkUserByEmail(email);

        await sendResetEmail({
            origin,
            email: email,
            lang: lang,
            redirect: redirect,
            mode: user ? 'reset' : 'register'
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

        const result = await auth.api.setPassword({
            body: {
                newPassword: password,
            },
            headers,
        });
        return {
            result: result ? 'success' : 'fail',
        };
    }),
};