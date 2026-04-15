import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { Params } from '../../api/recommend-rk/+server';
import { setTitle } from '$lib/helpers/globals';
import type { RecommendationData } from '$lib/data';

export const load: PageLoad = async ({ url, parent, fetch }) => {
    if (!browser) return null;
    const code = url.searchParams.get('code');

    const t = (await parent()).translations.dk.requestPage;

    try {
        setTitle(t.title, false, true);

        if (!code) error(403, t.codeMissingError);

        const response = await fetch(`/api/recommend-rk`, {
            method: 'POST',
            body: JSON.stringify({ code, action: 'getData' } satisfies Params),
            headers: {
                'content-type': 'application/json',
            },
        });

        if (!response.ok) error(response.status, await response.text() || t.codeInvalidError);

        const userData: RecommendationData = await response.json();

        if (!userData) error(403, t.codeInvalidError);

        return {
            code, ...userData,
        };
    } catch (e) {
        console.error(e)
        const t = (await parent()).translations.dk.requestPage;

        error(400, t.codeInvalidError);
    }
};