import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	console.log(params);
	return {
		uid: params.uid,
	};
};

export const prerender = false;