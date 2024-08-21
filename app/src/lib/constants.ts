import { derived, get, writable, type Writable } from 'svelte/store';
import { page } from '$app/stores';
import { getToken } from '$lib/client/auth';

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

	const token = await getToken()

	return await fetch(`/api/poslatEmail?token=${token}`, {
		method: 'POST',
		body: JSON.stringify({ message }),
		headers: {
			'content-type': 'application/json'
		}
	});
};

const node_fetch = fetch

export const nazevFirmy = async (ico: string, fetch: typeof node_fetch = node_fetch) => {

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

export const nazevAdresaFirmy = async (ico: string, fetch: typeof node_fetch = node_fetch) => {

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
	return json as { obchodniJmeno: string, sidlo: { textovaAdresa: string } }
};

export const relUrl = derived(page, (page) => (url: string) => "/" + page.params.lang + url)

export function storable<T>(data: T | undefined, name: string): Writable<T> {
	const store = writable(data);
	const isBrowser = () => typeof window !== 'undefined';

	const address = `storable-${name}`

	if (isBrowser() && localStorage[address])
		store.set(JSON.parse(localStorage[address]));

	return {
		subscribe: store.subscribe,
		set: value => {
			if (isBrowser()) localStorage[address] = JSON.stringify(value);
			store.set(value);
		},
		update: (updater) => {
			const updated = updater(get(store));

			if (isBrowser()) localStorage[address] = JSON.stringify(updated);
			store.set(updated);
		}
	};
}