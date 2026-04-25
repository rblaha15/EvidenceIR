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
import { checkRegulusOrAdmin, getCurrentUser } from '$lib/client/auth';
import type { ExistingIR, ExistingNSP, IR, SignatureState } from '$lib/data';
import type { DocumentDefinition } from '$lib/features/signing/domain/sms';
import { waitUntil } from '$lib/helpers/stores';
import { getDataAsStore } from '$lib/helpers/getData';
import { derived, type Readable } from 'svelte/store';

export const loadSigning = async (
    pdfName: PdfToSign,
    url: URL,
) => {
    if (!(pdfName in pdfInfo)) error(404);

    const user = await getCurrentUser();
    if (!user) error(401);

    if (!pdfToSign.includes(pdfName)) error(400, { message: 'This document may not be signed' });

    const parameterName = pdfName in pdfWithDefiningParameter
        ? pdfWithDefiningParameter[pdfName as PdfWithDefiningParameter] : undefined;

    const parameter = parameterName
        ? url.searchParams.get(parameterName)?.toNumber() : undefined;

    if (parameterName && !parameter) error(400, { message: `Parameter ${parameterName} not provided!` });

    const pdf = pdfInfo[pdfName] as PdfArgs<Pdf>;

    if (pdf.requiredRegulus && !await checkRegulusOrAdmin()) error(403);

    const id = extractIDs(url);
    const stores = getDataAsStore(id);

    await waitUntil(stores.ir, p => p != 'loading');
    await waitUntil(stores.sps, p => p != 'loading');

    const data = {
        sp: derived(stores.sps, (sps, set: (value: ExistingNSP | undefined) => void) => {
            if (sps != 'loading') set(!sps.length || sps[0].deleted ? undefined : sps[0]);
        }),
        ir: derived(stores.ir, (ir, set: (value: ExistingIR | undefined) => void) => {
            if (ir != 'loading') set(!ir || ir.deleted ? undefined : ir);
        }),
    };

    let settings: Readable<SignatureState | undefined>;
    if (pdf.type == 'IR') {
        if (!id.irid) error(400, { message: 'irid must be provided to access this document!' });

        settings = derived(data.ir, $ir => parameter
            ? $ir?.signatures?.[pdfName as PdfWithDefiningParameter]?.[parameter]
            : $ir?.signatures?.[pdfName as Exclude<PdfToSign<'IR'>, PdfWithDefiningParameter>]);
    } else {
        if (!id.spids || id.spids.length != 1) error(400, { message: 'spids must be provided to access this document!' });

        settings = derived(data.sp, $sp =>
            $sp?.signatures?.[pdfName as PdfToSign<'SP'>]);
    }

    const def: DocumentDefinition = {
        pdf: pdfName, parameter, id: id.irid ?? id.spids[0]!,
    };

    return { def, ...data, ...id, args: pdf, settings };
};

export type LoadData = Awaited<ReturnType<typeof loadSigning>>;

export const addCzechCountryCode = (phone: string) =>
    phone.startsWith('+') ? phone : `+420 ${phone}`;