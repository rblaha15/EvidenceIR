import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  host: "smtp.centrum.cz",
  port: 465,
  secure: true,
  auth: {
    user: "aplikace.regulus@centrum.cz",
    pass: "1sulugeRecakilpA"
  }
});
const POST = async ({ request }) => {
  const { message } = await request.json();
  transporter.sendMail(message, (err, info) => {
  });
  return new Response();
};

export { POST };
//# sourceMappingURL=_server.ts-4e968410.js.map
