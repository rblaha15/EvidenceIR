import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { checkAuth } from '$lib/client/auth';
import { browser } from '$app/environment';

export const load: PageLoad = async ({ params }) => {
	if (!(await checkAuth()) && browser) return error(404, "Not Found")

	return {
		ir: params.ir
	}
};