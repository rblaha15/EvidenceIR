import type { AuthTypes } from '$lib/client/authentication';
import { SENDER } from '$lib/client/email';
import { createUser, getPasswordResetLink, getUserByEmail, updateUser } from '$lib/server/auth';
import { sendEmail } from '$lib/server/email';
import { getTranslations } from '$lib/translations';
import type { RequestHandler } from './$types';

type Params = {
    [Type in keyof AuthTypes]: { action: Type } & AuthTypes[Type]['params']
}[keyof AuthTypes]

type Result = {
    [Type in keyof AuthTypes]: AuthTypes[Type]['returns']
}[keyof AuthTypes]

export const POST: RequestHandler = async ({ request, url }) => {

    const data: Params = await request.json();

    let result: Result = {}

    if (data.action == 'createUser') {
        const user = await createUser({ email: data.email })
        result = {
            uid: user.uid
        }
    }
    else if (data.action == 'checkEnabled') {
        result = await new Promise((resolve) =>
            getUserByEmail(data.email)
                .then(u => {
                    resolve({
                        enabled: !u.disabled
                    })
                })
                .catch(_ => {
                    console.log(_)
                    resolve({
                        enabled: null
                    })
                })
        )
    }
    else if (data.action == 'getPasswordResetLink') {
        const link = await getPasswordResetLink(data.email, data.lang, data.redirect, data.mode)
        result = {
            link
        }
    }
    else if (data.action == 'sendPasswordResetEmail') {
        const link = url.origin + await getPasswordResetLink(data.email, data.lang, data.redirect, 'reset')
        const t = getTranslations(data.lang)
        await sendEmail({
            from: SENDER,
            to: data.email,
            subject: t.passwordReset,
            html: t.passwordResetEmailHtml
                .parseTemplate({
                    link, email: data.email,
                })
        })
        result = {}
    }
    else if (data.action == 'enableUser') {
        const user = await getUserByEmail(data.email)
        await updateUser(user.uid, { disabled: false })
        result = {}
    }

    return new Response(JSON.stringify(result), {
        status: Number(200),
    });
};