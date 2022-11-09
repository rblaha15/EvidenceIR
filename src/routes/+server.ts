import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from "nodemailer";

export const prerender = false;
export const ssr = false;

let transporter = nodemailer.createTransport({
    host: "smtp.centrum.cz",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: "aplikace.regulus@centrum.cz",
        pass: "1sulugeRecakilpA",
    },
});

export const POST: RequestHandler = async ({ request }) => {
    const { message } = await request.json();

    //console.log();
    //console.log(Email);,
    //Email.send({
    //    Host: "smtp.google.com",
    //    Port: 465,
    //    Username: "aplikace.regulus@gmail.com",
    //    Password: "sulugeRecakilpA",
    //    To: "blahova@regulus.cz",
    //    From: "aplikace.regulus@gmail.com",
    //    Subject: "Novej pokus",
    //    Body: napis,
    //}).then((message: any) => alert(message));

    //console.log(message)
    transporter.sendMail(message, (err: any, info: any) => {
        //console.log(err)
        //console.log(info)
    })

    return new Response()
}