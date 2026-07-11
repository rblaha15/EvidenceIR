import type { CodeAttemptParams, SendCodeParams } from '$lib/features/signing/domain/sms';
import { defineEndpoint } from '$lib/server/defineEndpoints';
import { confirmCode } from '$lib/server/signing/confirm';
import { sendCode } from '$lib/server/signing/send';

export const signingEndpoints = {
    sendCode: defineEndpoint<SendCodeParams, undefined>(async (args, { user }) => {
        await sendCode(args, user);
    }),
    confirmCode: defineEndpoint<CodeAttemptParams, undefined>(async (args, { user }) => {
        await confirmCode(args, user);
    }),
};