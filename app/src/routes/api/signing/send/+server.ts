import { error, type RequestHandler } from '@sveltejs/kit';
import { checkToken } from '$lib/server/auth';
import { type SendCodeParams, SMS_CODE_LIFETIME, SMS_SEND_MINIMUM_WAIT_TIME } from '$lib/features/signing/domain/sms';
import { sendSMS } from '$lib/server/sms';
import { setSignature } from '$lib/server/firestore';
import { generate } from 'otp-generator';
import { getSigning, putSentMessage } from '$lib/server/signing';
import { validateRequest } from '../validateSigningRequest';

const generateOTP = () => {
    const undivided = generate(8, {
        specialChars: false, lowerCaseAlphabets: false,
    });
    return undivided.slice(0, 4) + '-' + undivided.slice(4, 8);
};

const smsBody = (otp: string) => `Regulus SEIR: Váš kód pro potvrzení dokumentu je: ${otp}`;

export const POST: RequestHandler = async ({ request, url, fetch }) => {
    const token = url.searchParams.get('token')!;
    const user = await checkToken(token) ?? error(401);
    const { def, signingBy, initiatingUserName }: SendCodeParams = await request.json();

    const pdf = await validateRequest(def, user);

    const signing = await getSigning(def);
    if (signing.result) error(409);
    const now = Date.now();

    const livingMessages = signing.messages
        .filter(message => (now - message.sentAt) < SMS_CODE_LIFETIME);
    if (livingMessages.length && livingMessages[0].sentBy != user.uid) error(409);

    const last = livingMessages.last();
    if (last && (now - last.sentAt) < SMS_SEND_MINIMUM_WAIT_TIME) error(429);

    const otp = generateOTP();

    await sendSMS(smsBody(otp), signingBy.phone, fetch);

    await putSentMessage(def, {
        sentAt: now, sentBy: user.uid, code: otp,
    });
    await setSignature(pdf.type, def.id, def.pdf, def.parameter, {
        state: 'sentCodes', initiatingUser: {
            uid: user.uid, email: user.email!, ...initiatingUserName ? { name: initiatingUserName } : {},
        },
    });

    return new Response();
};