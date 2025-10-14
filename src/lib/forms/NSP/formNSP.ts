import type { UserForm } from '$lib/forms/IN/formIN';
import { type GenericFormSP } from '$lib/forms/SP/formSP.svelte';
import { dataToRawData, type Form, type FormPlus } from '$lib/forms/Form';
import { CounterWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { userData } from '$lib/forms/IN/defaultIN';
import { multilineTooLong, defaultGenericSP } from '$lib/forms/SP/defaultSP';

export type DataNSP = FormNSP

export interface FormNSP extends GenericFormSP<DataNSP>, UserForm<DataNSP>, Form<DataNSP> {
    system: {
        popis: InputWidget<DataNSP>;
    } & GenericFormSP<DataNSP>['system'];
}

export const defaultNSP = (): FormPlus<FormNSP> => {
    const { system, ...otherSP } = defaultGenericSP<FormNSP>((_, d) => ({
        data: dataToRawData(d),
        form: d,
        pumpCount: 1,
    }), () => 1, 3, true);

    return ({
        system: {
            _title: new TitleWidget({ text: t => t.in.system, level: 2 }),
            popis: new InputWidget({ label: t => t.sp.systemDescription, textArea: true, required: true }),
            _overflowSystem: new TextWidget({ text: (t, d) => multilineTooLong(d.system.popis.value) ? t.sp.textTooLong : '' }),
            ...system,
        },
        ...userData(),
        _info: {
            _title: new TitleWidget({ text: t => t.sp.title, level: 2 }),
        },
        ...otherSP,
    });
};