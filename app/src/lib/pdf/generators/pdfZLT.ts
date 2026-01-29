import ares from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/pdf/pdf';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { dateFromISO } from '$lib/helpers/date';

const pdfZLT: GetPdfData<'ZLT'> = async ({ data: { evidence: e, uvedeniTC: u, heatPumpCommissionDate: d }, pump }) => {
    const uvedeni = await ares.getNameAndAddress(e.uvedeni.ico, fetch);
    const montazka = await ares.getNameAndAddress(e.montazka.ico, fetch);
    const { model, cislo } = cascadePumps(e)[pump - 1];
    return {
        Text1: model,
        Text2: cislo,
        Text3: `${e.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
        Text4: montazka?.sidlo?.textovaAdresa ?? null,
        Text5: `${e.montazka.email ?? ''} — ${e.montazka.telefon ?? ''}		${e.montazka.zastupce ?? ''}`,
        Text6: `${e.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
        Text7: `${e.uvedeni.email ?? ''}  — ${e.uvedeni.telefon ?? ''} 		${e.uvedeni.zastupce ?? ''}`,
        Text9: montazka?.obchodniJmeno ?? null,
        Text11: e.uvedeni.zastupce,
        Text12: '',
        Text13: d ? dateFromISO(d) : '',
        Text14: null,
    };
};

export default pdfZLT;