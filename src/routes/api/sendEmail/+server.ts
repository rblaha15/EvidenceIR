import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: 'smtp.centrum.cz',
	port: 465,
	secure: true,
	auth: {
		user: 'aplikace.regulus@centrum.cz',
		pass: '1sulugeRecakilpA'
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
