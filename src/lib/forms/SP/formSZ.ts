import type { InputWidget } from '$lib/forms/Widget.svelte';
import { type Form } from '$lib/forms/Form';

export interface FormSZ extends GenericFormSZ<DataSZ>, Form<DataSZ> {
}

export type DataSZ = FormSZ & {
    lockNameFields?: boolean
}

export interface GenericFormSZ<D extends GenericFormSZ<D>> extends Form<D> {
    zasah: {
        datum: InputWidget<D>,
        clovek: InputWidget<D>,
        popis: InputWidget<D>,
    },
}
