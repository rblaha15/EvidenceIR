import { generatePdf } from '$lib/server/pdf';
import { pdfData } from "$lib/client/pdf";
import { type Pdf } from "$lib/client/pdf";
import { checkToken } from '$lib/server/auth';
// import type { RequestHandler } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import type { LanguageCode } from '$lib/languages';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
    const pdfname = params.pdfname as Pdf
    const t = url.searchParams.get("token")

    const token = await checkToken(t)
    if (!token) error(401, "Unauthorized")

    return generatePdf(params.lang as LanguageCode, params.ir as string, fetch, pdfData[pdfname])
}