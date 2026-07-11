import { type EmailMessage } from '$lib/client/email';
import { authEndpoints } from '$lib/server/auth/endpoints';
import { dbEndpoints } from '$lib/server/db/endpoints';
import {
    addAuthRulesBasedOnPrefixes,
    defineEndpoint,
    type InferEndpoints,
    prefixEndpoints
} from '$lib/server/defineEndpoints';
import { sendEmail } from '$lib/server/email';
import { signingEndpoints } from '$lib/server/signing/endpoints';
import type { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

export const allEndpoints = {
    ...prefixEndpoints(addAuthRulesBasedOnPrefixes(dbEndpoints), 'db'),
    ...prefixEndpoints(addAuthRulesBasedOnPrefixes(signingEndpoints), 'signing'),
    ...prefixEndpoints(authEndpoints, 'auth'),
    sendEmail: defineEndpoint<{ message: EmailMessage }, SentMessageInfo>(async ({ message }) => {
        return await sendEmail(message);
    }, { requireLoggedIn: true })
};

export type AllEndpoints = InferEndpoints<typeof allEndpoints>;