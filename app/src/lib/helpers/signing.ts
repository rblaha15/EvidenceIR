import { type Pdf, type PdfDefiningParameter, type PdfToSign, type PdfWithDefiningParameter } from '$lib/pdf/pdf';
import type { IR, NSP, SignatureState } from '$lib/data';

export const getDefiningParameter = (parameterName: 'pump' | 'id' | undefined, url: URL) =>
    parameterName ? url.searchParams.get(parameterName)?.let(p =>
        isNaN(Number(p)) ? p : Number(p),
    ) as PdfDefiningParameter : undefined;

export const getSignatureState = (
    data: IR | NSP | null,
    name: Pdf,
    parameter?: PdfDefiningParameter,
) => {
    const signatures = data?.signatures;
    if (!signatures) return undefined;
    if (parameter) {
        const s2 = signatures as Record<PdfWithDefiningParameter, Record<string | number, SignatureState>>;
        return s2[name as PdfWithDefiningParameter]?.[parameter] as SignatureState | undefined;
    } else {
        const s2 = signatures as Record<PdfToSign, SignatureState>;
        return s2[name as PdfToSign] as SignatureState | undefined;
    }
};