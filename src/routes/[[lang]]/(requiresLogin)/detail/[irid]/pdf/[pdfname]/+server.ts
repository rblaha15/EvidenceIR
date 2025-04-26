import { generatePdf, getPdfData } from '$lib/server/pdf';
import { pdfInfo, toPdfTypeName } from '$lib/client/pdf';
import { type Pdf } from "$lib/client/pdf";
import { checkToken } from '$lib/server/auth';
import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { LanguageCode } from '$lib/languages';
import { checkAdmin, checkRegulusOrAdmin } from '$lib/server/auth';
import type { IRID, SPID } from '$lib/client/firestore';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
    const pdfName = params.pdfname as Pdf
    const t = url.searchParams.get("token")

    const token = await checkToken(t)
    if (!token)  {
        url.search = ""
        url.pathname = url.pathname.split("/pdf")[0]
        return redirect(303, url)
    }
    const pdfTypeName = toPdfTypeName(pdfName);

    if (!pdfInfo.keys().includes(pdfTypeName)) return error(404)

    const pdfArgs = pdfInfo[pdfTypeName];
    const getData = getPdfData(pdfName);

    if (pdfArgs.requiredAdmin && !checkAdmin(token!) || pdfArgs.requiredRegulus && !checkRegulusOrAdmin(token!))
        return error(401);

    return generatePdf(params.lang as LanguageCode, params.irid as IRID | SPID, fetch, pdfArgs, getData)
}