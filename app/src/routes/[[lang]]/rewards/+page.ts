import { localeDefaultLanguageCode } from '$lib/helpers/globals';
import type { EntryGenerator, PageLoad } from './$types';
import { browser } from '$app/environment';
import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
import { langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
    if (!browser) return { url: '', fileName: '' };

    return await generatePdfUrl({
        lang: localeDefaultLanguageCode,
        data: {},
        fetch,
        link: 'RBP',
    });
};