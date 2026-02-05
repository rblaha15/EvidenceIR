import ares from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/pdf/pdf';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { dateFromISO } from '$lib/helpers/date';

const pdfZLT: GetPdfData<'ZLT'> = async ({ data: { IN, UP: { dateTC } }, pump }) => {
    const uvedeni = await ares.getNameAndAddress(IN.uvedeni.ico, fetch);
    const montazka = await ares.getNameAndAddress(IN.montazka.ico, fetch);
    const { model, cislo } = cascadePumps(IN)[pump - 1];
    return {
        Text1: model,
        Text2: cislo,
        Text3: `${IN.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
        Text4: montazka?.sidlo?.textovaAdresa ?? null,
        Text5: `${IN.montazka.email ?? ''} — ${IN.montazka.telefon ?? ''}		${IN.montazka.zastupce ?? ''}`,
        Text6: `${IN.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
        Text7: `${IN.uvedeni.email ?? ''}  — ${IN.uvedeni.telefon ?? ''} 		${IN.uvedeni.zastupce ?? ''}`,
        Text9: montazka?.obchodniJmeno ?? null,
        Text11: IN.uvedeni.zastupce,
        Text12: '',
        Text13: dateTC ? dateFromISO(dateTC) : '',
        Text14: null,
    };
};

export default pdfZLT;