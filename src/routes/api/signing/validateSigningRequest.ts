import { error } from '@sveltejs/kit';
import { type DocumentDefinition } from '$lib/features/signing/domain/sms';
import { pdfInfo, pdfToSign, pdfWithDefiningParameter } from '$lib/pdf/pdf';
import { checkRegulusOrAdmin } from '$lib/server/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const validateRequest = async (
    def: DocumentDefinition,
    user: DecodedIdToken,
) => {
    if (!(def.pdf in pdfInfo)) error(404);

    if (!pdfToSign.includes(def.pdf)) error(400);

    if (def.pdf in pdfWithDefiningParameter && !def.parameter) error(400);

    const pdf = pdfInfo[def.pdf];

    if (pdf.requiredRegulus && !await checkRegulusOrAdmin(user)) error(403);

    return pdf;
};