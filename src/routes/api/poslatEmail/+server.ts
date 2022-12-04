import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
	host: 'smtp.centrum.cz',
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD
	}
});

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();

	console.log(message);

	const { response } = await transporter.sendMail(message);

	console.log(response);

	return new Response(null, {
		status: Number(response.slice(0, 3))
	});
};
