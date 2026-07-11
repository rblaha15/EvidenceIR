import {
    type CodeAttemptParams,
    SMS_ATTEMPT_MINIMUM_WAIT_TIME,
    SMS_CODE_LIFETIME
} from '$lib/features/signing/domain/sms';
import { type User } from '$lib/server/auth';
import { getSigning, putCodeAttempt, putSigningResult, setSignature } from '$lib/server/db/admin/signing';
import { error } from '@sveltejs/kit';
import { validateRequest } from './validateSigningRequest';

export const confirmCode = async (
    { def, signingBy, code, timezone }: CodeAttemptParams, user: User,
) => {
    const pdf = await validateRequest(def, user);

    const signing = await getSigning(def);
    if (signing.result) error(409);
    const now = Date.now();

    const last = signing.attempts.last();
    if (last && (now - last.triedAt) < SMS_ATTEMPT_MINIMUM_WAIT_TIME) {
        await putCodeAttempt(def, { code, triedAt: now, triedBy: user.email });
        error(429);
    }

    const livingMessages = signing.messages
        .filter(message => (now - message.sentAt) < SMS_CODE_LIFETIME);
    if (livingMessages.length && livingMessages[0].sentBy != user.email) error(409);
    if (!livingMessages.length) {
        await setSignature(pdf.type, def.id, def.pdf, def.parameter, undefined);
    }

    const correctSMS = livingMessages.find(sms => sms!.code === code);
    if (!correctSMS) {
        await putCodeAttempt(def, { code, triedAt: now, triedBy: user.email });
        const oldMessage = signing.messages.find(sms => sms!.code === code);
        return error(401, oldMessage ? 'too-late' : 'wrong-code');
    }

    const initiatingUser = {
        email: user.email, name: user.name,
    };
    await putCodeAttempt(def, { code, triedAt: now, triedBy: user.email });
    await putSigningResult(def, {
        code, initiatingUser, sentAt: correctSMS.sentAt, signedAt: now, signedBy: signingBy,
    });
    await setSignature(pdf.type, def.id, def.pdf, def.parameter, {
        state: 'signed', signedAt: now, signedBy: signingBy, code, initiatingUser, timezone,
    });
};