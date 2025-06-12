import type { LanguageCode } from '$lib/languages';
import { p, type TranslationReference } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';

export const toPdfTypeName = (linkName: Pdf) =>
    linkName.split('-')[0] as PdfTypeName;

export type Pdf =
    | `check-${1 | 2 | 3 | 4}` | `warranty-${'' | 2 | 3 | 4}` | 'rroute' | 'guide' | `publicInstallationProtocol`
    | 'heatPumpCommissionProtocol' | 'solarCollectorCommissionProtocol' | `installationProtocol-${number}`;
type PdfTypeName = {
    [P in Pdf]: P extends `${infer S}-${string}` ? S : P;
}[Pdf]
export type PdfInfo = {
    [P in PdfTypeName]: PdfArgs;
};
export const pdfInfo: PdfInfo = {
    check: {
        formName: 'check',
        supportedLanguages: ['cs', 'de'],
        title: `yearlyCheckTitle`,
        fileName: 'RK',
    },
    warranty: {
        formName: 'warranty',
        supportedLanguages: ['cs', 'de'],
        title: `hpWarranty`,
        fileName: 'ZL',
    },
    rroute: {
        formName: 'rroute',
        supportedLanguages: ['cs', 'de'],
        title: `regulusRouteTitle`,
        fileName: 'RR',
    },
    guide: {
        formName: 'guide',
        supportedLanguages: ['cs'],
        title: p(`Návod na přístup do regulátoru IR`),
        fileName: 'NN',
    },
    heatPumpCommissionProtocol: {
        formName: 'heatPumpCommissionProtocol',
        supportedLanguages: ['cs', 'de'],
        title: p(`Protokol o uvedení tepelného čerpadla do trvalého provozu`),
        fileName: 'UPT',
    },
    solarCollectorCommissionProtocol: {
        formName: 'solarCollectorCommissionProtocol',
        supportedLanguages: ['cs'],
        title: p(`Protokol o uvedení solárního systému do trvalého provozu`),
        fileName: 'UPS',
    },
    installationProtocol: {
        formName: 'installationProtocol',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        fileName: 'SP',
        requiredRegulus: true,
    },
    publicInstallationProtocol: {
        formName: 'installationProtocol',
        supportedLanguages: ['cs'],
        title: p(`Instalační a servisní protokol`),
        fileName: 'SP',
        requiredRegulus: true,
    },
};
export type PdfArgs = {
    formName: string;
    supportedLanguages: LanguageCode[];
    title: TranslationReference;
    fileName: string;
    saveOptions?: SaveOptions;
    requiredAdmin?: boolean;
    requiredRegulus?: boolean;
};