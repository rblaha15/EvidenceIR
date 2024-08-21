import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { checkAuth } from '$lib/client/auth';

export const load: PageLoad = async () => {
	if (!(await checkAuth()) && browser) return error(404, "Not Found")
};