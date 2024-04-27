import type { HttpError } from '@sveltejs/kit';

export const sender = '"Regulus Evidence IR" aplikace.regulus@centrum.cz';

/**
 * Pošle email a pokud tam je html, převede to na text
 */
export const poslatEmail = async (message: import('nodemailer/lib/mailer').Options) => {
	const { htmlToText } = await import('html-to-text');
	const isString = (await import('lodash.isstring')).default;

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

export const nazevFirmy = async (ico: string) => {

	let response
	try {
		response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
			method: 'GET'
		});
	} catch {
		return undefined
	}
	if (!response.ok) return undefined

	const json = await response.json();
	return json.obchodniJmeno as string
};