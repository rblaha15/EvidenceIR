export const sender = '"Regulus Evidence IR" aplikace.regulus@centrum.cz';

import { htmlToText } from 'html-to-text';
import isString from 'lodash.isstring';
import type Mail from 'nodemailer/lib/mailer';

/**
 * Pošle email a pokud tam je html, převede to na text
 */
export const poslatEmail = async (message: Mail.Options) => {
	if (isString(message.html)) {
		message.text = message.text ?? htmlToText(message.html);
	}
	return await fetch(`/api/poslatEmail`, {
		method: 'POST',
		body: JSON.stringify({ message }),
		headers: {
			'content-type': 'application/json'
		}
	});
};
