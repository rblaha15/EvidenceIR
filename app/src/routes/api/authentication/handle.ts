import type { AuthTypes } from '$lib/client/authentication';
import { SENDER } from '$lib/client/email';
import type { LanguageCode } from '$lib/languageCodes';
import { generateToken } from '$lib/server/auth';
import { getOrCreateUser, getUserByEmail } from '$lib/server/db/admin/auth';
import { sendEmail } from '$lib/server/email';
import { getTranslations } from '$lib/translations';
import { htmlToText } from 'html-to-text';

type Args = {
    [Type in keyof AuthTypes]: { action: Type } & AuthTypes[Type]['params']
}[keyof AuthTypes]

type Result = {
    [Type in keyof AuthTypes]: AuthTypes[Type]['returns']
}[keyof AuthTypes]

const sendResetEmail = async ({ origin, email, lang, mode, headers, redirect }: {
    origin: string,
    email: string,
    lang: LanguageCode,
    mode: "reset" | "register",
    headers: Headers,
    redirect: string,
}) => {
    const token = await generateToken(email, headers);

    const link = `${origin}/${lang}/newPassword?mode=${mode}&token=${token}&email=${email}&redirect=${redirect}`;
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
        const user = await getUserByEmail(args.email);
        if (user && !user.banned)
            return { result: 'emailInUse' };
        else if (!user && args.email.endsWith('@regulus.cz')) {
            if (args.email.split('@')[0].includes('.')) {
                const name = `Regulus (${args.email})`; // TODO: Získat z tabulky techniků
                await getOrCreateUser(args.email, name);
            } else
                return { result: 'useNameSurnameEmail' };
        } else if (!user)
            return { result: 'useBusinessEmail' };

        await sendResetEmail({ origin, email: args.email, lang: args.lang, redirect: args.redirect, mode: 'register', headers });
        return { result: 'sent' };
    } else if (args.action == 'sendPasswordResetEmail') {
        await sendResetEmail({ origin, email: args.email, lang: args.lang, redirect: args.redirect, mode: 'reset', headers });
        return {};
    }

    console.log('Invalid action', args);
    return {} as Result;
}