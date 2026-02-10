import { currentUser, getToken } from './auth';
import { htmlToText } from 'html-to-text';
import { type Component, mount } from 'svelte';
import { dev } from '$app/environment';
import { get } from 'svelte/store';
import type { User } from 'firebase/auth';
import { addEmailToOfflineQueue } from '$lib/client/offlineQueue.svelte';
import { upload } from "@vercel/blob/client";
import { getIsOnline } from '$lib/client/realtimeOnline';

export type Address = {
    name: string;
    address: string;
};
export type AddressLike = Address | string | (Address | string)[];
export type BaseEmailOptions = {
    from: Address | string;
    replyTo?: AddressLike;
    to?: AddressLike;
    cc?: AddressLike;
    bcc?: AddressLike;
    subject: string;
    attachments?: File[];
}

export type ComponentEmailOptions<Props extends Record<string, unknown>> = BaseEmailOptions & {
    component: Component<Props, Record<string, unknown>, '' | keyof Props>;
    props: Props;
}

export type HtmlEmailOptions = BaseEmailOptions & ({
    text: string, html?: string,
} | {
    text?: string, html: string,
})

export type EmailOptions = BaseEmailOptions & {
    text: string, html: string,
}

export type EmailMessage = Omit<EmailOptions, 'attachments'> & {
    attachments?: {
        path: string;
        filename: string;
        contentType: string;
        contentDisposition: 'attachment' | 'inline';
    }[];
}

export const sendEmail = async <Props extends Record<string, unknown>>(options: ComponentEmailOptions<Props>) => {
    const div = document.createElement('div');
    mount(options.component, {
        target: div,
        props: options.props,
    });
    const newOptions: HtmlEmailOptions = {
        ...options,
        html: div.innerHTML,
    };
    return await sendHtmlEmail(newOptions);
};

export const sendHtmlEmail = async (options: HtmlEmailOptions) => {
    const newOptions: EmailOptions = {
        ...options,
        html: options.html ?? '',
        text: options.text ?? htmlToText(options.html ?? ''),
    }

    if (!getIsOnline()) {
        addEmailToOfflineQueue(newOptions);
        return new Response('OK', {
            status: 200,
        });
    }

    return await sendEmailAndUploadAttachments(newOptions);
};

export const sendEmailAndUploadAttachments = async (options: EmailOptions) => {
    const message: EmailMessage = {
        ...options, attachments: await options.attachments?.map(async (a, i) => {
            const result = await upload(a.name, a, {
                access: 'public',
                contentType: a.type,
                onUploadProgress: ({ percentage }) => {
                    console.log('Attachment', i, percentage)
                },
                handleUploadUrl: '/api/upload-handler',
            });
            console.log(result);
            return {
                path: result.url,
                filename: a.name,
                contentType: result.contentType,
                contentDisposition: result.contentDisposition.split(';')[0] as 'attachment' | 'inline',
            };
        }).awaitAll(),
    };

    const token = await getToken();
    return await fetch(`/api/sendEmail?token=${token}`, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
            'content-type': 'application/json',
        },
    });
};

export const receiver = 'seir@regulus.cz' as const satisfies AddressLike;
export const cervenka = [
    { name: 'David Červenka', address: 'david.cervenka@regulus.cz' },
    { name: 'Jakub Červenka', address: 'jakub.cervenka@regulus.cz' },
] as const satisfies AddressLike;
export const blahova = { name: 'Andrea Bláhová', address: 'blahova@regulus.cz' } as const satisfies AddressLike;

export const SENDER = (name?: string): Address => ({
    name: name ? name + ' (Regulus SEIR)' : 'Regulus SEIR',
    address: 'aplikace.regulus@gmail.com',
});

export const userAddress = (user: User) => ({
    address: user.email!,
    name: user.displayName ?? '',
}) satisfies AddressLike;

export const defaultAddresses = (recipient: AddressLike = receiver, sendCopy: boolean = false, name?: string) => {
    const user = userAddress(get(currentUser)!);
    return ({
        from: SENDER(name),
        replyTo: user,
        to: !dev ? recipient : user,
        cc: !dev && sendCopy ? user : undefined,
    });
};
