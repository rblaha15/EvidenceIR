// noinspection JSNonASCIINames,NonAsciiCharacters

import type { GetPdfData } from '$lib/client/pdf';
import { dateFromISO } from '$lib/helpers/date';
import { endUserName, irType } from '$lib/helpers/ir';
import { p } from '$lib/translations';

const pdfFT: GetPdfData<'FT'> = async ({ data: { faceTable, evidence: e }, t }) => {
    const f = faceTable!
    const ctc = e.ir.typ.second == p('CTC')
    return {
        _typ: { type: 'text', value: irType(e.ir.typ) },
        _uživatel: { type: 'text', value: endUserName(e.koncovyUzivatel) },
        _místo: { type: 'text', value: `${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}` },
        'Dropdown1.0': t.get(f.inputsC.C2),
        'Dropdown1.1': t.get(f.inputsC.C3),
        'Dropdown1.2': t.get(f.inputsC.C4),
        'Dropdown1.3': t.get(f.inputsC.C5),
        'Dropdown1.4': t.get(f.inputsC.C6),
        'Dropdown1.5': t.get(f.inputsC.C7),
        'Dropdown1.6': ctc ? t.get(f.inputsC.C8) : '—',
        'Dropdown1.7': ctc ? t.get(f.inputsC.C9) : '—',
        'Dropdown1.8.0.0': t.get(f.inputsC.UNI_1),
        'Dropdown1.8.0.1': t.get(f.inputsC.UNI_2),
        'Dropdown1.8.1.0': t.get(f.inputsC.UNI2_1),
        'Dropdown1.8.1.1': t.get(f.inputsC.UNI2_2),
        'Dropdown2.0': t.get(f.inputsB.B8),
        'Dropdown2.1': t.get(f.inputsB.B9),
        'Dropdown3.0': t.get(f.outputsF.F2),
        'Dropdown3.1': ctc ? t.get(f.outputsF.F3) : '—',
        'Dropdown3.2': t.get(f.outputsF.F4),
        'Dropdown3.3': t.get(f.outputsF.F5),
        'Dropdown3.4': t.get(f.outputsF.F6),
        'Dropdown3.5.0.0': t.get(f.outputsF.UNI_DO1),
        'Dropdown3.5.0.1': t.get(f.outputsF.UNI_DO2),
        'Dropdown3.5.1.0': t.get(f.outputsF.UNI2_DO1),
        'Dropdown3.5.1.1': t.get(f.outputsF.UNI2_DO2),
        'Dropdown4.0': t.get(f.outputsB.B2),
        'Dropdown4.1': t.get(f.outputsB.B3),
        'Dropdown4.2': t.get(f.outputsB.UNI_AO1),
        'Dropdown4.3': t.get(f.outputsB.UNI2_AO1),
        '_Nastavil 1': { type: 'text', value: f.info.setBy },
        '_Nastavil 2': { type: 'text', value: dateFromISO(f.info.date) },
    };
};

export default pdfFT;