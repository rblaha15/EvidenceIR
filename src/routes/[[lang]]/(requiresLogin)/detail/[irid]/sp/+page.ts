import type { PageLoad } from './$types';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async () => {
    if ((!await checkAuth() || !await checkRegulusOrAdmin()) && browser) error(401)
}