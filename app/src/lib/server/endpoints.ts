import { authEndpoints } from '$lib/server/auth/endpoints';
import { dbEndpoints } from '$lib/server/db/endpoints';
import { addAuthRulesBasedOnPrefixes, type InferEndpoints, prefixEndpoints } from '$lib/server/defineEndpoints';
import { emailEndpoints } from '$lib/server/email';
import { signingEndpoints } from '$lib/server/signing/endpoints';

export const allEndpoints = {
    ...prefixEndpoints(addAuthRulesBasedOnPrefixes(dbEndpoints), 'db'),
    ...prefixEndpoints(addAuthRulesBasedOnPrefixes(signingEndpoints), 'signing'),
    ...prefixEndpoints(authEndpoints, 'auth'),
    ...emailEndpoints,
};

export type AllEndpoints = InferEndpoints<typeof allEndpoints>;