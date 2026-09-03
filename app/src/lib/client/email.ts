import { user as userStore, type User } from '$lib/client/auth';
import { call } from '$lib/client/endpoints';
import { env } from '$env/dynamic/public';
import { htmlToText } from 'html-to-text';
import { type Component, mount } from 'svelte';
import { dev } from '$app/environment';
import { get } from 'svelte/store';
import { getIsOnline } from '$lib/client/online';
import { addEmailToHistory } from '$lib/client/history.svelte';

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
        id: string;
        filename: string;
        contentType: string;
    }[];
}

export type ServerEmailMessage = Omit<EmailMessage, 'attachments'> & {
    attachments?: {
        content: Buffer;
        filename: string;
        contentType: string;
    }[];
}

export const sendEmail = async <Props extends Record<string, unknown>>(options: ComponentEmailOptions<Props>) => {
    const div = document.createElement('div');
    mount(options.component, {
        target: div,
        props: options.props,
    });
    const newOptions: HtmlEmailOptions = {
        ...options.omit('component', 'props'),
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

    const isOnline = getIsOnline();
    addEmailToHistory(newOptions, isOnline);
    if (!isOnline) return { ok: true };

    return await sendEmailAndUploadAttachments(newOptions);
};

export const sendEmailAndUploadAttachments = async (options: EmailOptions) => {
    const message: EmailMessage = {
        ...options, attachments: await options.attachments?.map(async file => {
            const { id } = await call('uploadAttachment', file, { isFileUpload: true });
            return {
                id,
                filename: file.name,
                contentType: file.type,
            };
        }).awaitAll(),
    };

    const response = await call('sendEmail', { message });

    return { ok: response.accepted.length };
};

export const receiver = { name: 'Regulus SEIR', address: 'seir@regulus.cz' } as const satisfies AddressLike;
export const cervenka = [
    { name: 'David Červenka', address: 'david.cervenka@regulus.cz' },
    { name: 'Jakub Červenka', address: 'jakub.cervenka@regulus.cz' },
] as const satisfies AddressLike;
export const blahova = { name: 'Andrea Bláhová', address: 'blahova@regulus.cz' } as const satisfies AddressLike;

export const SENDER = (name?: string): Address => ({
    name: name ? name + ' (Regulus SEIR)' : 'Regulus SEIR',
    address: env.PUBLIC_EMAIL_SENDER,
});

export const userAddress = (user: User) => ({
    address: user.email,
    name: user.name,
}) satisfies AddressLike;

export const defaultAddresses = (recipient: AddressLike = receiver, o?: { sendCopy?: boolean, includeName?: boolean }) => {
    const user = userAddress(get(userStore)!);
    const { includeName = false, sendCopy = false } = o ?? {};
    return ({
        from: SENDER(includeName ? user.name : undefined),
        replyTo: user,
        to: !dev ? recipient : user,
        cc: !dev && sendCopy ? user : undefined,
    });
};
