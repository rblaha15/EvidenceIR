import { browser } from '$app/environment';
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import {
    type Pdf,
    type PdfArgs,
    pdfInfo,
    type PdfParameters,
    type PdfToSign,
    pdfToSign,
    type PdfWithDefiningParameter,
    pdfWithDefiningParameter,
} from '$lib/pdf/pdf';
import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
import { isLanguageCode } from '$lib/languages';
import type { IR, NSP } from '$lib/data';
import { extractIDs, langAndPdfEntryGenerator } from '$lib/helpers/paths';
import { getData } from '$lib/helpers/getData';
import { getDefiningParameter, getSignatureState } from '$lib/helpers/signing';
import type { SPID } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';

export const entries: EntryGenerator = langAndPdfEntryGenerator;

export const load: PageLoad = async ({ params, url, fetch }) => {
    const pdfName = params.pdf as Pdf;
    if (!(pdfName in pdfInfo)) error(404);

    if (!browser) return {
        url: '',
        fileName: '',
        irid: '',
        nspids: [],
        fileLang: '',
        args: null,
        objectUrl: '',
        signatureState: undefined,
        signatureKey: '',
        allowSigning: false,
    };

    if (!await checkAuth()) error(401);

    const pdf = pdfInfo[pdfName] as PdfArgs<Pdf>;

    if (pdf.requiredRegulus && !await checkRegulusOrAdmin())
        error(401);

    const id = extractIDs(url);
    if (pdf.type == 'IR' && !id.irid)
        error(400, { message: 'irid must be provided to access this document!' });
    if (pdf.type == 'NSP' && !id.nspids)
        error(400, { message: 'nspids must be provided to access this document!' });

    const data = await getData(id);

    if (pdf.type == 'IR' && (!data.ir || data.ir.deleted) || pdf.type == 'NSP' && (data.nsps.length != 1 || data.nsps[0].deleted))
        error(500, { message: 'Data not loaded' });

    const parameters = [...url.searchParams.entries()].toRecord().mapValues((_, v) => isNaN(Number(v)) ? v : Number(v));

    const lang = url.searchParams.get('lang');
    const langProvided = isLanguageCode(lang);

    const language = langProvided && pdf.supportedLanguages.includes(lang)
        ? lang
        : pdf.supportedLanguages[0];

    const d = await generatePdfUrl({
        ...(parameters as unknown as PdfParameters<Pdf>),
        lang: language,
        data: pdf.type == 'IR' ? data.ir! as IR : data.nsps[0]! as NSP,
        fetch,
        link: pdfName,
    });

    const parameterName = pdfName in pdfWithDefiningParameter
        ? pdfWithDefiningParameter[pdfName as PdfWithDefiningParameter] : undefined;

    const parameter = getDefiningParameter(parameterName, url);

    const signatureState = getSignatureState(
        pdf.type == 'IR' ? data.ir : data.nsps[0], pdfName, parameter,
    );

    const signatureKey = parameter ? `${pdfName}-${parameter}` : pdfName;

    const allowSigning = pdfName != 'NSP' && pdfName != 'SP' ? pdfToSign.includes(pdfName as PdfToSign)
        : pdfName == 'SP' ? (data.ir!.SPs[parameter as SPID] as Raw<FormSP>).fakturace.komu.chosen == 'investor'
            : pdfName == 'NSP' ? data.nsps[0].NSP.fakturace.komu.chosen == 'investor'
                : false;

    return { ...d, ...id, args: pdf, fileLang: language, signatureState, signatureKey, allowSigning };
};

export const prerender = true;