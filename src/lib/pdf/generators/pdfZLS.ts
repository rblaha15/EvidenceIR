import ares from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/pdf/pdf';
import { today } from '$lib/helpers/date';

const pdfZLS: GetPdfData<'ZLS'> = async ({ data: { IN, UP: { SOL: UP } }, t }) => {
    const uvedeni = await ares.getNameAndAddress(IN.uvedeni.ico, fetch);
    const montazka = await ares.getNameAndAddress(IN.montazka.ico, fetch);
    return {
        Text1: IN.sol.typ,
        Text2: IN.sol.pocet,
        Text3: `${IN.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
        Text4: montazka?.sidlo?.textovaAdresa ?? null,
        Text5: `${IN.montazka.email ?? ''} — ${IN.montazka.telefon ?? ''}\t\t${IN.montazka.zastupce ?? ''}`,
        Text6: `${IN.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
        Text7: `${IN.uvedeni.email ?? '' } — ${IN.uvedeni.telefon ?? '' }\t\t${IN.uvedeni.zastupce ?? ''}`,
        Text8: UP?.sol.tlakKapaliny || null,
        Text10: UP?.sol.tlakEnSol || null,
        Text9: montazka?.obchodniJmeno ?? null,
        Text11: IN.uvedeni.zastupce,
        Text12: null,
        Text13: null,
        Text14: today(),
    };
};

export default pdfZLS;