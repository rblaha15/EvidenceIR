import { getIsLoggedIn, getIsRegulusOrAdmin } from '$lib/client/auth';
import type { ExistingIR, ExistingNSP } from '$lib/data';
import { getDefiningParameter, getSignatureDef, getSignatureState } from '$lib/features/signing/domain/data';
import { getDataAsStore } from '$lib/helpers/getData';
import { extractIDs } from '$lib/helpers/paths';
import { waitUntil } from '$lib/helpers/stores';
import {
    type Pdf,
    type PdfArgs,
    pdfInfo,
    type PdfToSign,
    pdfToSign,
    type PdfWithDefiningParameter,
    pdfWithDefiningParameter,
} from '$lib/pdf/pdf';
import { error } from '@sveltejs/kit';
import { derived } from 'svelte/store';

export const loadSigning = async (
    pdfName: PdfToSign,
    url: URL,
) => {
    if (!(pdfName in pdfInfo)) error(404);

    if (!await getIsLoggedIn()) error(401);

    if (!pdfToSign.includes(pdfName)) error(400, { message: 'This document may not be signed' });

    const parameterName = pdfName in pdfWithDefiningParameter
        ? pdfWithDefiningParameter[pdfName as PdfWithDefiningParameter] : undefined;

    const parameter = getDefiningParameter(parameterName, url);

    if (parameterName && !parameter) error(400, { message: `Parameter ${parameterName} not provided!` });

    const pdf = pdfInfo[pdfName] as PdfArgs<Pdf>;

    if (pdf.requiredRegulus && !await getIsRegulusOrAdmin()) error(403);

    const id = extractIDs(url);
    const stores = getDataAsStore(id);

    await waitUntil(stores.ir, p => p != 'loading');
    await waitUntil(stores.nsps, p => p != 'loading');

    const data = {
        nsp: derived(stores.nsps, (sps, set: (value: ExistingNSP | null) => void) => {
            if (sps != 'loading') set(!sps.length || sps[0].deleted ? null : sps[0]);
        }),
        ir: derived(stores.ir, (ir, set: (value: ExistingIR | null) => void) => {
            if (ir != 'loading') set(!ir || ir.deleted ? null : ir);
        }),
    };

    if (pdf.type == 'IR' && !id.irid)
        error(400, { message: 'irid must be provided to access this document!' });
    else if (pdf.type == 'NSP' && (!id.nspids || id.nspids.length != 1))
        error(400, { message: 'spids must be provided to access this document!' });

    const settings = derived(
        pdf.type == 'IR' ? data.ir : data.nsp,
        $data => getSignatureState($data, pdfName, parameter),
    );

    const def = getSignatureDef(pdfName, id, parameter);

    return { def, ...data, ...id, settings };
};

export type LoadData = Awaited<ReturnType<typeof loadSigning>>;