import type { Form, Raw } from '$lib/forms/Form';
import type { Widget } from '$lib/forms/Widget';

export const addDefaultValuesToFormPart = <C, P extends Record<string, Widget<C>>>(
    part: P,
    data: Raw<P>,
) => part.mapValues((key, widget) => ({
    ...widget,
    defaultValue: key in data && data[key as keyof Raw<P>] ? data[key as keyof Raw<P>] : widget.defaultValue,
})) as P;

export const addDefaultValuesToForm = <C, F extends Form<C>>(
    form: F,
    data: Raw<F>,
) => form.mapValues((key, formPart) =>
    addDefaultValuesToFormPart<C, F[keyof F]>(formPart, data[key as keyof Raw<F>] as Raw<F[keyof F]>),
) as F;