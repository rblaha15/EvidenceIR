import type { Options } from "nodemailer/lib/mailer";
import { getToken } from "./auth";
import { htmlToText } from "html-to-text";
import isString from "lodash.isstring";

export type EmailOptions = Options & {
	pdf?: {
		link: string;
		title: string;
	};
}

/**
 * Pošle email a pokud tam je html, převede to na text
 */
export const sendEmail = async (message: EmailOptions) => {

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

export const SENDER = {
	name: 'Regulus SEIR',
	address: 'aplikace.regulus@gmail.com',
};

