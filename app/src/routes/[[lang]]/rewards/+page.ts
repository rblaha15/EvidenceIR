import type { EntryGenerator, PageLoad } from './$types';
import { browser } from '$app/environment';
import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
import { langEntryGenerator } from '$lib/helpers/paths';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;

export const load: PageLoad = async ({ parent, fetch }) => {
    if (!browser) return { url: '', fileName: '' };

    return await generatePdfUrl({
        lang: 'cs',
        data: {},
        fetch,
        link: 'RBP',
    });
};