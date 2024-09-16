import type { LanguageCode } from "$lib/languages";
import type { TranslationReference, Translations } from "$lib/translations";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import type { SaveOptions } from "pdf-lib";
import check from '$lib/client/pdf/check';
import warranty from '$lib/client/pdf/warranty';
import rroute from '$lib/client/pdf/rroute';
import guide from '$lib/client/pdf/guide';
import commissionProtocol from '$lib/client/pdf/commissionProtocol';
import { type IR } from "$lib/client/firestore";

export type Pdf = 'check' | 'warranty' | 'rroute' | 'guide' | 'commissionProtocol';export type PdfData = {
    [P in Pdf]: PdfArgs;
};
export const pdfData: PdfData = {
    check,
    warranty,
    rroute,
    guide,
    commissionProtocol,
};
export type PdfArgs = {
    formName: string;
    supportedLanguages: LanguageCode[];
    title: TranslationReference;
    fileName: TranslationReference;
    getFormData: (data: IR, t: Translations) => Promise<{
        [fieldName: string]: string | null;
    }>;
    saveOptions?: SaveOptions;
};

