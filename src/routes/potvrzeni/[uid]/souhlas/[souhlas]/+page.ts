import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	console.log(params);
	return {
		uid: params.uid,
		souhlas: params.souhlas === 'ano' ? true : params.souhlas === 'ne' ? true : undefined
	};
};

export const prerender = false;
