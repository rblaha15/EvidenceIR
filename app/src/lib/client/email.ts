import type { Address, Attachment } from 'nodemailer/lib/mailer';
import { currentUser, getToken } from './auth';
import { htmlToText } from 'html-to-text';
import { type Component, mount } from 'svelte';
import { dev } from '$app/environment';
import { get } from 'svelte/store';
import type { User } from 'firebase/auth';
import { getIsOnline } from '$lib/client/realtime';
import { addEmailToOfflineQueue } from '$lib/client/offlineQueue';
import type { Readable } from 'node:stream';

export type AttachmentLike = Omit<Attachment, 'content'> & {
    content?: number[] | string | Buffer<ArrayBufferLike> | Readable | undefined,
};
export type AddressLike = Address | string | (Address | string)[];
export type EmailOptions<Props extends Record<string, unknown>> = {
    from: Address | string;
    replyTo?: AddressLike;
    to?: AddressLike;
    cc?: AddressLike;
    bcc?: AddressLike;
    subject: string;
    attachments?: AttachmentLike[];
    component: Component<Props, Record<string, unknown>, '' | keyof Props>;
    props: Props;
}
export type EmailMessage = Omit<EmailOptions<never>, 'component' | 'props'> & {
    text: string, html: string,
}

export const sendEmail = async <Props extends Record<string, unknown>>(options: EmailOptions<Props>) => {
    const div = document.createElement('div');
    mount(options.component, {
        target: div,
        props: options.props,
    });
    const html = div.innerHTML;
    const message: EmailMessage = {
        ...options.omit('props', 'component'), html, text: htmlToText(html),
    };

    if (!getIsOnline()) {
        addEmailToOfflineQueue(message);
        return new Response('OK', {
            status: 200,
        });
    }

    const token = await getToken();
    return await fetch(`/api/sendEmail?token=${token}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
            'content-type': 'application/json',
        },
    });
};

export const receiver = 'seir@regulus.cz' as const satisfies AddressLike

export const SENDER: Address = {
    name: 'Regulus SEIR',
    address: 'aplikace.regulus@gmail.com',
};

export const userAddress = (user: User) => ({
    address: user.email!,
    name: user.displayName ?? '',
}) satisfies AddressLike;

export const defaultAddresses = (recipient: AddressLike = receiver, sendCopy: boolean = false) => {
    const user = userAddress(get(currentUser)!);
    return ({
        from: SENDER,
        replyTo: user,
        to: dev ? 'radek.blaha.15@gmail.com' : recipient,
        cc: dev || !sendCopy ? undefined : user,
    });
}
