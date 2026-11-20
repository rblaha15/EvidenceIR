// noinspection JSNonASCIINames,NonAsciiCharacters

import type { GetPdfData } from '$lib/pdf/pdf';
import { dateFromISO } from '$lib/helpers/date';
import { endUserName, irType } from '$lib/helpers/ir';

const pdfFT: GetPdfData<'FT'> = async ({ data: { FT, IN } }) => {
    if (!FT) throw new Error("FT not filled");
    const ctc = IN.ir.typ.second == 'CTC';
    const f = (v: { chosen: string | null, text: string }) => v.text || v.chosen || '—'
    return {
        _typ: { type: 'text', value: irType(IN.ir.typ) },
        _uživatel: { type: 'text', value: endUserName(IN.koncovyUzivatel) },
        _místo: { type: 'text', value: `${IN.mistoRealizace.ulice}, ${IN.mistoRealizace.psc} ${IN.mistoRealizace.obec}` },
        'Dropdown1.0': f(FT.inputs.C2),
        'Dropdown1.1': f(FT.inputs.C3),
        'Dropdown1.2': f(FT.inputs.C4),
        'Dropdown1.3': f(FT.inputs.C5),
        'Dropdown1.4': f(FT.inputs.C6),
        'Dropdown1.5': f(FT.inputs.C7),
        'Dropdown1.6': ctc ? f(FT.inputs.C8) : '—',
        'Dropdown1.7': ctc ? f(FT.inputs.C9) : '—',
        'Dropdown1.8.0.0': f(FT.inputs.UNI_1),
        'Dropdown1.8.0.1': f(FT.inputs.UNI_2),
        'Dropdown1.8.1.0': f(FT.inputs.UNI2_1),
        'Dropdown1.8.1.1': f(FT.inputs.UNI2_2),
        'Dropdown2.0': f(FT.inputs.B8),
        'Dropdown2.1': f(FT.inputs.B9),
        'Dropdown3.0': f(FT.outputs.F2),
        'Dropdown3.1': ctc ? f(FT.outputs.F3) : '—',
        'Dropdown3.2': f(FT.outputs.F4),
        'Dropdown3.3': f(FT.outputs.F5),
        'Dropdown3.4': f(FT.outputs.F6),
        'Dropdown3.5.0.0': f(FT.outputs.UNI_DO1),
        'Dropdown3.5.0.1': f(FT.outputs.UNI_DO2),
        'Dropdown3.5.1.0': f(FT.outputs.UNI2_DO1),
        'Dropdown3.5.1.1': f(FT.outputs.UNI2_DO2),
        'Dropdown4.0': f(FT.outputs.B2),
        'Dropdown4.1': f(FT.outputs.B3),
        'Dropdown4.2': f(FT.outputs.UNI_AO1),
        'Dropdown4.3': f(FT.outputs.UNI2_AO1),
        '_Nastavil 1': { type: 'text', value: FT.info.setBy },
        '_Nastavil 2': { type: 'text', value: dateFromISO(FT.info.date) },
    };
};

export default pdfFT;