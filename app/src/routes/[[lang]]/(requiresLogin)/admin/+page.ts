import type { PageLoad } from './$types';
import { checkAdmin, checkAuth } from '$lib/client/auth';
import { languageCodes } from "$lib/languages";
import type { EntryGenerator } from "./$types";
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';

export const entries: EntryGenerator = () => [
	...languageCodes.map((code) => ({ lang: code })),
	{ lang: '' }
];

export const load: PageLoad = async () => {
    if ((!await checkAuth() || !await checkAdmin()) && browser) error(401)
}