import ares from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/pdf/pdf';
import { today } from '$lib/helpers/date';

const pdfZLS: GetPdfData<'ZLS'> = async ({ data: { evidence: e, uvedeniSOL: u }, t }) => {
    const uvedeni = await ares.getNameAndAddress(e.uvedeni.ico, fetch);
    const montazka = await ares.getNameAndAddress(e.montazka.ico, fetch);
    return {
        Text1: e.sol.typ,
        Text2: e.sol.pocet,
        Text3: `${e.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
        Text4: montazka?.sidlo?.textovaAdresa ?? null,
        Text5: `${e.montazka.email ?? ''} — ${e.montazka.telefon ?? ''}\t\t${e.montazka.zastupce ?? ''}`,
        Text6: `${e.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
        Text7: `${e.uvedeni.email ?? '' } — ${e.uvedeni.telefon ?? '' }\t\t${e.uvedeni.zastupce ?? ''}`,
        Text8: u?.sol.tlakKapaliny || null,
        Text10: u?.sol.tlakEnSol || null,
        Text9: montazka?.obchodniJmeno ?? null,
        Text11: e.uvedeni.zastupce,
        Text12: null,
        Text13: null,
        Text14: today(),
    };
};

export default pdfZLS;