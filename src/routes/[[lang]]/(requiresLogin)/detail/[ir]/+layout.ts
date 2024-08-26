import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	return {
		ir: params.ir
	}
};

export const prerender = false
