import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
    host: "smtp.centrum.cz",
    port: 465,
    secure: true,
    auth: {
        user: "aplikace.regulus@centrum.cz",
        pass: "1sulugeRecakilpA",
    },
});

export const POST: RequestHandler = async ({ request }) => {
    const { message } = await request.json();

    const { response } = await transporter.sendMail(message)

    return new Response(null, {
        status: Number(response.slice(0, 3))
    })
}