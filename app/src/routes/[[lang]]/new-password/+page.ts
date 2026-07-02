import { browser } from '$app/environment';
import { getUser } from '$lib/client/auth';
import { fetchDB } from '$lib/client/db/endpoints';
import { langEntryGenerator } from '$lib/helpers/paths';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    if (!browser) return { email: '', mode: 'loading' as const, redirect: '', token: '' };

    const token = url.searchParams.get('token') ?? '';
    const email = url.searchParams.get('email') ?? '';
    const mode = url.searchParams.get('mode') ?? '';
    const redirect = url.searchParams.get('redirect') ?? '';

    if (token) {
        const data = await fetchDB('open/getTokenData', { token });
        if (!data) return error(401, 'Invalid token');

        return { email: data.email, mode: data.mode as 'register' | 'reset', redirect: data.redirect, token };
    } else if (mode == 'edit') {
        const user = await getUser();
        if (!user) return error(401);

        return { email: user.email, mode: 'edit' as const, redirect, token: '' };
    } else if (mode == 'resetSent')
        return { email: '', mode: 'resetSent' as const, redirect: '', token: '' };
    else if (mode == 'resetEmail')
        return { email, mode: 'resetEmail' as const, redirect, token: '' };
    else if (mode)
        return error(400, 'Invalid mode');
    else
        return error(400, 'No mode');
};

export const entries: EntryGenerator = langEntryGenerator;
export const prerender = true;