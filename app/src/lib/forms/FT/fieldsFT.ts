import type { PdfImport } from '$lib/forms/PdfImport';
import type { Raw } from '$lib/forms/Form';
import type { FormFT } from '$lib/forms/FT/formFT';
import { dateToISO } from '$lib/helpers/date';
import type { OptionsInputsB, OptionsInputsC, OptionsOutputsB, OptionsOutputsF } from '$lib/forms/FT/portsOptions';

export const fieldsFT: PdfImport<Raw<FormFT>>['fields'] = {
    info: {
        setBy: { type: 'text', name: 'Nastavil 1' },
        date: { type: 'text', name: 'Nastavil 2', transform: dateToISO },
    },
    inputsC: {
        C2: { type: 'dropdown', name: 'Dropdown1.0', transform: a => a as OptionsInputsC, },
        C3: { type: 'dropdown', name: 'Dropdown1.1', transform: a => a as OptionsInputsC, },
        C4: { type: 'dropdown', name: 'Dropdown1.2', transform: a => a as OptionsInputsC, },
        C5: { type: 'dropdown', name: 'Dropdown1.3', transform: a => a as OptionsInputsC, },
        C6: { type: 'dropdown', name: 'Dropdown1.4', transform: a => a as OptionsInputsC, },
        C7: { type: 'dropdown', name: 'Dropdown1.5', transform: a => a as OptionsInputsC, },
        C8: { type: 'dropdown', name: 'Dropdown1.6', transform: a => a as OptionsInputsC, },
        C9: { type: 'dropdown', name: 'Dropdown1.7', transform: a => a as OptionsInputsC, },
        UNI_1: { type: 'dropdown', name: 'Dropdown1.8.0.0', transform: a => a as OptionsInputsC, },
        UNI_2: { type: 'dropdown', name: 'Dropdown1.8.0.1', transform: a => a as OptionsInputsC, },
        UNI2_1: { type: 'dropdown', name: 'Dropdown1.8.1.0', transform: a => a as OptionsInputsC, },
        UNI2_2: { type: 'dropdown', name: 'Dropdown1.8.1.1', transform: a => a as OptionsInputsC, },
    },
    inputsB: {
        B8: { type: 'dropdown', name: 'Dropdown2.0', transform: a => a as OptionsInputsB, },
        B9: { type: 'dropdown', name: 'Dropdown2.1', transform: a => a as OptionsInputsB, },
    },
    outputsF: {
        F2: { type: 'dropdown', name: 'Dropdown3.0', transform: a => a as OptionsOutputsF, },
        F3: { type: 'dropdown', name: 'Dropdown3.1', transform: a => a as OptionsOutputsF, },
        F4: { type: 'dropdown', name: 'Dropdown3.2', transform: a => a as OptionsOutputsF, },
        F5: { type: 'dropdown', name: 'Dropdown3.3', transform: a => a as OptionsOutputsF, },
        F6: { type: 'dropdown', name: 'Dropdown3.4', transform: a => a as OptionsOutputsF, },
        UNI_DO1: { type: 'dropdown', name: 'Dropdown3.5.0.0', transform: a => a as OptionsOutputsF, },
        UNI_DO2: { type: 'dropdown', name: 'Dropdown3.5.0.1', transform: a => a as OptionsOutputsF, },
        UNI2_DO1: { type: 'dropdown', name: 'Dropdown3.5.1.0', transform: a => a as OptionsOutputsF, },
        UNI2_DO2: { type: 'dropdown', name: 'Dropdown3.5.1.1', transform: a => a as OptionsOutputsF, },
    },
    outputsB: {
        B2: { type: 'dropdown', name: 'Dropdown4.0', transform: a => a as OptionsOutputsB, },
        B3: { type: 'dropdown', name: 'Dropdown4.1', transform: a => a as OptionsOutputsB, },
        UNI_AO1: { type: 'dropdown', name: 'Dropdown4.2', transform: a => a as OptionsOutputsB, },
        UNI2_AO1: { type: 'dropdown', name: 'Dropdown4.3', transform: a => a as OptionsOutputsB, },
    },
};