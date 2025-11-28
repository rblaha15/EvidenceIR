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
export const buttonKeys = ['hideBack', 'hideSave', 'saveAndSend', 'saveAndSendAgain', 'send'] as const
export type ButtonKey = typeof buttonKeys[number]

export type IndependentFormInfo<
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    R extends Raw<F> = Raw<F>
> = {
    type: '';
    storeName: () => string;
    defaultData: () => F;
    saveData: (raw: R, edit: boolean, form: F, editResult: (result: Result) => void, t: Translations, send: boolean, resetForm: () => void) => Promise<boolean | void>;
    storeData?: (data: F) => R;
    createWidgetData: (data: F) => keyof Form extends keyof D ? Omit<D, keyof Form> : D;
    title: (t: Translations, mode: 'create' | 'edit' | 'view') => string;
    subtitle?: ((t: Translations, edit: boolean) => string) | undefined;
    /**
     * Runs after getViewData
     */
    getEditData?: ((url: URL) => Promise<R | undefined>) | undefined;
    /**
     * Runs before getEditData
     */
    getViewData?: ((url: URL) => Promise<R | undefined>) | undefined;
    onMount?: (data: D, form: F, mode: 'create' | 'edit' | 'view') => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<D, F, S[I]> } | undefined;
    excelImport?: Omit<ExcelImport<R>, 'defaultData'> & {
        onImport: (data: D, form: F) => void;
    };
    pdfImport?: Omit<PdfImport<R>, 'defaultData'> & {
        onImport: (data: D, form: F) => void;
    };
    buttons?: (edit: boolean) => MaybeReadable<{ [B in ButtonKey]?: boolean; }>;
    redirectLink?: (raw: R) => Promise<string>;
    openPdf?: (raw: R) => Promise<OpenPdfOptions<P>>;
    requiredRegulus?: boolean;
}

export type FormInfo<
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf<'IR'> = Pdf<'IR'>,
    R extends Raw<F> = Raw<F>
> = {
    type: 'IR';
    openPdf?: () => Omit<OpenPdfOptions<P>, 'irid'>;
    saveData: (irid: IRID, raw: R, edit: boolean, form: F, editResult: (result: Result) => void, t: Translations, send: boolean, ir: IR) => Promise<boolean | void>;
    createWidgetData: (evidence: Raw<FormIN>, data: F, ir: IR) => keyof Form extends keyof D ? Omit<D, keyof Form> : D;
    /**
     * Runs in +page.ts after getViewData
     */
    getEditData?: ((ir: IR, url: URL) => R | undefined) | undefined;
    /**
     * Runs in +page.ts before getEditData
     */
    getViewData?: ((ir: IR, url: URL) => R | undefined) | undefined;
    onMount?: (data: D, form: F, mode: 'create' | 'edit' | 'view', ir: IR) => Promise<void> | undefined;
} & Omit<
    IndependentFormInfo<D, F, S, P, R>,
    'type' | 'saveData' | 'createWidgetData' | 'getEditData' | 'getViewData' | 'redirectLink' | 'hideBackButton' | 'openPdf' | 'onMount'
>