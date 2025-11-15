import { get, type Translations } from '$lib/translations';
import type { SaveOptions } from 'pdf-lib';
import type { IR, Year } from '$lib/data';
import type { PdfGenerationData } from '$lib/pdf/pdfGeneration';
import RKT from '$lib/pdf/generators/pdfRKT';
import RKS from '$lib/pdf/generators/pdfRKS';
import NN from '$lib/pdf/generators/pdfNN';
import ZLT from '$lib/pdf/generators/pdfZLT';
import ZLS from '$lib/pdf/generators/pdfZLS';
import RR from '$lib/pdf/generators/pdfRR';
import UPT from '$lib/pdf/generators/pdfUPT';
import UPS from '$lib/pdf/generators/pdfUPS';
import SP, { pdfCP as CP, pdfNSP as NSP, pdfPS as PS } from '$lib/pdf/generators/pdfSP';
import UPF from '$lib/pdf/generators/pdfUPF';
import FT from '$lib/pdf/generators/pdfFT';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { TC } from '$lib/forms/IN/defaultIN';
import { type IRID, irName, type SPID } from '$lib/helpers/ir';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import type { LanguageCode } from '$lib/languageCodes';

type AllPdf = {
    /** Roční kontrola TČ */
    RKT: 'IR'
    /** Roční kontrola SOL */
    RKS: 'IR'
    /** Záruční list TČ */
    ZLT: 'IR'
    /** Záruční list SOL */
    ZLS: 'IR'
    /** Souhlas s RegulusRoute */
    RR: 'IR'
    /** Návod SEIR  */
    NN: ''
    /** Návod na přístup do IR  */
    NNR: 'IR'
    /** Uživatelský průvodce pro RegulusBIO  */
    NNT: ''
    /** Uvedení TČ do provozu */
    UPT: 'IR'
    /** Uvedení SOL do provozu */
    UPS: 'IR'
    /** Uvedení FVE do provozu */
    UPF: 'IR'
    /** Servisní protokol */
    SP: 'IR'
    /** Doporučení pro úsporný provoz TČ */
    TCI: ''
    /** Jste spokojeni s tepelným čerpadlem Regulus? */
    RS: ''
    /** Nezávislý servisní protokol */
    NSP: 'SP'
    /** Čestné prohlášení */
    CP: 'SP'
    /** Prázdná sránka */
    PS: 'SP'
    /** FaceTable */
    FT: 'IR'
}

export const pdfInfo: PdfInfo = {
    RKT: {
        type: 'IR',
        pdfName: 'RKT',
        supportedLanguages: ['cs', 'de'],
        title: t => t.rkt.title,
        getPdfData: RKT,
    },
    RKS: {
        type: 'IR',
        pdfName: 'RKS',
        supportedLanguages: ['cs', 'de'],
        title: t => t.rks.title,
        getPdfData: RKS,
    },
    ZLT: {
        type: 'IR',
        pdfName: 'ZLT',
        supportedLanguages: ['cs', 'de'],
        title: t => t.zlt.title,
        getPdfData: ZLT,
    },
    ZLS: {
        type: 'IR',
        pdfName: 'ZLS',
        supportedLanguages: ['cs', 'de'],
        title: t => t.zls.title,
        getPdfData: ZLS,
    },
    RR: {
        type: 'IR',
        pdfName: 'RR',
        supportedLanguages: ['cs', 'de'],
        title: t => t.rr.title,
        getPdfData: RR,
    },
    NN: {
        type: '',
        pdfName: 'NN',
        supportedLanguages: ['cs'],
        title: t => t.nn.title,
    },
    NNR: {
        type: 'IR',
        pdfName: 'NNR',
        supportedLanguages: ['cs'],
        title: t => t.nnr.title,
        getPdfData: NN,
    },
    NNT: {
        type: '',
        pdfName: 'NNT',
        supportedLanguages: ['cs'],
        title: t => t.nnt.title,
    },
    UPT: {
        type: 'IR',
        pdfName: 'UPT',
        supportedLanguages: ['cs', 'de'],
        title: t => t.tc.title,
        getPdfData: UPT,
        doNotFlatten: true,
    },
    UPS: {
        type: 'IR',
        pdfName: 'UPS',
        supportedLanguages: ['cs'],
        title: t => t.sol.title,
        getPdfData: UPS,
    },
    SP: {
        type: 'IR',
        pdfName: 'SP',
        supportedLanguages: ['cs'],
        title: t => t.sp.title,
        getPdfData: SP,
        requiredRegulus: true,
        doNotFlatten: true,
    },
    NSP: {
        type: 'SP',
        pdfName: 'SP',
        supportedLanguages: ['cs'],
        title: t => t.sp.title,
        requiredRegulus: true,
        getPdfData: NSP,
        doNotFlatten: true,
    },
    CP: {
        type: 'SP',
        pdfName: 'CP',
        supportedLanguages: ['cs'],
        title: _ => '',
        getPdfData: CP,
        doNotFlatten: true,
    },
    PS: {
        type: 'SP',
        pdfName: 'PS',
        supportedLanguages: ['cs'],
        title: _ => '',
        getPdfData: PS,
    },
    UPF: {
        type: 'IR',
        pdfName: 'UPF',
        supportedLanguages: ['cs'],
        title: t => t.fve.title,
        getPdfData: UPF,
    },
    TCI: {
        type: '',
        pdfName: 'TCI',
        supportedLanguages: ['cs'],
        title: _ => '',
    },
    RS: {
        type: '',
        pdfName: 'RS',
        supportedLanguages: ['cs'],
        title: _ => '',
    },
    FT: {
        type: 'IR',
        pdfName: 'FT',
        supportedLanguages: ['cs'],
        title: t => t.ft.title,
        getPdfData: FT,
    },
};

type PdfInfo = {
    [P in Pdf]: PdfArgs<P>
};

export type Pdf<T extends 'IR' | 'SP' | '' = 'IR' | 'SP' | ''> = {
    [P in keyof AllPdf]: AllPdf[P] extends T ? P : never
}[keyof AllPdf];

type TypeOfPdf<P extends Pdf> = AllPdf[P];
export type DataOfPdf<P extends Pdf> = { IR: IR, SP: Raw<FormNSP>, '': Record<never, never> }[TypeOfPdf<P>];
export type PdfID<P extends Pdf> = { IR: { irid: IRID; spid?: undefined }, SP: { spid: SPID; irid?: undefined }, '': { spid?: undefined; irid?: undefined } }[TypeOfPdf<P>];

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
    title: (t: Translations) => string;
    saveOptions?: SaveOptions;
    requiredAdmin?: boolean;
    requiredRegulus?: boolean;
    getPdfData?: GetPdfData<P>;
    doNotFlatten?: boolean,
};

type PdfParams = {
    RKT: {
        pump: TC,
        lastYear?: Year,
    },
    RKS: {
        lastYear?: Year,
    },
    ZLT: {
        pump: TC,
    },
    SP: {
        index: number,
    },
    NSP: {
        pumpCount?: number,
    },
};
export type PdfParameters<P extends Pdf> = P extends keyof PdfParams ? PdfParams[P] : {};

export const generalizeServiceProtocol = (
    e: Raw<FormIN>, p: Raw<FormSP>, u: IR['uvedeniTC'], t: Translations,
) => ({
    ...e,
    ...p,
    system: {
        ...p.system,
        popis:
            irName(e.ir) +
            (e.ir.cisloBox ? `; BOX: ${e.ir.cisloBox}` : '') +
            (u.nadrze?.akumulacka || u.nadrze?.zasobnik ? '\n' : '') +
            (u.nadrze?.akumulacka ? `Nádrž: ${u.nadrze.akumulacka}` : '') +
            (u.nadrze?.akumulacka && u.nadrze?.zasobnik ? '; ' : '') +
            (u.nadrze?.zasobnik ? `Zásobník: ${u.nadrze.zasobnik}` : '') +
            (e.ir.chceVyplnitK.includes('solarCollector') ? `\nSOL: ${e.sol.typ} – ${e.sol.pocet}x` : '') +
            (e.rek?.typ ? `\nREK: ${e.rek.typ}` : '') +
            (e.fve?.pocet ? `\nFVE: ${get(t.in.fve, e.fve.typ)} – ${e.fve.pocet}x` : '') +
            (e.fve?.akumulaceDoBaterii ? `; baterie: ${e.fve.typBaterii} – ${e.fve.kapacitaBaterii} kWh` : '') +
            (e.jine?.popis ? `\nJiné zařízení: ${e.jine.popis}` : '') +
            (e.tc.model ? '\n' + cascadePumps(e).map(t.sp.pumpDetails).join('; ') : ''),
    },
}) satisfies Raw<FormNSP>;