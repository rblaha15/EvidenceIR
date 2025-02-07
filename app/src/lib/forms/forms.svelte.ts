import { type IR, type IRID } from '$lib/client/firestore';
import type { Form, Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { Readable } from 'svelte/store';
import { sp } from '$lib/forms/SP.svelte';
import { heatPumpCommission } from '$lib/forms/UvedeniTC';
import type { Pdf } from '$lib/client/pdf';
import type { TranslationReference, Translations } from '$lib/translations';
import { solarCollectorCommission } from '$lib/forms/UvedeniSOL';
import { check } from '$lib/forms/Kontrola.svelte';

export type FormName = 'sp' | 'heatPumpCommission' | 'solarCollectorCommission' | 'check'

export type Effect<
    F, S extends unknown[]
> = [
    (data: F, values: S) => void,
    { [I in keyof S]: Readable<S[I]> }
]

export type FormInfo<D, F extends Form<D> = Form<D>, S extends unknown[][] = []> = {
    storeName: string;
    defaultData: () => F;
    pdfLink: Pdf;
    saveData: (irid: IRID, raw: Raw<F>, edit: boolean) => Promise<void>;
    createWidgetData: (evidence: Raw<Data>, data: F) => D;
    title: (edit: boolean, t: Translations) => TranslationReference;
    subtitle?: ((edit: boolean, t: Translations) => TranslationReference) | undefined;
    getEditData?: ((ir: IR) => Raw<F> | undefined) | undefined;
    onMount?: (data: F) => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<F, S[I]> } | undefined;
    requiredAdmin?: boolean | undefined;
    requiredRegulus?: boolean | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formInfo: { [F in FormName]: FormInfo<any, any, any> } = {
    sp,
    heatPumpCommission,
    solarCollectorCommission,
    check,
};
