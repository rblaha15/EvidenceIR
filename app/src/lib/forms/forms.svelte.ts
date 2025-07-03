import type { Form, Raw } from '$lib/forms/Form';
import data, { type Data } from '$lib/forms/Data';
import type { Readable } from 'svelte/store';
import heatPumpCommission from '$lib/forms/UvedeniTC';
import type { Pdf, PdfParameters, DataOfPdf } from '$lib/client/pdf';
import type { Translations } from '$lib/translations';
import solarCollectorCommission from '$lib/forms/UvedeniSOL';
import check from '$lib/forms/Kontrola.svelte';
import type { ExcelImport } from '$lib/forms/Import';
import sp from '$lib/forms/SP.svelte';
import type { IRID } from '$lib/helpers/ir';
import type { IR } from '$lib/client/data';
import demand from '$lib/forms/Demand';
import sp2 from '$lib/forms/SP2';

export type Effect<
    D, F extends Form<D>, S extends unknown[]
> = [
    (data: D, form: F, values: S, edit: boolean) => void,
    { [I in keyof S]: Readable<S[I]> }
]

export type Result = { text: string, red: boolean, load: boolean };

export type OpenPdfOptions<P extends Pdf> = {
    link: P,
    data: DataOfPdf<P>,
} & PdfParameters<P>;

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
    title: (t: Translations, edit: boolean) => string;
    subtitle?: ((t: Translations, edit: boolean) => string) | undefined;
    getEditData?: (() => Promise<R | undefined>) | undefined;
    onMount?: (data: D, form: F, edit: boolean) => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<D, F, S[I]> } | undefined;
    importOptions?: Omit<ExcelImport<R>, 'defaultData'> & {
        onImport: (data: D, form: F) => void;
    };
    showBackButton?: (edit: boolean) => boolean;
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
    openPdf?: () => Omit<OpenPdfOptions<P>, 'data'>;
    saveData: (irid: IRID, raw: R, edit: boolean, form: F, editResult: (result: Result) => void, t: Translations, send: boolean, ir: IR) => Promise<boolean | void>;
    createWidgetData: (evidence: Raw<Data>, data: F) => D;
    getEditData?: ((ir: IR) => R | undefined) | undefined;
    onMount?: (data: D, form: F, edit: boolean, ir: IR) => Promise<void> | undefined;
} & Omit<
    IndependentFormInfo<D, F, S, P, R>,
    'type' | 'saveData' | 'createWidgetData' | 'getEditData' | 'redirectLink' | 'showBackButton' | 'openPdf' | 'onMount'
>

const all = {
    SP: sp,
    UPT: heatPumpCommission,
    UPS: solarCollectorCommission,
    RK: check,
    PO: demand,
    NSP: sp2,
    IN: data,
};
type All = typeof all;

export const forms = all.keys();
export type FormName = keyof All;

type AllFormInfo<
    N extends FormName,
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    R extends Raw<F> = Raw<F>,
> = {
    IR: P extends Pdf<'IR'> ? FormInfo<D, F, S, P, R> : never;
    '': IndependentFormInfo<D, F, S, P, R>;
}[All[N]['type']];

export const getForm = <
    N extends FormName,
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    R extends Raw<F> = Raw<F>,
>(name: N | string) => all[name as N] as unknown as AllFormInfo<N, D, F, S, P, R>;
