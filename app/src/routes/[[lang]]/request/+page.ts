import { browser } from '$app/environment';
import { call } from '$lib/client/endpoints';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent, fetch }) => {
    if (!browser) return null;
    const code = url.searchParams.get('code');

    const t = (await parent()).translations.dk.requestPage;

    try {
        if (!code) error(403, t.codeMissingError);

        const userData = await call('db/open/getRecommendationData', { code }, fetch);

        if (!userData) error(400, t.codeInvalidError);

        return {
            code, ...userData,
        };
    } catch (e) {
        console.error(e);
        const t = (await parent()).translations.dk.requestPage;

        error(400, t.codeInvalidError);
    }
};