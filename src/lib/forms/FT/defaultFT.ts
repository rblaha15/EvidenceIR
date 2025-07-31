import type { DataFT, FormFT } from '$lib/forms/FT/formFT';
import { ChooserWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { p, type P } from '$lib/translations';
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
import type { DataRK } from '$lib/forms/RK/formRK';
import { todayISO } from '$lib/helpers/date';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';

const widgetInputC = (label: string, def: OptionsInputsC = 'nevyužito') =>
    new ChooserWidget<DataFT, P<OptionsInputsC>>({
        options: p(optionsInputsC), compact: true, required: false,
        label: p(label), chosen: p(def),
    });
const widgetInputB = (label: string, def: OptionsInputsB = 'nevyužito') =>
    new ChooserWidget<DataFT, P<OptionsInputsB>>({
        options: p(optionsInputsB), compact: true, required: false,
        label: p(label), chosen: p(def),
    });
const widgetOutputF = (label: string, def: OptionsOutputsF = 'nevyužito') =>
    new ChooserWidget<DataFT, P<OptionsOutputsF>>({
        options: p(optionsOutputsF), compact: true, required: false,
        label: p(label), chosen: p(def),
    });
const widgetOutputB = (label: string, def: OptionsOutputsB = 'nevyužito') =>
    new ChooserWidget<DataFT, P<OptionsOutputsB>>({
        options: p(optionsOutputsB), compact: true, required: false,
        label: p(label), chosen: p(def),
    });

export default (): FormFT => ({
    inputsC: {
        title: new TitleWidget({ text: 'ft.inputs', class: 'fs-3' }),
        C2: widgetInputC('C2', 'AKU'),
        C3: widgetInputC('C3'),
        C4: widgetInputC('C4', 'TV'),
        C5: widgetInputC('C5'),
        C6: widgetInputC('C6'),
        C7: widgetInputC('C7'),
        C8: widgetInputC('C8'),
        C9: widgetInputC('C9'),
        moduleUNI_label: new TextWidget({ text: 'ft.moduleUNI', class: 'fs-6' }),
        moduleUNI_1: widgetInputC('1'),
        moduleUNI_2: widgetInputC('2'),
        moduleUNI2_label: new TextWidget({ text: 'ft.moduleUNI2', class: 'fs-6' }),
        moduleUNI2_1: widgetInputC('1'),
        moduleUNI2_2: widgetInputC('2'),
    },
    inputsB: {
        title: new TitleWidget({ text: p(' '), class: 'fs-3' }),
        B8: widgetInputB('B8', 'iPWM vstup čerpadlo TČ1'),
        B9: widgetInputB('B9'),
    },
    outputsF: {
        title: new TitleWidget({ text: 'ft.outputs', class: 'fs-3' }),
        F2: widgetOutputF('F2'),
        F3: widgetOutputF('F3'),
        F4: widgetOutputF('F4'),
        F5: widgetOutputF('F5'),
        F6: widgetOutputF('F6'),
        moduleUNI_label: new TextWidget({ text: 'ft.moduleUNI', class: 'fs-6' }),
        moduleUNI_DO1: widgetOutputF('DO1'),
        moduleUNI_DO2: widgetOutputF('DO2'),
        moduleUNI2_label: new TextWidget({ text: 'ft.moduleUNI2', class: 'fs-6' }),
        moduleUNI2_DO1: widgetOutputF('DO1'),
        moduleUNI2_DO2: widgetOutputF('DO2'),
    },
    outputsB: {
        title: new TitleWidget({ text: p(' '), class: 'fs-3' }),
        B2: widgetOutputB('B2', 'PWM pro čerpadlo TČ1'),
        B3: widgetOutputB('B3'),
        moduleUNI_label: new TextWidget({ text: 'ft.moduleUNI', class: 'fs-6' }),
        moduleUNI_AO1: widgetOutputB('AO1'),
        moduleUNI2_label: new TextWidget({ text: 'ft.moduleUNI2', class: 'fs-6' }),
        moduleUNI2_AO1: widgetOutputB('AO1'),
    },
    info: {
        setBy: new InputWidget({ label: 'ft.setBy' }),
        date: new InputWidget({ label: 'ft.date', type: 'date', text: todayISO(), }),
    },
})