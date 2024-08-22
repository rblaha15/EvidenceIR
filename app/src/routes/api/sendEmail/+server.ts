import type { RequestHandler } from './$types';
import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ url, request }) => {
	const token = url.searchParams.get("token")

	if (!await checkToken(token)) error(401, "Unauthorized")

	const { message } = await request.json()

	const { response } = await sendEmail(message);

	return new Response(null, {
		status: Number(response.slice(0, 3))
	});
};