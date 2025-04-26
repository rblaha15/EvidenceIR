import type { LayoutLoad } from './$types';
import type { IRID, SPID } from '$lib/client/firestore';

export const load: LayoutLoad = async ({ params }) => {
	return {
		irid_spid: params.irid as IRID | SPID
	} as const
};

export const prerender = false
