import type { Options } from "nodemailer/lib/mailer";
import { getToken } from "./auth";

/**
 * Pošle email a pokud tam je html, převede to na text
 */

export const sendEmail = async (message: Options) => {
	const { htmlToText } = await import('html-to-text');
	const isString = (await import('lodash.isstring')).default;

	if (isString(message.html)) {
		message.text = message.text ?? htmlToText(message.html);
	}

	const token = await getToken();

	return await fetch(`/api/sendEmail?token=${token}`, {
		method: 'POST',
		body: JSON.stringify({ message }),
		headers: {
			'content-type': 'application/json'
		}
	});
};

export const sender = '"Regulus Evidence IR" aplikace.regulus@centrum.cz';

