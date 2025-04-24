import type { Address, Attachment } from 'nodemailer/lib/mailer';
import { getToken } from './auth';
import { htmlToText } from 'html-to-text';
import { type Component, mount } from 'svelte';

export type EmailOptions<Props extends Record<string, unknown>> = {
    from: Address | string;
    replyTo?: Address | string | (Address | string)[];
    to?: Address | string | (Address | string)[];
    cc?: Address | string | (Address | string)[];
    bcc?: Address | string | (Address | string)[];
    subject: string;
    attachments?: Attachment[];
    pdf?: {
        link: string;
        title: string;
    };
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
        ...options, html, text: htmlToText(html)
    };

    const token = await getToken();
    return await fetch(`/api/sendEmail?token=${token}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
            'content-type': 'application/json'
        }
    });
};

export const SENDER = {
    name: 'Regulus SEIR',
    address: 'aplikace.regulus@gmail.com',
};

