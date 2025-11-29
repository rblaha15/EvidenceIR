import type { OpenPdfOptions, Pdf } from '$lib/pdf/pdf';
import type { Form, Raw } from '$lib/forms/Form';
import type { Translations } from '$lib/translations';
import type { ExcelImport } from '$lib/forms/ExcelImport';
import type { Readable } from 'svelte/store';
import type { IRID } from '$lib/helpers/ir';
import type { IR } from '$lib/data';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { PdfImport } from '$lib/forms/PdfImport';

export type Effect<
    D, F extends Form<D>, S extends unknown[]
> = [
    (data: D, form: F, values: S, edit: boolean, t: Translations) => void,
    { [I in keyof S]: Readable<S[I]> }
]

export type Result = { text: string, red: boolean, load: boolean };
export const buttonKeys = ['hideBack', 'hideSave', 'saveAndSend', 'saveAndSendAgain', 'send', 'saveAsDraft'] as const
export type ButtonKey = typeof buttonKeys[number]

export type IndependentFormInfo<
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    O extends Record<string, unknown> = Record<never, unknown>,
> = {
    type: '';
    storeName: (other: O) => string;
    defaultData: (other: O) => F;
    saveData: (raw: Raw<F>, edit: boolean, form: F, editResult: (result: Result) => void, t: Translations, send: boolean, draft: boolean, other: O, resetForm: () => void) => Promise<boolean | void>;
    storeData?: (data: F, other: O) => Raw<F>;
    createWidgetData: (data: F, other: O) => keyof Form extends keyof D ? Omit<D, keyof Form> : D;
    title: (t: Translations, mode: 'create' | 'edit' | 'view', other: O) => string;
    subtitle?: ((t: Translations, edit: boolean) => string) | undefined;
    /**
     * Runs in +page.ts after getViewData
     */
    getEditData?: ((url: URL, other: O) => Promise<{ raw?: Raw<F>, other?: Partial<O> } | undefined>) | undefined;
    /**
     * Runs in +page.ts before getEditData
     */
    getViewData?: ((url: URL) => Promise<{ raw?: Raw<F>, other?: O } | undefined>) | undefined;
    onMount?: (data: D, form: F, mode: 'create' | 'edit' | 'view', other: O) => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<D, F, S[I]> } | undefined;
    excelImport?: Omit<ExcelImport<Raw<F>>, 'defaultData'> & {
        onImport: (data: D, form: F, other: O) => void;
    };
    pdfImport?: Omit<PdfImport<Raw<F>>, 'defaultData'> & {
        onImport: (data: D, form: F, other: O) => void;
    };
    buttons?: (edit: boolean, other: O) => MaybeReadable<{ [B in ButtonKey]?: boolean; }>;
    redirectLink?: (raw: Raw<F>, other: O) => Promise<string>;
    openPdf?: (raw: Raw<F>, other: O) => Promise<OpenPdfOptions<P>>;
    requiredRegulus?: boolean;
}

export type FormInfo<
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf<'IR'> = Pdf<'IR'>,
    O extends Record<string, unknown> = Record<never, unknown>,
> = {
    type: 'IR';
    openPdf?: (other: O) => Omit<OpenPdfOptions<P>, 'irid'>;
    saveData: (irid: IRID, raw: Raw<F>, edit: boolean, form: F, editResult: (result: Result) => void, t: Translations, send: boolean, ir: IR, other: O) => Promise<boolean | void>;
    createWidgetData: (evidence: Raw<FormIN>, data: F, ir: IR, other: O) => keyof Form extends keyof D ? Omit<D, keyof Form> : D;
    /**
     * Runs in +page.ts after getViewData
     */
    getEditData?: ((ir: IR, url: URL, other: O) => { raw?: Raw<F>, other?: Partial<O> } | undefined) | undefined;
    /**
     * Runs in +page.ts before getEditData
     */
    getViewData?: ((ir: IR, url: URL) => { raw?: Raw<F>, other?: O } | undefined) | undefined;
    onMount?: (data: D, form: F, mode: 'create' | 'edit' | 'view', ir: IR, other: O) => Promise<void> | undefined;
    buttons?: (edit: boolean, other: O) => MaybeReadable<{ [B in Exclude<ButtonKey, 'hideBack' | 'saveAsDraft'>]?: boolean; }>;
} & Omit<
    IndependentFormInfo<D, F, S, P, O>,
    'type' | 'saveData' | 'createWidgetData' | 'getEditData' | 'getViewData' | 'redirectLink' | 'openPdf' | 'onMount'
>