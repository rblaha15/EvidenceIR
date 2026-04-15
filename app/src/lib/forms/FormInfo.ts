import type { OpenPdfOptions, Pdf } from '$lib/pdf/pdf';
import type { Form, Raw, Values } from '$lib/forms/Form';
import type { Translations } from '$lib/translations';
import type { ExcelImport } from '$lib/forms/ExcelImport';
import type { Readable } from 'svelte/store';
import type { IRID } from '$lib/helpers/ir';
import type { IR } from '$lib/data';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { PdfImport } from '$lib/forms/PdfImport';

export type Effect<
    C, F extends Form<C>, S extends unknown[]
> = [
    (values: S, _: { context: C, values: Values<F>, edit: boolean, t: Translations }) => void,
    { [I in keyof S]: Readable<S[I]> }
]

export type Result = { text: string, red: boolean, load: boolean, error?: string };
export const buttonKeys = ['hideBack', 'hideSave', 'saveAndSend', 'saveAndSendAgain', 'send', 'saveAsDraft'] as const
export type ButtonKey = typeof buttonKeys[number]
export type Mode = 'create' | 'edit' | 'view';
export type ModeL = Mode | 'loading';

export type IndependentFormInfo<
    C,
    F extends Form<C>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    O extends Record<string, unknown> = Record<never, unknown>,
> = {
    type: '';
    storeName: (other: O) => string;
    form: (other: O) => F;
    saveData: (_: { raw: Raw<F>, edit: boolean, values: Values<F>, context: C, form: F, editResult(r: Result): void, t: Translations, send: boolean, draft: boolean, other: O, resetForm: () => void }) => Promise<boolean | void>;
    storeData?: (form: F, values: Values<F>, other: O) => Raw<F>;
    createContext: (_: { form: F, values: Values<F>, other: O, mode: ModeL }) => keyof Form extends keyof C ? Omit<C, keyof Form> : C;
    title: (t: Translations, mode: Mode, other: O) => string;
    subtitle?: ((t: Translations, edit: boolean) => string) | undefined;
    /**
     * Runs in +page.ts after getViewData
     */
    getEditData?: ((url: URL, other: O) => Promise<{ raw?: Raw<F>, other?: Partial<O> } | undefined>) | undefined;
    /**
     * Runs in +page.ts before getEditData
     */
    getViewData?: ((url: URL) => Promise<{ raw?: Raw<F>, other?: O } | undefined>) | undefined;
    onMount?: (_: { context: C, values: Values<F>, mode: Mode, other: O }) => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<C, F, S[I]> } | undefined;
    excelImport?: Omit<ExcelImport<Raw<F>>, 'defaultData'> & {
        onImport: (context: C, values: Values<F>, other: O) => void;
    };
    pdfImport?: Omit<PdfImport<Raw<F>>, 'defaultData'> & {
        onImport: (context: C, values: Values<F>, other: O) => void;
    };
    buttons?: (edit: boolean, other: O) => MaybeReadable<{ [B in ButtonKey]?: boolean; }>;
    redirectLink?: (raw: Raw<F>, other: O) => Promise<string>;
    openPdf?: (raw: Raw<F>, other: O) => Promise<OpenPdfOptions<P>>;
    requiredRegulus?: boolean;
}

export type FormInfo<
    C,
    F extends Form<C>,
    S extends unknown[][] = [],
    P extends Pdf<'IR'> = Pdf<'IR'>,
    O extends Record<string, unknown> = Record<never, unknown>,
> = {
    type: 'IR';
    form: (other: O, ir: IR) => F;
    openPdf?: (other: O) => Omit<OpenPdfOptions<P>, 'irid'>;
    saveData: (_: { irid: IRID, raw: Raw<F>, edit: boolean, values: Values<F>, context: C, form: F, editResult(r: Result): void, t: Translations, send: boolean, ir: IR, other: O }) => Promise<boolean | void>;
    createContext: (_: { IN: Raw<FormIN>, form: F, values: Values<F>, ir: IR, other: O, mode: ModeL }) => keyof Form extends keyof C ? Omit<C, keyof Form> : C;
    /**
     * Runs in +page.ts after getViewData
     */
    getEditData?: ((ir: IR, url: URL, other: O) => { raw?: Raw<F>, other?: Partial<O> } | undefined) | undefined;
    /**
     * Runs in +page.ts before getEditData
     */
    getViewData?: ((ir: IR, url: URL) => { raw?: Raw<F>, other?: O } | undefined) | undefined;
    onMount?: (_: { context: C, values: Values<F>, mode: Mode, ir: IR, other: O }) => Promise<void> | undefined;
    buttons?: (edit: boolean, other: O) => MaybeReadable<{ [B in Exclude<ButtonKey, 'hideBack' | 'saveAsDraft'>]?: boolean; }>;
} & Omit<
    IndependentFormInfo<C, F, S, P, O>,
    'type' | 'saveData' | 'createContext' | 'getEditData' | 'getViewData' | 'redirectLink' | 'openPdf' | 'onMount' | 'form'
>