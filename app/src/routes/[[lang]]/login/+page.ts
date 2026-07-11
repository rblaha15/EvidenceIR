import { browser } from '$app/environment';
import { getIsLoggedIn } from '$lib/client/auth';
import { initialRouteLoggedIn } from '$lib/helpers/globals';
import { redirect } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { langEntryGenerator } from '$lib/helpers/paths';

export const load: PageLoad = async ({ url }) => {
    const redirectPath = url.searchParams.get('redirect') || initialRouteLoggedIn;
    if (browser && await getIsLoggedIn()) return redirect(300, redirectPath);
};

export const entries: EntryGenerator = langEntryGenerator;
export const prerender = false;