import type { AuthTypes } from '$lib/client/authentication';
import { SENDER } from '$lib/client/email';
import type { LanguageCode } from '$lib/languageCodes';
import { auth } from '$lib/server/auth';
import { checkUserByEmail } from '$lib/server/db/admin/auth';
import { createToken, validateToken } from '$lib/server/db/admin/tokens';
import { addPerson, getPersonByEmail, getTechnicians } from '$lib/server/db/arrays';
import { sendEmail } from '$lib/server/email';
import { getTranslations } from '$lib/translations';
import { htmlToText } from 'html-to-text';

type Args = {
    [Type in keyof AuthTypes]: { action: Type } & AuthTypes[Type]['params']
}[keyof AuthTypes]

type Result = {
    [Type in keyof AuthTypes]: AuthTypes[Type]['returns']
}[keyof AuthTypes]

const sendResetEmail = async ({ origin, email, lang, mode, redirect }: {
    origin: string,
    email: string,
    lang: LanguageCode,
    mode: "reset" | "register",
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

export default async (args: Args, headers: Headers, origin: string): Promise<Result> => {
    if (args.action == 'trySignUp') {
        const userAlreadyExists = await checkUserByEmail(args.email);
        const person = await getPersonByEmail(args.email);
        if (person && userAlreadyExists)
            return { result: 'emailInUse' };
        if (!person && !args.email.endsWith('@regulus.cz'))
            return { result: 'useBusinessEmail' };
        if (!person && !args.email.split('@')[0].includes('.'))
            return { result: 'useNameSurnameEmail' };
        if (!person) await addPerson({
            email: args.email,
            name: (await getTechnicians()).find(t => t.email == args.email)?.name ?? args.email,
            allowUPT: true,
            assemblyCompanies: [],
            commissioningCompanies: []
        });

        await sendResetEmail({ origin, email: args.email, lang: args.lang, redirect: args.redirect, mode: 'register' });
        return { result: 'sent' };
    } else if (args.action == 'sendPasswordResetEmail') {
        const person = await getPersonByEmail(args.email);
        if (!person) return {};

        const user = await checkUserByEmail(args.email);
        if (!user) return {};

        await sendResetEmail({ origin, email: args.email, lang: args.lang, redirect: args.redirect, mode: 'reset' });
        return {};
    } else if (args.action == 'setPassword') {
        const tokenVerified = await validateToken(args.token, args.email, 'reset');
        if (!tokenVerified) return { result: 'tokenInvalid' };

        const person = await getPersonByEmail(args.email);
        if (!person) return { result: 'fail' };

        const user = await checkUserByEmail(args.email);
        if (!user) return { result: 'fail' };

        const result = await auth.api.setPassword({
            body: {
                newPassword: args.password,
            },
            headers,
        });
        return {
            result: result ? 'success' : 'fail',
        };
    }

    console.log('Invalid action', args);
    return {} as Result;
}