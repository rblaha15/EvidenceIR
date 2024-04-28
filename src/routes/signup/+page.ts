import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const email = url.searchParams.get("email")

	return { email };
};

export const prerender = false;