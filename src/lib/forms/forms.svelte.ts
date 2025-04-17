import { type IR, type IRID } from '$lib/client/firestore';
import type { Form, Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { Readable } from 'svelte/store';
import { heatPumpCommission } from '$lib/forms/UvedeniTC';
import type { Pdf } from '$lib/client/pdf';
import type { Translations } from '$lib/translations';
import { solarCollectorCommission } from '$lib/forms/UvedeniSOL';
import { check } from '$lib/forms/Kontrola.svelte';
import type { ExcelImport } from '$lib/forms/Import';

export type FormName = 'sp' | 'heatPumpCommission' | 'solarCollectorCommission' | 'check'

export type Effect<
    D, F extends Form<D>, S extends unknown[]
> = [
    (data: D, form: F, values: S) => void,
    { [I in keyof S]: Readable<S[I]> }
]

export type DetachedFormInfo<D, F extends Form<D>, S extends unknown[][] = [], R extends Raw<F> = Raw<F>> = {
    storeName: string;
    defaultData: () => F;
    saveData: (raw: R, edit: boolean, data: F, editResult: (result: { text: string, red: boolean, load: boolean }) => void) => Promise<void>;
    storeData?: (data: F) => R;
    createWidgetData: (data: F) => D;
    title: (t: Translations, edit: boolean) => string;
    subtitle?: ((t: Translations, edit: boolean) => string) | undefined;
    getEditData?: (() => Promise<R | undefined>) | undefined;
    onMount?: (data: D, form: F) => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<D, F, S[I]> } | undefined;
    importOptions?: Omit<ExcelImport<R>, 'defaultData'> & {
        onImport: (data: D, form: F) => void;
    };
}

export type FormInfo<D, F extends Form<D>, S extends unknown[][] = [], R extends Raw<F> = Raw<F>> = {
    pdfLink: () => Pdf;
    saveData: (irid: IRID, raw: R, edit: boolean, data: F) => Promise<void>;
    createWidgetData: (evidence: Raw<Data>, data: F) => D;
    getEditData?: ((ir: IR) => R | undefined) | undefined;
} & Omit<DetachedFormInfo<D, F, S, R>, 'saveData' | 'createWidgetData' | 'getEditData'>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formInfo: { [F in FormName]: FormInfo<any, any, any, any> } = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sp: <FormInfo<any, any, any, any>> {},
    heatPumpCommission,
    solarCollectorCommission,
    check,
};

(async () => {
    formInfo.sp = (await import('$lib/forms/SP.svelte')).sp;
})();
