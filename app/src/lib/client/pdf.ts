import type { LanguageCode } from '$lib/languages';
import type { TranslationReference } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';
import { p } from '$lib/Vec.svelte';

const warranty = {
    formName: 'warranty',
    supportedLanguages: ['cs', 'de'],
    title: `hpWarranty`,
    fileName: `warrantyFileName`,
} as PdfArgs

export type Pdf =
    | 'check' | 'warranty' | 'warranty2' | 'warranty3' | 'warranty4' | 'rroute' | 'guide'
    | 'heatPumpCommissionProtocol' | 'solarCollectorCommissionProtocol' | 'installationProtocol';
export type PdfInfo = {
    [P in Pdf]: PdfArgs;
};
export const pdfInfo: PdfInfo = {
    check: {
        formName: 'check',
        supportedLanguages: ['cs', 'de'],
        title: `yearlyCheckTitle`,
        fileName: `yearlyCheckFileName`,
    },
    warranty: warranty,
    warranty2: warranty,
    warranty3: warranty,
    warranty4: warranty,
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