import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const user = url.searchParams.get("user")
	const id = url.searchParams.get("id")

	if (!user || !id) return error(404, "Not Found")

	return { user, id };
};

export const prerender = false;