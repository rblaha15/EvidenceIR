import type { Options } from "nodemailer/lib/mailer";
import { getToken } from "./auth";
import { htmlToText } from "html-to-text";
import { isString } from "lodash-es";

/**
 * Pošle email a pokud tam je html, převede to na text
 */

export const sendEmail = async (message: Options) => {

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

export const SENDER = '"Regulus Evidence IR" aplikace.regulus@centrum.cz';

