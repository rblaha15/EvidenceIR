import { browser } from '$app/environment';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import { extractIDs, getData, langAndPdfEntryGenerator } from '../../../helpers';
import type { EntryGenerator, PageLoad } from './$types';
import { setTitle } from '$lib/helpers/globals';
import { type Pdf, type PdfArgs, pdfInfo, type PdfParameters } from '$lib/pdf/pdf';
import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
import { isLanguageCode } from '$lib/languages';

export const entries: EntryGenerator = langAndPdfEntryGenerator;

export const load: PageLoad = async ({ parent, params, url, fetch }) => {
    const pdfName = params.pdf as Pdf;
    if (!(pdfName in pdfInfo)) return error(404);

    if (!browser) return { url: '', fileName: '', irid: '', spid: '', fileLang: '', args: null };

    if (!await checkAuth()) error(401);

    const pdf = pdfInfo[pdfName] as PdfArgs<Pdf>;

    if (pdf.requiredRegulus && !await checkRegulusOrAdmin())
        return error(401);

    const id = extractIDs(url);
    if (pdf.type == 'IR' && !id.irid)
        return error(400, { message: 'irid must be provided to access this document!' });
    if (pdf.type == 'SP' && !id.spids)
        return error(400, { message: 'spid must be provided to access this document!' });

    const data = await getData(id);

    if (pdf.type == 'IR' && !data.ir || pdf.type == 'SP' && data.sps.length != 1)
        return error(500, { message: 'Data not loaded' });

    const parameters = [...url.searchParams.entries()].toRecord().mapValues((_, v) => Number(v));

    const lang = url.searchParams.get('lang')
    const langProvided = isLanguageCode(lang);

    const language = langProvided && pdf.supportedLanguages.includes(lang)
        ? lang
        : pdf.supportedLanguages[0];

    const d = await generatePdfUrl({
        ...(parameters as unknown as PdfParameters<Pdf>),
        args: pdf,
        lang: language,
        data: pdf.type == 'IR' ? data.ir! : data.sps[0]!,
    });

    const pageData = await parent();
    const t = pageData.translations;

    setTitle(t.pdf.previewFile, true);

    return { ...d, ...id, args: pdf, fileLang: language };
};

export const prerender = true;