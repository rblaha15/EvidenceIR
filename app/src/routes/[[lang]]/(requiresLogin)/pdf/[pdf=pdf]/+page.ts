import { browser } from '$app/environment';
import { getIsLoggedIn, getIsRegulusOrAdmin } from '$lib/client/auth';
import type { IR, NSP } from '$lib/data';
import {
    getDefiningParameter,
    getSignatureDef,
    getSignatureState,
    getSigningInfo
} from '$lib/features/signing/domain/data';
import { getData } from '$lib/helpers/getData';
import { extractIDs, langAndPdfEntryGenerator } from '$lib/helpers/paths';
import { isLanguageCode } from '$lib/languages';
import {
    type Pdf,
    type PdfArgs,
    pdfInfo,
    type PdfParameters,
    type PdfWithDefiningParameter,
    pdfWithDefiningParameter,
} from '$lib/pdf/pdf';
import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

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
        signatureDef: null,
        allowSigning: false,
    };

    if (!await getIsLoggedIn()) error(401);

    const pdf = pdfInfo[pdfName] as PdfArgs<Pdf>;

    if (pdf.requiredRegulus && !await getIsRegulusOrAdmin())
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

    const signatureDef = getSignatureDef(pdfName, id, parameter);
    const { allowSigning } = getSigningInfo(signatureDef, data.ir, data.nsps[0]);

    return { ...d, ...id, args: pdf, fileLang: language, signatureState, signatureDef, allowSigning };
};

export const prerender = false;