import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';

export const load: PageLoad = async () => {
    if (!await checkRegulusOrAdmin() && browser)
        return error(401);
}