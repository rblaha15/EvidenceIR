import type { PdfImport } from '$lib/forms/PdfImport';
import type { Raw } from '$lib/forms/Form';
import type { FormFT } from '$lib/forms/FT/formFT';
import { p } from '$lib/translations';
import { dateToISO } from '$lib/helpers/date';

export const fieldsFT: PdfImport<Raw<FormFT>>['fields'] = {
    info: {
        setBy: { type: 'text', name: 'Nastavil 1' },
        date: { type: 'text', name: 'Nastavil 2', transform: dateToISO },
    },
    inputsC: {
        C2: { type: 'dropdown', name: 'Dropdown1.0', transform: p, },
        C3: { type: 'dropdown', name: 'Dropdown1.1', transform: p, },
        C4: { type: 'dropdown', name: 'Dropdown1.2', transform: p, },
        C5: { type: 'dropdown', name: 'Dropdown1.3', transform: p, },
        C6: { type: 'dropdown', name: 'Dropdown1.4', transform: p, },
        C7: { type: 'dropdown', name: 'Dropdown1.5', transform: p, },
        C8: { type: 'dropdown', name: 'Dropdown1.6', transform: p, },
        C9: { type: 'dropdown', name: 'Dropdown1.7', transform: p, },
        UNI_1: { type: 'dropdown', name: 'Dropdown1.8.0.0', transform: p, },
        UNI_2: { type: 'dropdown', name: 'Dropdown1.8.0.1', transform: p, },
        UNI2_1: { type: 'dropdown', name: 'Dropdown1.8.1.0', transform: p, },
        UNI2_2: { type: 'dropdown', name: 'Dropdown1.8.1.1', transform: p, },
    },
    inputsB: {
        B8: { type: 'dropdown', name: 'Dropdown2.0', transform: p, },
        B9: { type: 'dropdown', name: 'Dropdown2.1', transform: p, },
    },
    outputsF: {
        F2: { type: 'dropdown', name: 'Dropdown3.0', transform: p, },
        F3: { type: 'dropdown', name: 'Dropdown3.1', transform: p, },
        F4: { type: 'dropdown', name: 'Dropdown3.2', transform: p, },
        F5: { type: 'dropdown', name: 'Dropdown3.3', transform: p, },
        F6: { type: 'dropdown', name: 'Dropdown3.4', transform: p, },
        UNI_DO1: { type: 'dropdown', name: 'Dropdown3.5.0.0', transform: p, },
        UNI_DO2: { type: 'dropdown', name: 'Dropdown3.5.0.1', transform: p, },
        UNI2_DO1: { type: 'dropdown', name: 'Dropdown3.5.1.0', transform: p, },
        UNI2_DO2: { type: 'dropdown', name: 'Dropdown3.5.1.1', transform: p, },
    },
    outputsB: {
        B2: { type: 'dropdown', name: 'Dropdown4.0', transform: p, },
        B3: { type: 'dropdown', name: 'Dropdown4.1', transform: p, },
        UNI_AO1: { type: 'dropdown', name: 'Dropdown4.2', transform: p, },
        UNI2_AO1: { type: 'dropdown', name: 'Dropdown4.3', transform: p, },
    },
};