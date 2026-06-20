import { getIsLoggedIn, getIsRegulusOrAdmin } from '$lib/client/auth';
import { extractIDs } from '$lib/helpers/paths';
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
import type { ExistingIR, ExistingNSP, SignatureState } from '$lib/data';
import type { DocumentDefinition } from '$lib/features/signing/domain/sms';
import { waitUntil } from '$lib/helpers/stores';
import { getDataAsStore } from '$lib/helpers/getData';
import { derived, type Readable } from 'svelte/store';
import { getDefiningParameter, getSignatureState } from '$lib/helpers/signing';

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

    let settings: Readable<SignatureState | undefined>;
    if (pdf.type == 'IR') {
        if (!id.irid) error(400, { message: 'irid must be provided to access this document!' });

        settings = derived(data.ir, $ir =>
            getSignatureState($ir, pdfName, parameter));
    } else {
        if (!id.nspids || id.nspids.length != 1) error(400, { message: 'spids must be provided to access this document!' });

        settings = derived(data.nsp, $nsp =>
            getSignatureState($nsp, pdfName, parameter));
    }

    const def: DocumentDefinition = {
        pdf: pdfName, parameter, id: id.irid ?? id.nspids[0]!,
    };

    return { def, ...data, ...id, args: pdf, settings };
};

export type LoadData = Awaited<ReturnType<typeof loadSigning>>;

export const addCzechCountryCode = (phone: string) =>
    phone.startsWith('+') ? phone : `+420 ${phone}`;