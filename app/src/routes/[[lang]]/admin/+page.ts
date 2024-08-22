import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { checkAdmin, checkAuth } from '$lib/client/auth';
import { languageCodes } from "$lib/languages";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => [
	...languageCodes.map((code) => ({ lang: code })),
	{ lang: '' }
];

export const load: PageLoad = async ({ params, url }) => {
	if (!(await checkAuth()) && browser) return redirect(302, "/" + params.lang + "/login?redirect=/" + url.pathname.slice(params.lang!.length + 1) + url.search)
	if (!(await checkAdmin()) && browser) return error(401, "Unauthorized")
};