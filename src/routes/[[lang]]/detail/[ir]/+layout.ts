import { error } from '@sveltejs/kit';
import { checkAuth } from '$lib/client/auth';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	if (!(await checkAuth()) && browser) return error(404, "Not Found")

	return {
		ir: params.ir
	}
};