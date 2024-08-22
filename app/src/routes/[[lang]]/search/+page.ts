import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { checkAuth } from '$lib/client/auth';
import { languageCodes } from "$lib/languages";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => [
	...languageCodes.map((code) => ({ lang: code })),
	{ lang: '' }
];

export const load: PageLoad = async () => {
	if (!(await checkAuth()) && browser) return error(404, "Not Found")
};