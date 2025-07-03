import type { LanguageCode } from '$lib/languages';
import { p, type TranslationReference, type Translations } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';
import type { IR } from '$lib/client/data';
import type { PdfGenerationData } from '$lib/client/pdfGeneration';
import RK from '$lib/client/pdf/RK';
import NN from '$lib/client/pdf/NN';
import ZL from '$lib/client/pdf/ZL';
import RR from '$lib/client/pdf/RR';
import UPT from '$lib/client/pdf/UPT';
import UPS from '$lib/client/pdf/UPS';
import SP, { CP, NSP } from '$lib/client/pdf/SP';
import type { Raw } from '$lib/forms/Form';
import type { DataSP2 } from '$lib/forms/SP2';

type AllPdf = {
    [P in 'RK' | 'ZL' | 'RR' | 'NN' | 'UPT' | 'UPS' | 'SP']: 'IR'
} & {
    [P in 'NSP' | 'CP']: 'SP'
}

export const pdfInfo: PdfInfo = {
    RK: {
        type: 'IR',
        formName: 'RK',
        supportedLanguages: ['cs', 'de'],
        title: `yearlyCheckTitle`,
        getPdfData: RK,
    },
    ZL: {
        type: 'IR',
        formName: 'ZL',
        supportedLanguages: ['cs', 'de'],
        title: `hpWarranty`,
        getPdfData: ZL,
    },
    RR: {
        type: 'IR',
        formName: 'RR',
        supportedLanguages: ['cs', 'de'],
        title: `regulusRouteTitle`,
        getPdfData: RR,
    },
    NN: {
        type: 'IR',
        formName: 'NN',
        supportedLanguages: ['cs'],
        title: p(`Návod na přístup do regulátoru IR`),
        getPdfData: NN,
    },
    UPT: {
        type: 'IR',
        formName: 'UPT',
        supportedLanguages: ['cs', 'de'],
        title: p(`Protokol o uvedení tepelného čerpadla do trvalého provozu`),
        getPdfData: UPT,
    },
    UPS: {
        type: 'IR',
        formName: 'UPS',
        supportedLanguages: ['cs'],
        title: p(`Protokol o uvedení solárního systému do trvalého provozu`),
        getPdfData: UPS,
    },
    SP: {
        type: 'IR',
        formName: 'SP',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        getPdfData: SP,
        requiredRegulus: true,
    },
    NSP: {
        type: 'SP',
        formName: 'SP',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        requiredRegulus: true,
        getPdfData: NSP,
    },
    CP: {
        type: 'SP',
        formName: 'CP',
        supportedLanguages: ['cs'],
        title: '',
        getPdfData: CP,
    },
};

type PdfInfo = {
    [P in Pdf]: PdfArgs<P>
};

export type Pdf<T extends 'IR' | 'SP' = 'IR' | 'SP'> = {
    [P in keyof AllPdf]: AllPdf[P] extends T ? P : never
}[keyof AllPdf];

type TypeOfPdf<P extends Pdf> = AllPdf[P];
export type DataOfPdf<P extends Pdf> = TypeOfPdf<P> extends 'IR' ? IR : Raw<DataSP2>;

export type GetPdfData<P extends Pdf> = (
    data: DataOfPdf<P>,
    t: Translations,
    addPage: <P extends Pdf>(
        pdfLink: P,
        data: DataOfPdf<P>,
        ...parameters: PdfParametersArray<P>
    ) => Promise<void>,
    ...parameters: PdfParametersArray<P>
) => Promise<PdfGenerationData>

export type PdfArgs<P extends Pdf> = {
    type: TypeOfPdf<P>;
    formName: string;
    supportedLanguages: LanguageCode[];
    title: TranslationReference;
    saveOptions?: SaveOptions;
    requiredAdmin?: boolean;
    requiredRegulus?: boolean;
    getPdfData: GetPdfData<P>;
};

type PdfParams = {
    RK: {
        pump: 1 | 2 | 3 | 4,
    },
    ZL: {
        pump: 1 | 2 | 3 | 4,
    },
    SP: {
        index: number,
    },
};
export type PdfParameters<P extends Pdf> = P extends keyof PdfParams ? PdfParams[P] : {};
export type PdfParametersArray<P extends Pdf> = P extends keyof PdfParams ? [PdfParams[P]] : [];

export const pdfParamsArray = <P extends Pdf>(p: PdfParameters<P>) =>
    (p.keys().length ? [p] : []) as PdfParametersArray<P>