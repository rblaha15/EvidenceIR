import type { UserForm } from '$lib/forms/IN/formIN';
import { type GenericContextSP, type GenericFormSP } from '$lib/forms/SP/formSP.svelte';
import { type Form, type FormPlus, type Values, valuesToRawData } from '$lib/forms/Form';
import { InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { userData } from '$lib/forms/IN/defaultIN';
import { multilineTooLong, defaultGenericSP } from '$lib/forms/SP/defaultSP';
import { newNSP } from '$lib/data';
import type { User } from 'firebase/auth';

export interface ContextNSP extends GenericContextSP<ContextNSP> {
    v: Values<FormNSP>
    f: FormNSP
}

export interface FormNSP extends GenericFormSP<ContextNSP>, UserForm<ContextNSP>, Form<ContextNSP> {
    system: {
        popis: InputWidget<ContextNSP>;
    } & GenericFormSP<ContextNSP>['system'];
}

export const defaultNSP = (): FormPlus<FormNSP> => {
    const { system, ...otherSP } = defaultGenericSP<ContextNSP>((_, c) => ({
        data: newNSP(valuesToRawData(c.f, c.v), { email: '', uid: '' } as User),
        form: c.f,
        values: c.v,
        pumpCount: 1,
    }), () => 1, 3, true);

    return ({
        system: {
            _title: new TitleWidget({ text: t => t.in.system, level: 2 }),
            popis: new InputWidget({ label: t => t.sp.systemDescription, textArea: true, required: true }),
            _overflowSystem: new TextWidget({ text: (t, c) => multilineTooLong(c.v.system.popis) ? t.sp.textTooLong : '' }),
            ...system,
        },
        ...userData(),
        _info: {
            _title: new TitleWidget({ text: t => t.sp.title, level: 2 }),
        },
        ...otherSP,
    });
};