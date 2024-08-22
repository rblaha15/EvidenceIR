import { redirect } from '@sveltejs/kit';
import { checkAuth } from '$lib/client/auth';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, url }) => {
	if (!(await checkAuth()) && browser) return redirect(302, "/" + params.lang + "/login?redirect=" + url.pathname + url.search)

	return {
		ir: params.ir
	}
};

export const prerender = false
