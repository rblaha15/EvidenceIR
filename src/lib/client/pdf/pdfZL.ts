import { nazevAdresaFirmy } from '$lib/helpers/ares';
import { today } from '$lib/helpers/date';
import type { GetPdfData } from '$lib/client/pdf';
import { cascadePumps } from '$lib/forms/IN/infoIN';

const pdfZL: GetPdfData<'ZL'> = async ({ evidence: e }, t, _, { pump }) => {
    const uvedeni = await nazevAdresaFirmy(e.uvedeni.ico, fetch);
    const montazka = await nazevAdresaFirmy(e.montazka.ico, fetch);
    const { model, cislo } = cascadePumps(e, t)[pump - 1];
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
        Text13: '',
        Text14: today(),
    };
};

export default pdfZL;