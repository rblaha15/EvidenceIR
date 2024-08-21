import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { EMAIL_USERNAME, EMAIL_PASSWORD } from "$env/static/private"
import { checkToken } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

const transporter = nodemailer.createTransport({
	host: 'smtp.centrum.cz',
	port: 465,
	secure: true,
	auth: {
		user: EMAIL_USERNAME,
		pass: EMAIL_PASSWORD
	}
});

export const POST: RequestHandler = async ({ url, request }) => {
	const token = url.searchParams.get("token")

	if (!await checkToken(token)) error(401, "Unauthorized")

	const { message } = await request.json()

	const { response } = await transporter.sendMail(message);

	return new Response(null, {
		status: Number(response.slice(0, 3))
	});
};