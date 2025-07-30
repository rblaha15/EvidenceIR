import type { OpenPdfOptions, Pdf } from '$lib/client/pdf';
import type { Form, Raw } from '$lib/forms/Form';
import type { Translations } from '$lib/translations';
import type { ExcelImport } from '$lib/forms/ExcelImport';
import type { Readable } from 'svelte/store';
import type { IRID } from '$lib/helpers/ir';
import type { IR } from '$lib/client/data';
import type { FormIN } from '$lib/forms/IN/formIN';

export type Effect<
    D, F extends Form<D>, S extends unknown[]
> = [
    (data: D, form: F, values: S, edit: boolean) => void,
    { [I in keyof S]: Readable<S[I]> }
]

export type Result = { text: string, red: boolean, load: boolean };

export type IndependentFormInfo<
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    R extends Raw<F> = Raw<F>
> = {
    type: '';
    storeName: string;
    defaultData: () => F;
    saveData: (raw: R, edit: boolean, form: F, editResult: (result: Result) => void, t: Translations, send: boolean) => Promise<boolean | void>;
    storeData?: (data: F) => R;
    createWidgetData: (data: F) => D;
    title: (t: Translations, mode: 'create' | 'edit' | 'view') => string;
    subtitle?: ((t: Translations, edit: boolean) => string) | undefined;
    getEditData?: ((url: URL) => Promise<R | undefined>) | undefined;
    getViewData?: ((url: URL) => Promise<R | undefined>) | undefined;
    onMount?: (data: D, form: F, mode: 'create' | 'edit' | 'view') => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<D, F, S[I]> } | undefined;
    importOptions?: Omit<ExcelImport<R>, 'defaultData'> & {
        onImport: (data: D, form: F) => void;
    };
    hideBackButton?: (edit: boolean) => boolean;
    isSendingEmails?: boolean;
    showSaveAndSendButtonByDefault?: boolean | Readable<boolean>;
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
    createWidgetData: (evidence: Raw<FormIN>, data: F) => D;
    getEditData?: ((ir: IR, url: URL) => R | undefined) | undefined;
    getViewData?: ((ir: IR, url: URL) => R | undefined) | undefined;
    onMount?: (data: D, form: F, mode: 'create' | 'edit' | 'view', ir: IR) => Promise<void> | undefined;
} & Omit<
    IndependentFormInfo<D, F, S, P, R>,
    'type' | 'saveData' | 'createWidgetData' | 'getEditData' | 'getViewData' | 'redirectLink' | 'hideBackButton' | 'openPdf' | 'onMount'
>