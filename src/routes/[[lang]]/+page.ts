import { browser } from "$app/environment";
import { checkAuth } from "$lib/client/auth";
import { languageCodes } from "$lib/languages";
import { redirect } from "@sveltejs/kit";
import type { EntryGenerator, PageLoad } from "./$types";

export const entries: EntryGenerator = () => [
    ...languageCodes.map((code) => ({ lang: code })),
    { lang: '' }
];

export const load: PageLoad = async ({ params, url }) => {
	if (!(await checkAuth()) && browser) return redirect(302, "/" + params.lang + "/login?redirect=/" + url.pathname.slice(params.lang!.length + 1) + url.search)
};