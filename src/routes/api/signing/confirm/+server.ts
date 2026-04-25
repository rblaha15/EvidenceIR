import { error, type RequestHandler } from '@sveltejs/kit';
import { checkToken } from '$lib/server/auth';
import { setSignature } from '$lib/server/firestore';
import { type CodeAttemptParams, SMS_ATTEMPT_MINIMUM_WAIT_TIME, SMS_CODE_LIFETIME } from '$lib/features/signing/domain/sms';
import { validateRequest } from '../validateSigningRequest';
import { getSigning, putCodeAttempt, putSigningResult } from '$lib/server/signing';

export const POST: RequestHandler = async ({ request, url }) => {
    const token = url.searchParams.get('token')!;
    const user = await checkToken(token) ?? error(401);
    const { def, signingBy, initiatingUserName, code, timezone }: CodeAttemptParams = await request.json();

    const pdf = await validateRequest(def, user);

    const signing = await getSigning(def);
    if (signing.result) error(409);
    const now = Date.now();

    const last = signing.attempts.last();
    if (last && (now - last.triedAt) < SMS_ATTEMPT_MINIMUM_WAIT_TIME) {
        await putCodeAttempt(def, { code, triedAt: now, triedBy: user.uid });
        error(429);
    }

    const livingMessages = signing.messages
        .filter(message => (now - message.sentAt) < SMS_CODE_LIFETIME);
    if (livingMessages.length && livingMessages[0].sentBy != user.uid) error(409);

    const correctSMS = livingMessages.find(sms => sms!.code === code);
    if (!correctSMS) {
        await putCodeAttempt(def, { code, triedAt: now, triedBy: user.uid });
        return error(401);
    }

    const initiatingUser = {
        uid: user.uid, email: user.email!, ...initiatingUserName ? { name: initiatingUserName } : {},
    };
    await putCodeAttempt(def, { code, triedAt: now, triedBy: user.uid });
    await putSigningResult(def, {
        code, initiatingUser, sentAt: correctSMS.sentAt, signedAt: now, signedBy: signingBy,
    });
    await setSignature(pdf.type, def.id, def.pdf, def.parameter, {
        state: 'signed', signedAt: now, signedBy: signingBy, code, initiatingUser, timezone,
    });

    return new Response('Ok');
};