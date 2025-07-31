import type { LanguageCode } from '$lib/languages';
import { p, type TranslationReference, type Translations } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';
import type { IR } from '$lib/client/data';
import type { PdfGenerationData } from '$lib/client/pdfGeneration';
import RK from '$lib/client/pdf/pdfRK';
import NN from '$lib/client/pdf/pdfNN';
import ZL from '$lib/client/pdf/pdfZL';
import RR from '$lib/client/pdf/pdfRR';
import UPT from '$lib/client/pdf/pdfUPT';
import UPS from '$lib/client/pdf/pdfUPS';
import SP, { pdfCP as CP, pdfNSP as NSP, pdfPS as PS } from '$lib/client/pdf/pdfSP';
import UPF from '$lib/client/pdf/pdfUPF';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { TC } from '$lib/forms/IN/defaultIN';
import type { IRID, SPID } from '$lib/helpers/ir';

type AllPdf = {
    [P in 'RK' | 'ZL' | 'RR' | 'NN' | 'UPT' | 'UPS' | 'SP' | 'UPF']: 'IR'
} & {
    [P in 'NSP' | 'CP' | 'PS']: 'SP'
}

export const pdfInfo: PdfInfo = {
    RK: {
        type: 'IR',
        pdfName: 'RK',
        supportedLanguages: ['cs'],
        title: `yearlyCheckTitle`,
        getPdfData: RK,
    },
    ZL: {
        type: 'IR',
        pdfName: 'ZL',
        supportedLanguages: ['cs', 'de'],
        title: `hpWarranty`,
        getPdfData: ZL,
    },
    RR: {
        type: 'IR',
        pdfName: 'RR',
        supportedLanguages: ['cs', 'de'],
        title: `regulusRouteTitle`,
        getPdfData: RR,
    },
    NN: {
        type: 'IR',
        pdfName: 'NN',
        supportedLanguages: ['cs'],
        title: p(`Návod na přístup do regulátoru IR`),
        getPdfData: NN,
    },
    UPT: {
        type: 'IR',
        pdfName: 'UPT',
        supportedLanguages: ['cs', 'de'],
        title: p(`Protokol o uvedení tepelného čerpadla do trvalého provozu`),
        getPdfData: UPT,
    },
    UPS: {
        type: 'IR',
        pdfName: 'UPS',
        supportedLanguages: ['cs'],
        title: p(`Protokol o uvedení solárního systému do trvalého provozu`),
        getPdfData: UPS,
    },
    SP: {
        type: 'IR',
        pdfName: 'SP',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        getPdfData: SP,
        requiredRegulus: true,
    },
    NSP: {
        type: 'SP',
        pdfName: 'SP',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        requiredRegulus: true,
        getPdfData: NSP,
    },
    CP: {
        type: 'SP',
        pdfName: 'CP',
        supportedLanguages: ['cs'],
        title: '',
        getPdfData: CP,
    },
    PS: {
        type: 'SP',
        pdfName: 'PS',
        supportedLanguages: ['cs'],
        title: '',
        getPdfData: PS,
    },
    UPF: {
        type: 'IR',
        pdfName: 'UPF',
        supportedLanguages: ['cs'],
        title: p(`Protokol o uvedení fotovoltaického systému do trvalého provozu`),
        getPdfData: UPF,
    },
};

type PdfInfo = {
    [P in Pdf]: PdfArgs<P>
};

export type Pdf<T extends 'IR' | 'SP' = 'IR' | 'SP'> = {
    [P in keyof AllPdf]: AllPdf[P] extends T ? P : never
}[keyof AllPdf];

type TypeOfPdf<P extends Pdf> = AllPdf[P];
export type DataOfPdf<P extends Pdf> = { IR: IR, SP: Raw<FormNSP> }[TypeOfPdf<P>];
export type PdfID<P extends Pdf> = { IR: { irid: IRID; spid?: undefined }, SP: { spid: SPID; irid?: undefined } }[TypeOfPdf<P>];

export type OpenPdfOptions<P extends Pdf> = {
    link: P,
    lang?: LanguageCode,
} & PdfID<P> & PdfParameters<P>;

export type GeneratePdfOptions<P extends Pdf> = {
    args: PdfArgs<P>,
    lang: LanguageCode,
    data: DataOfPdf<P>,
} & PdfParameters<P>;

export type GetPdfData<P extends Pdf> = (o: {
    data: DataOfPdf<P>,
    t: Translations,
    addDoc: <P extends Pdf>(o: GeneratePdfOptions<P>) => Promise<void>,
    lang: LanguageCode,
} & PdfParameters<P>) => Promise<PdfGenerationData>

export type PdfArgs<P extends Pdf> = {
    type: TypeOfPdf<P>;
    pdfName: string;
    supportedLanguages: LanguageCode[];
    title: TranslationReference;
    saveOptions?: SaveOptions;
    requiredAdmin?: boolean;
    requiredRegulus?: boolean;
    getPdfData?: GetPdfData<P>;
};

type PdfParams = {
    RK: {
        pump: TC,
    },
    ZL: {
        pump: TC,
    },
    SP: {
        index: number,
    },
};
export type PdfParameters<P extends Pdf> = P extends keyof PdfParams ? PdfParams[P] : {};