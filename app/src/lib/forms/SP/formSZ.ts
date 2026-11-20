import type { SparePart } from '$lib/client/db/arrays';
import { type Form, type Values } from '$lib/forms/Form';
import type { CounterWidget, InputWidget, SearchWidget } from '$lib/forms/Widget';

export type SimpleSparePartWidgetGroup<C> = {
    dil: SearchWidget<C, SparePart, true>,
    name: InputWidget<C>,
    code: InputWidget<C>,
    mnozstvi: InputWidget<C>,
}

// SP - full SP, SZ - for externals, reduced, BaseSZ - only a view of a full SP

export interface ContextSZ extends GenericContextSZ<ContextSZ> {
}

export interface FormSZ extends GenericFormSZ<ContextSZ>, Form<ContextSZ> {
}

export interface GenericContextSZ<C extends GenericContextSZ<C>> {
    v: Values<GenericFormSZ<C>>;
    edit?: boolean;
    isBaseSZ?: boolean;
}

export interface GenericFormSZ<C extends GenericContextSZ<C>> extends GenericBaseFormSZ<C> {
    zasah: {
        userEmail: InputWidget<C>,
    } & GenericBaseFormSZ<C>['zasah'],
    ukony: {
        doba: InputWidget<C>,
        doprava: InputWidget<C>,
    },
    nahradniDily: {
        pocet: CounterWidget<C>,
    },
    nahradniDil1: SimpleSparePartWidgetGroup<C>,
    nahradniDil2: SimpleSparePartWidgetGroup<C>,
    nahradniDil3: SimpleSparePartWidgetGroup<C>,
    nahradniDil4: SimpleSparePartWidgetGroup<C>,
    nahradniDil5: SimpleSparePartWidgetGroup<C>,
    nahradniDil6: SimpleSparePartWidgetGroup<C>,
    nahradniDil7: SimpleSparePartWidgetGroup<C>,
    nahradniDil8: SimpleSparePartWidgetGroup<C>,
    nahradniDil9: SimpleSparePartWidgetGroup<C>,
    nahradniDil10: SimpleSparePartWidgetGroup<C>,
    nahradniDil11: SimpleSparePartWidgetGroup<C>,
    nahradniDil12: SimpleSparePartWidgetGroup<C>,
    nahradniDil13: SimpleSparePartWidgetGroup<C>,
}

export interface BaseContextSZ extends GenericBaseContextSZ<BaseContextSZ> {
}

export interface BaseFormSZ extends GenericBaseFormSZ<BaseContextSZ>, Form<BaseContextSZ> {
}

export interface GenericBaseContextSZ<C extends GenericBaseContextSZ<C>> {
    v: Values<GenericBaseFormSZ<C>>;
    edit?: boolean;
}

export interface GenericBaseFormSZ<C extends GenericBaseContextSZ<C>> extends Form<C> {
    zasah: {
        datum: InputWidget<C>,
        clovek: InputWidget<C>,
        popis: InputWidget<C>,
    },
}
