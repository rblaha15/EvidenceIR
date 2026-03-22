import '$lib/extensions';
import type { BaseWidget, Widget, WidgetType } from '$lib/forms/Widget';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type HiddenFormGroup<C> = Record<`_${string}`, Widget<C, any, true>>;
type HiddenForm<C> = Record<`_${string}`, HiddenFormGroup<C>>;
export type FormGroupPlus<P extends Record<string, Widget>> = P extends Record<string, Widget<infer C>>
    ? P & HiddenFormGroup<C> : never;

export type FormPlus<F extends Form> = F extends Form<infer C> ? {
    [K in keyof F]: FormGroupPlus<F[K]>;
} & HiddenForm<C> : never;

export type Form<C = never> = Record<string, Record<string, Widget<C>>>
export type Raw<Q extends Form | Record<string, Widget> | Widget> =
    Q extends Form ? RawForm<Q>
        : Q extends Record<string, Widget> ? RawFormPart<Q>
            : Q extends Widget ? RawWidget<Q>
                : never;

export type RawForm<F extends Form> = {
    [K in keyof F]: RawFormPart<F[K]>
};
export type HiddenWidgets<P extends Record<string, Widget>> = {
    [K in keyof P]: P[K] extends Widget<never, WidgetType, infer H> ? H extends true ? K : never : never;
}[keyof P];
export type RawFormPart<P extends Record<string, Widget>> = {
    [K in keyof Omit<P, HiddenWidgets<P>>]: RawWidget<P[K]>;
};
export type RawWidget<W extends Widget> =
    W extends BaseWidget<never, infer U, WidgetType, infer H>
        ? H extends true
            ? never
            : U extends readonly (infer RU)[] ? RU[]
                : U extends Record<string, unknown> ? Writeable<U> : U
        : never;

export type Values<Q extends Form | Record<string, Widget> | Widget> =
    Q extends Form ? FormValues<Q>
        : Q extends Record<string, Widget> ? FormPartValues<Q>
            : Q extends Widget ? WidgetValue<Q>
                : never;

export type FormValues<F extends Form> = {
    [K in keyof F]: FormPartValues<F[K]>
};
export type FormPartValues<P extends Record<string, Widget>> = {
    [K in keyof P]: WidgetValue<P[K]>;
};
export type WidgetValue<W extends Widget> =
    W extends BaseWidget<never, infer U, WidgetType>
        ? U extends readonly (infer RU)[] ? RU[]
            : U extends Record<string, unknown> ? Writeable<U> : U
        : never;

export const defaultFormGroupValues = <G extends Record<string, Widget>, V extends FormPartValues<G> = FormPartValues<G>>(formGroup: G): V =>
    formGroup.mapEntries((key, widget) => {
        if (widget == undefined) return undefined;
        return [key, widget.defaultValue] as [keyof V[keyof V], unknown];
    }) as V;

export const defaultValues = <F extends Form, V extends Values<F> = Values<F>>(form: F): V =>
    form.mapEntries((groupKey, formGroup) => {
        const formGroupValues = defaultFormGroupValues(formGroup);
        return [groupKey, formGroupValues] as [keyof V, V[keyof V]];
    }) as V;

export const valuesToRawData = <F extends Form, V extends Values<F> = Values<F>, R extends Raw<F> = Raw<F>>(form: F, values: V): R =>
    form.mapEntries((groupKey, formGroup) => {
        const rawFormGroup = formGroup.mapEntries((key, widget) => {
            if ((key as string).startsWith('_')) return undefined;
            if (!widget) return undefined;
            if (widget.hideInRawData) return undefined;
            if (!(groupKey in values)) return undefined;
            if (!(key in values[groupKey as keyof V])) return undefined;
            const value = values[groupKey as keyof V][key as keyof V[keyof V]];
            return [key, value] as [keyof R[keyof R], unknown];
        });
        return [groupKey, rawFormGroup] as [keyof R, R[keyof R]];
    }) as R;

export const rawDataToValues = <F extends Form, V extends Values<F> = Values<F>, R extends Raw<F> = Raw<F>>(form: F, rawData: R): V =>
    form.mapEntries((groupKey, formGroup) => {
        const rawFormGroup = formGroup.mapEntries((key, widget) => {
            if (!widget) return undefined;
            const value = rawData?.[groupKey as keyof R]?.[key as keyof R[keyof R]] ?? widget.defaultValue;
            return [key, value] as [keyof V[keyof V], unknown];
        });
        return [groupKey, rawFormGroup] as [keyof V, V[keyof V]];
    }) as V;

export const compareValues = <F extends Form>(currentValues: Values<F>, defaultValues: Values<F>) =>
    defaultValues.entries().every(([k1, section]) =>
        !currentValues[k1] || section.entries().every(([k2, value]) =>
            !currentValues[k1][k2] || currentValues[k1][k2] == value,
        ));

export type WidgetWithValue<C = never, U = any, T extends WidgetType = WidgetType, H extends boolean = boolean> = {
    widget: Widget<C, T, H>;
    get value(): U;
    set value(newValue: U);
}

export const widgetList = <C, F extends Form<C>, V extends Values<F> = Values<F>>(form: F, values: V) =>
    form.mapTo((groupKey, formGroup) =>
        formGroup.mapTo((key, widget) => ({
            widget,
            get value() {
                return values[groupKey as keyof V][key as keyof V[keyof V]];
            },
            set value(newValue) {
                values[groupKey as keyof V][key as keyof V[keyof V]] = newValue;
            },
        }) as WidgetWithValue<C>),
    ).flat();