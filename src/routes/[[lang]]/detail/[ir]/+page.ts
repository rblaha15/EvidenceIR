import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { checkAuth } from '$lib/firebase';

export const load: PageLoad = async ({ params }) => {
	if (!(await checkAuth())) return error(404, "Not Found")

	return {
		ir: params.ir
	}
};