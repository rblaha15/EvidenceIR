import checkResult from '$lib/server/pdf/checkResult';
import { checkToken } from '$lib/server/auth';
// import type { RequestHandler } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import type { LanguageCode } from '$lib/languages';
import warranty from '$lib/server/pdf/warranty';
import rroute from '$lib/server/pdf/rroute';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
    const pdfname = params.pdfname
    const t = url.searchParams.get("token")

    const token = await checkToken(t)
    if (!token) error(401, "Unauthorized")

    if (pdfname == "checkResult") return checkResult({ ir: params.ir, lang: params.lang as LanguageCode, fetch })
    if (pdfname == "warranty") return warranty({ ir: params.ir, lang: params.lang as LanguageCode, fetch })
    if (pdfname == "rroute") return rroute({ ir: params.ir, lang: params.lang as LanguageCode, fetch })

    return error(400);
}