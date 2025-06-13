import type { LanguageCode } from '$lib/languages';
import { p, type TranslationReference } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';

export const toPdfTypeName = (linkName: Pdf) =>
    linkName.split('-')[0] as PdfTypeName;

export type Pdf<T extends 'IR' | 'SP' = 'IR' | 'SP'> = {
    IR: `check-${1 | 2 | 3 | 4}` | `warranty-${'' | 2 | 3 | 4}` | 'rroute' | 'guide'
        | 'heatPumpCommissionProtocol' | 'solarCollectorCommissionProtocol' | `installationProtocol-${number}`;
    SP: `publicInstallationProtocol`;
}[T]

type PdfTypeName<T extends 'IR' | 'SP' = 'IR' | 'SP'> = {
    [P in Pdf<T>]: P extends `${infer S}-${string}` ? S : P;
}[Pdf<T>]

export type PdfInfo = {
    [P in PdfTypeName<'IR'>]: PdfArgs<'IR'>;
} & {
    [P in PdfTypeName<'SP'>]: PdfArgs<'SP'>;
};
export const pdfInfo: PdfInfo = {
    check: {
        type: 'IR',
        formName: 'check',
        supportedLanguages: ['cs', 'de'],
        title: `yearlyCheckTitle`,
        fileName: 'RK',
    },
    warranty: {
        type: 'IR',
        formName: 'warranty',
        supportedLanguages: ['cs', 'de'],
        title: `hpWarranty`,
        fileName: 'ZL',
    },
    rroute: {
        type: 'IR',
        formName: 'rroute',
        supportedLanguages: ['cs', 'de'],
        title: `regulusRouteTitle`,
        fileName: 'RR',
    },
    guide: {
        type: 'IR',
        formName: 'guide',
        supportedLanguages: ['cs'],
        title: p(`Návod na přístup do regulátoru IR`),
        fileName: 'NN',
    },
    heatPumpCommissionProtocol: {
        type: 'IR',
        formName: 'heatPumpCommissionProtocol',
        supportedLanguages: ['cs', 'de'],
        title: p(`Protokol o uvedení tepelného čerpadla do trvalého provozu`),
        fileName: 'UPT',
    },
    solarCollectorCommissionProtocol: {
        type: 'IR',
        formName: 'solarCollectorCommissionProtocol',
        supportedLanguages: ['cs'],
        title: p(`Protokol o uvedení solárního systému do trvalého provozu`),
        fileName: 'UPS',
    },
    installationProtocol: {
        type: 'IR',
        formName: 'installationProtocol',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        fileName: 'SP',
        requiredRegulus: true,
    },
    publicInstallationProtocol: {
        type: 'SP',
        formName: 'installationProtocol',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        fileName: 'SP',
        requiredRegulus: true,
    },
};
export type PdfArgs<T extends 'IR' | 'SP' = 'IR' | 'SP'> = {
    type: T;
    formName: string;
    supportedLanguages: LanguageCode[];
    title: TranslationReference;
    fileName: string;
    saveOptions?: SaveOptions;
    requiredAdmin?: boolean;
    requiredRegulus?: boolean;
};