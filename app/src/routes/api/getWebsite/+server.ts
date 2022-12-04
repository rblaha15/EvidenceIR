import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { url } = await request.json();

	console.log(url);

	const response = await fetch(url, {
		method: 'GET'
	});

	console.log(response);

	return response;
};
