import { error } from '@sveltejs/kit';
import type { PageLoad, EntryGenerator } from './$types';
import { checkRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';
import { languageCodes } from '$lib/languages';

export const entries: EntryGenerator = () => [
    ...languageCodes.map((code) => ({ lang: code })),
    { lang: '' }
];

export const load: PageLoad = async () => {
    if (!await checkRegulusOrAdmin() && browser)
        return error(401);
}