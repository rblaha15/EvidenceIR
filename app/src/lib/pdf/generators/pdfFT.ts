// noinspection JSNonASCIINames,NonAsciiCharacters

import type { GetPdfData } from '$lib/pdf/pdf';
import { dateFromISO } from '$lib/helpers/date';
import { endUserName, irType } from '$lib/helpers/ir';

const pdfFT: GetPdfData<'FT'> = async ({ data: { FT, IN }, t }) => {
    if (!FT) throw new Error("FT not filled")
    const ctc = IN.ir.typ.second == 'CTC'
    return {
        _typ: { type: 'text', value: irType(IN.ir.typ) },
        _uživatel: { type: 'text', value: endUserName(IN.koncovyUzivatel) },
        _místo: { type: 'text', value: `${IN.mistoRealizace.ulice}, ${IN.mistoRealizace.psc} ${IN.mistoRealizace.obec}` },
        'Dropdown1.0': FT.inputsC.C2,
        'Dropdown1.1': FT.inputsC.C3,
        'Dropdown1.2': FT.inputsC.C4,
        'Dropdown1.3': FT.inputsC.C5,
        'Dropdown1.4': FT.inputsC.C6,
        'Dropdown1.5': FT.inputsC.C7,
        'Dropdown1.6': ctc ? FT.inputsC.C8 : '—',
        'Dropdown1.7': ctc ? FT.inputsC.C9 : '—',
        'Dropdown1.8.0.0': FT.inputsC.UNI_1,
        'Dropdown1.8.0.1': FT.inputsC.UNI_2,
        'Dropdown1.8.1.0': FT.inputsC.UNI2_1,
        'Dropdown1.8.1.1': FT.inputsC.UNI2_2,
        'Dropdown2.0': FT.inputsB.B8,
        'Dropdown2.1': FT.inputsB.B9,
        'Dropdown3.0': FT.outputsF.F2,
        'Dropdown3.1': ctc ? FT.outputsF.F3 : '—',
        'Dropdown3.2': FT.outputsF.F4,
        'Dropdown3.3': FT.outputsF.F5,
        'Dropdown3.4': FT.outputsF.F6,
        'Dropdown3.5.0.0': FT.outputsF.UNI_DO1,
        'Dropdown3.5.0.1': FT.outputsF.UNI_DO2,
        'Dropdown3.5.1.0': FT.outputsF.UNI2_DO1,
        'Dropdown3.5.1.1': FT.outputsF.UNI2_DO2,
        'Dropdown4.0': FT.outputsB.B2,
        'Dropdown4.1': FT.outputsB.B3,
        'Dropdown4.2': FT.outputsB.UNI_AO1,
        'Dropdown4.3': FT.outputsB.UNI2_AO1,
        '_Nastavil 1': { type: 'text', value: FT.info.setBy },
        '_Nastavil 2': { type: 'text', value: dateFromISO(FT.info.date) },
    };
};

export default pdfFT;