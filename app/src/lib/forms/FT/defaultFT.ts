import type { DataFT, FormFT } from '$lib/forms/FT/formFT';
import { ChooserWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import {
    optionsInputsB,
    type OptionsInputsB,
    optionsInputsC,
    type OptionsInputsC,
    optionsOutputsB,
    type OptionsOutputsB,
    optionsOutputsF,
    type OptionsOutputsF,
} from '$lib/forms/FT/portsOptions';
import { todayISO } from '$lib/helpers/date';
import type { TranslationReference } from '$lib/translations';

const commonChooser = <O extends TranslationReference>(label: string, def: O, options: readonly O[], onlyCTC: boolean) =>
    new ChooserWidget<DataFT, O>({
        options: options, compact: true, required: false, label: label,
        chosen: def, show: !onlyCTC || (e => e.ir.typ.second == 'PLAIN_CTC')
    });

const widgetInputC = (label: string, onlyCTC = false, def: OptionsInputsC = 'nevyužito') =>
    commonChooser(label, def, optionsInputsC, onlyCTC);
const widgetInputB = (label: string, onlyCTC = false, def: OptionsInputsB = 'nevyužito') =>
    commonChooser(label, def, optionsInputsB, onlyCTC);
const widgetOutputF = (label: string, onlyCTC = false, def: OptionsOutputsF = 'nevyužito') =>
    commonChooser(label, def, optionsOutputsF, onlyCTC);
const widgetOutputB = (label: string, onlyCTC = false, def: OptionsOutputsB = 'nevyužito') =>
    commonChooser(label, def, optionsOutputsB, onlyCTC);

export default (): FormFT => ({
    inputsC: {
        title: new TitleWidget({ text: t => t.ft.inputs, class: 'fs-3' }),
        C2: widgetInputC('C2', false, 'AKU'),
        C3: widgetInputC('C3'),
        C4: widgetInputC('C4', false, 'TV'),
        C5: widgetInputC('C5'),
        C6: widgetInputC('C6'),
        C7: widgetInputC('C7'),
        C8: widgetInputC('C8', true),
        C9: widgetInputC('C9', true),
        labelUNI: new TextWidget({ text: t => t.ft.moduleUNI, class: 'fs-6' }),
        UNI_1: widgetInputC('1'),
        UNI_2: widgetInputC('2'),
        UNI2_label: new TextWidget({ text: t => t.ft.moduleUNI2, class: 'fs-6' }),
        UNI2_1: widgetInputC('1'),
        UNI2_2: widgetInputC('2'),
    },
    inputsB: {
        title: new TitleWidget({ text: ' ', class: 'fs-3' }),
        B8: widgetInputB('B8', false, 'iPWM vstup čerpadlo TČ1'),
        B9: widgetInputB('B9'),
    },
    outputsF: {
        title: new TitleWidget({ text: t => t.ft.outputs, class: 'fs-3' }),
        F2: widgetOutputF('F2'),
        F3: widgetOutputF('F3', true),
        F4: widgetOutputF('F4'),
        F5: widgetOutputF('F5'),
        F6: widgetOutputF('F6'),
        labelUNI: new TextWidget({ text: t => t.ft.moduleUNI, class: 'fs-6' }),
        UNI_DO1: widgetOutputF('DO1'),
        UNI_DO2: widgetOutputF('DO2'),
        UNI2_label: new TextWidget({ text: t => t.ft.moduleUNI2, class: 'fs-6' }),
        UNI2_DO1: widgetOutputF('DO1'),
        UNI2_DO2: widgetOutputF('DO2'),
    },
    outputsB: {
        title: new TitleWidget({ text: ' ', class: 'fs-3' }),
        B2: widgetOutputB('B2', false, 'PWM pro čerpadlo TČ1'),
        B3: widgetOutputB('B3'),
        labelUNI: new TextWidget({ text: t => t.ft.moduleUNI, class: 'fs-6' }),
        UNI_AO1: widgetOutputB('AO1'),
        UNI2_label: new TextWidget({ text: t => t.ft.moduleUNI2, class: 'fs-6' }),
        UNI2_AO1: widgetOutputB('AO1'),
    },
    info: {
        setBy: new InputWidget({ label: t => t.ft.setBy }),
        date: new InputWidget({ label: t => t.ft.date, type: 'date', text: todayISO(), }),
    },
})