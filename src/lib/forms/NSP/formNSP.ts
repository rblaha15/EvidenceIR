import type { UserForm } from '$lib/forms/IN/formIN';
import { type DataSP, type GenericFormSP } from '$lib/forms/SP/formSP.svelte';
import { dataToRawData, type Form } from '$lib/forms/Form';
import { CounterWidget, InlinePdfPreviewWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { userData } from '$lib/forms/IN/defaultIN';
import { multilineTooLong, defaultGenericSP } from '$lib/forms/SP/defaultSP';

import { generalizeServiceProtocol } from '$lib/pdf/pdf';

export type DataNSP = FormNSP

export interface FormNSP extends GenericFormSP<DataNSP>, UserForm<DataNSP>, Form<DataNSP> {
    system: {
        nadpis: TitleWidget<DataNSP>;
        popis: InputWidget<DataNSP>;
        overflowSystem: TextWidget<DataNSP>;
        pocetTC: CounterWidget<DataNSP>;
    };
    other: {
        preview: InlinePdfPreviewWidget<DataNSP, 'NSP'>
    },
}

export const defaultNSP = (): FormNSP => ({
    ...userData(),
    system: {
        nadpis: new TitleWidget({ text: t => t.sp.title }),
        popis: new InputWidget({ label: t => t.sp.systemDescription, textArea: true, required: true }),
        overflowSystem: new TextWidget({ text: (t, d) => multilineTooLong(d.system.popis.value) ? t.sp.textTooLong : '' }),
        pocetTC: new CounterWidget({ label: t => t.sp.heatPumpCount, min: 0, max: Number.POSITIVE_INFINITY, chosen: 0 }),
    },
    ...defaultGenericSP((_, d) => ({
        type: 'NSP',
        data: dataToRawData(d),
    })),
});