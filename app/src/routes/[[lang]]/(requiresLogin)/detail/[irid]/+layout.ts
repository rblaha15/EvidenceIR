import type { LayoutLoad } from './$types';
import type { ID } from '$lib/client/data';

export const load: LayoutLoad = async ({ params }) => {
	return {
		id: params.irid as ID
	} as const
};

export const prerender = false
