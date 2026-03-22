import type { InputWidget } from '$lib/forms/Widget';
import { type Form, type Values } from '$lib/forms/Form';

export interface ContextSZ extends GenericContextSZ<ContextSZ> {
}

export interface FormSZ extends GenericFormSZ<ContextSZ>, Form<ContextSZ> {
}

export interface GenericContextSZ<C extends GenericContextSZ<C>> {
    v: Values<GenericFormSZ<C>>;
    lockNameFields?: boolean;
}

export interface GenericFormSZ<C extends GenericContextSZ<C>> extends Form<C> {
    zasah: {
        datum: InputWidget<C>,
        clovek: InputWidget<C>,
        popis: InputWidget<C>,
    },
}
