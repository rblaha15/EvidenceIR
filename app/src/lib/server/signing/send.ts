import { type SendCodeParams, SMS_CODE_LIFETIME, SMS_SEND_MINIMUM_WAIT_TIME } from '$lib/features/signing/domain/sms';
import { type User } from '$lib/server/auth';
import { getSigning, putSentMessage, setSignature } from '$lib/server/db/admin/signing';
import { sendSMS } from '$lib/server/sms';
import { getTranslations } from '$lib/translations';
import { error } from '@sveltejs/kit';
import { generate } from 'otp-generator';
import { validateRequest } from './validateSigningRequest';

const generateOTP = () => {
    const undivided = generate(8, {
        specialChars: false, lowerCaseAlphabets: false,
    }).replaceAll('0', 'O').replaceAll('W', 'v').replaceAll('8', 'B');
    return undivided.slice(0, 4) + '-' + undivided.slice(4, 8);
};

// limit 70 characters, 27 in the message, 9 in the otp, max. 34 in the doc name
const smsBody = (document: string, otp: string) => `Autorizační kód pro "${document}" je: ${otp}`;

export const sendCode = async ({ def, signingBy }: SendCodeParams, user: User) => {
    const pdf = await validateRequest(def, user);

    const signing = await getSigning(def);
    if (signing.result) error(409);
    const now = Date.now();

    const livingMessages = signing.messages
        .filter(message => (now - message.sentAt) < SMS_CODE_LIFETIME);
    if (livingMessages.length && livingMessages[0].sentBy != user.email) error(409);

    const last = livingMessages.last();
    if (last && (now - last.sentAt) < SMS_SEND_MINIMUM_WAIT_TIME) error(429);

    const doc = (pdf.shortTitle ?? pdf.title)(getTranslations('cs'));
    const otp = generateOTP();

    await sendSMS(smsBody(doc, otp), signingBy.phone, fetch);

    await putSentMessage(def, {
        sentAt: now, sentBy: user.email, code: otp, sentTo: signingBy,
    });
    await setSignature(pdf.type, def.id, def.pdf, def.parameter, {
        state: 'sentCodes', initiatingUser: {
            email: user.email, name: user.name,
        },
    });
};