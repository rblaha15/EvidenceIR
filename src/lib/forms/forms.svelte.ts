import { type IR, type IRID } from '$lib/client/firestore';
import type { Form, Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { Readable } from 'svelte/store';
import { sp } from '$lib/forms/SP.svelte';
import { heatPumpCommission } from '$lib/forms/UvedeniTC';
import type { Pdf } from '$lib/client/pdf';
import type { TranslationReference } from '$lib/translations';
import { solarCollectorCommission } from '$lib/forms/UvedeniSOL';

export type FormName = 'sp' | 'heatPumpCommission' | 'solarCollectorCommission'

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
    title: TranslationReference;
    getEditData?: ((ir: IR) => Raw<F> | undefined) | undefined;
    editTitle?: TranslationReference;
    onMount?: () => Promise<void> | undefined;
    storeEffects?: { [I in keyof S]: Effect<F, S[I]> } | undefined;
    requiredAdmin?: boolean | undefined;
    requiredRegulus?: boolean | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formInfo: { [F in FormName]: FormInfo<any, any, any> } = {
    sp,
    heatPumpCommission,
    solarCollectorCommission,
};
