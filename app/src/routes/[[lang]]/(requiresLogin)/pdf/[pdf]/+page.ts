import { browser } from '$app/environment';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import { extractIDs, getData, langAndPdfEntryGenerator } from '../../../helpers';
import type { EntryGenerator, PageLoad } from './$types';
import { setTitle } from '$lib/helpers/globals';
import { type Pdf, type PdfArgs, pdfInfo, type PdfParameters } from '$lib/client/pdf';
import { generatePdfUrl } from '$lib/client/pdfGeneration';
import { isLanguageCode } from '$lib/languages';

export const entries: EntryGenerator = langAndPdfEntryGenerator;

export const load: PageLoad = async ({ parent, params, url }) => {
    const pdfName = params.pdf as Pdf;
    if (!(pdfName in pdfInfo)) return error(404);

    if (!browser) return { url: '', fileName: '', irid: '', spid: '', title: '' };

    if (!await checkAuth()) error(401);

    const pdf = pdfInfo[pdfName] as PdfArgs<Pdf>;

    if (pdf.requiredRegulus && !await checkRegulusOrAdmin())
        return error(401);

    const id = extractIDs(url);
    if (pdf.type == 'IR' && !id.irid)
        return error(400, { message: 'irid must be provided to access this document!' });
    if (pdf.type == 'SP' && !id.spid)
        return error(400, { message: 'spid must be provided to access this document!' });

    const data = await getData(id);

    if (pdf.type == 'IR' && !data.ir || pdf.type == 'SP' && !data.sp)
        return error(500, { message: 'Data not loaded' });

    const parameters = [...url.searchParams.entries()].toRecord().mapValues((_, v) => Number(v));

    const lang = url.searchParams.get('lang')
    const langProvided = isLanguageCode(lang);

    const language = langProvided && pdf.supportedLanguages.includes(lang)
        ? lang
        : pdf.supportedLanguages[0];

    const d = await generatePdfUrl({
        args: pdf,
        lang: language,
        data: pdf.type == 'IR' ? data.ir! : data.sp!,
        ...(parameters as unknown as PdfParameters<Pdf>)
    });

    const pageData = await parent();
    const t = pageData.translations;

    setTitle(t.pdf.previewFile, true);

    return { ...d, ...id, title: t.get(pdf.title) };
};

export const prerender = true;