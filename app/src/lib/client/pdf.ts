import type { LanguageCode } from '$lib/languages';
import type { TranslationReference } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';
import { p } from '$lib/Vec.svelte';

export const toPdfTypeName = (linkName: Pdf) =>
    linkName.split('-')[0] as PdfTypeName;

export type Pdf =
    | 'check' | `warranty-${'' | 2 | 3 | 4}` | 'rroute' | 'guide'
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
        fileName: `yearlyCheckFileName`,
    },
    warranty: {
        formName: 'warranty',
        supportedLanguages: ['cs', 'de'],
        title: `hpWarranty`,
        fileName: `warrantyFileName`,
    },
    rroute: {
        formName: 'rroute',
        supportedLanguages: ['cs', 'de'],
        title: `regulusRouteTitle`,
        fileName: `regulusRouteFileName`,
    },
    guide: {
        formName: 'guide',
        supportedLanguages: ['cs'],
        title: p`Návod na přístup do regulátoru IR`,
        fileName: p`Návod IR.pdf`,
    },
    heatPumpCommissionProtocol: {
        formName: 'heatPumpCommissionProtocol',
        supportedLanguages: ['cs', 'de'],
        title: p`Protokol o uvedení tepelného čerpadla do trvalého provozu`,
        fileName: p`Protokol uvedení TČ.pdf`,
    },
    solarCollectorCommissionProtocol: {
        formName: 'solarCollectorCommissionProtocol',
        supportedLanguages: ['cs'],
        title: p`Protokol o uvedení solárního systému do trvalého provozu`,
        fileName: p`Protokol uvedení SOL.pdf`,
    },
    installationProtocol: {
        formName: 'installationProtocol',
        supportedLanguages: ['cs'],
        title: p`Instalační a servisní protokol`,
        fileName: p`SP.pdf`,
        requiredRegulus: true,
    },
};
export type PdfArgs = {
    formName: string;
    supportedLanguages: LanguageCode[];
    title: TranslationReference;
    fileName: TranslationReference;
    saveOptions?: SaveOptions;
    requiredAdmin?: boolean;
    requiredRegulus?: boolean;
};