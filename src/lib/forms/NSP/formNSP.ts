import type { UserForm } from '$lib/forms/IN/formIN';
import { type GenericFormSP } from '$lib/forms/SP/formSP.svelte';
import { dataToRawData, type Form } from '$lib/forms/Form';
import { CounterWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { userData } from '$lib/forms/IN/defaultIN';
import { multilineTooLong, defaultGenericSP } from '$lib/forms/SP/defaultSP';

export type DataNSP = FormNSP

export interface FormNSP extends GenericFormSP<DataNSP>, UserForm<DataNSP>, Form<DataNSP> {
    system: {
        nadpisSystem: TitleWidget<DataNSP>;
        popis: InputWidget<DataNSP>;
        overflowSystem: TextWidget<DataNSP>;
        pocetTC: CounterWidget<DataNSP>;
        nadpis: TitleWidget<DataNSP>;
    };
}

export const defaultNSP = (): FormNSP => ({
    ...userData(),
    system: {
        nadpisSystem: new TitleWidget({ text: t => t.in.system, level: 2 }),
        popis: new InputWidget({ label: t => t.sp.systemDescription, textArea: true, required: true }),
        overflowSystem: new TextWidget({ text: (t, d) => multilineTooLong(d.system.popis.value) ? t.sp.textTooLong : '' }),
        pocetTC: new CounterWidget({ label: t => t.sp.heatPumpCount, min: 0, max: Number.POSITIVE_INFINITY, chosen: 0 }),
        nadpis: new TitleWidget({ text: t => t.sp.title, level: 2 }),
    },
    ...defaultGenericSP((_, d) => ({
        type: 'NSP',
        data: dataToRawData(d),
    }), 3),
});