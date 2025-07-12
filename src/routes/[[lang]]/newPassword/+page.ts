import { browser } from '$app/environment';
import { verifyCode } from '$lib/client/auth';
import { redirect } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { langEntryGenerator } from '../helpers';

export const entries: EntryGenerator = langEntryGenerator;

export const load: PageLoad = async ({ params, url }) => {
    const oob = browser ? url.searchParams.get('oobCode') : null;
    const email = oob ? await verifyCode(oob) : null;
    if (browser && oob && !email) return redirect(302, '/' + params.lang + '/login?redirect=' + url.searchParams.get('redirect'));

    return {
        email,
    };
};

export const prerender = true;