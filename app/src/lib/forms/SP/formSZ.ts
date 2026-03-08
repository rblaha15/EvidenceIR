import {
    type ChooserWidget,
    type CounterWidget, HiddenValueWidget,
    type InlinePdfPreviewWidget,
    type InputWidget,
    type MultiCheckboxWidget,
    type RadioWidget,
    type RadioWithInputWidget,
    type SearchWidget,
} from '$lib/forms/Widget.svelte';
import { type SparePart } from '$lib/client/realtime';
import { type Form, type Raw } from '$lib/forms/Form';
import type { IR } from '$lib/data';

export interface FormSZ extends GenericFormSZ<DataSZ>, Form<DataSZ> {
}

export type DataSZ = FormSZ

export interface GenericFormSZ<D extends GenericFormSZ<D>> extends Form<D> {
    zasah: {
        datum: InputWidget<D>,
        clovek: InputWidget<D>,
        popis: InputWidget<D>,
    },
}
