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
