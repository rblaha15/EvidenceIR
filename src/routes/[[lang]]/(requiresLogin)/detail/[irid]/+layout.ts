import type { LayoutLoad } from './$types';
import type { IRID } from '$lib/client/firestore';

export const load: LayoutLoad = async ({ params }) => {
	return {
		irid: params.irid as IRID
	} as const
};

export const prerender = false
