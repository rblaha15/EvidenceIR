import { sender } from '$lib/client/email';
import type { LanguageCode } from '$lib/languages';
import { createUser, getPasswordResetLink, getUserByEmail, updateUser } from '$lib/server/auth';
import { sendEmail } from '$lib/server/email';
import type { RequestHandler } from './$types';

export type AuthTypes = {
    createUser: {
        params: {
            email: string,
        }
        returns: {
            uid: string,
        }
    },
    checkEnabled: {
        params: {
            email: string,
        }
        returns: {
            enabled: boolean | null,
        }
    },
    getPasswordResetLink: {
        params: {
            email: string,
            redirect: string,
            lang: LanguageCode,
        }
        returns: {
            link: string
        }
    },
    sendPasswordResetEmail: {
        params: {
            email: string,
            redirect: string,
            lang: LanguageCode,
        }
        returns: {}
    },
    enableUser: {
        params: {
            email: string,
        }
        returns: {}
    },
}

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
        const link = await getPasswordResetLink(data.email, data.lang, data.redirect )
        result = {
            link
        }
    }
    else if (data.action == 'sendPasswordResetEmail') {
        const link = url.origin + await getPasswordResetLink(data.email, data.lang, data.redirect )
        sendEmail({
            from: sender,
            to: data.email,
            subject: `Obnovení hesla`,
            html: `<p>Dobrý den,</p>
<p>pomocí tohoto odkazu můžete obnovit heslo pro aplikaci Evidence IR pro váš účet ${data.email}:</p>
<p><a href="${link}">${link}</a></p>
<p>Pokud jste o obnovení hesla nepožádali, můžete tento e-mail ignorovat.</p>
<p>S pozdravem</p>
<p>Evidence IR</p>`,
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