import type { UserForm } from '$lib/forms/IN/formIN';
import { type GenericFormSP } from '$lib/forms/SP/formSP.svelte';
import type { Form } from '$lib/forms/Form';
import { CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { userData } from '$lib/forms/IN/defaultIN';
import { p } from '$lib/translations';
import defaultSP from '$lib/forms/SP/defaultSP';

export type DataNSP = UserForm<DataNSP> & GenericFormSP<DataNSP>

export interface FormNSP extends GenericFormSP<DataNSP>, UserForm<DataNSP>, Form<DataNSP> {
    system: {
        nadpis: TitleWidget<DataNSP>;
        popis: InputWidget<DataNSP>;
        pocetTC: CounterWidget<DataNSP>;
    };
}

export const defaultNSP = (): FormNSP => ({
    ...userData(),
    system: {
        nadpis: new TitleWidget({ text: p('Instalační a servisní protokol') }),
        popis: new InputWidget({ label: p('Popis systému'), textArea: true, required: true }),
        pocetTC: new CounterWidget({ label: p('Počet TČ v instalaci'), min: 0, max: Number.POSITIVE_INFINITY, chosen: 0 }),
    },
    ...defaultSP(),
});