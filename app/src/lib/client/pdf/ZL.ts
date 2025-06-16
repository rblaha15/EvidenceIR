import { nazevAdresaFirmy } from '$lib/helpers/ares';
import { today } from '$lib/helpers/date';
import type { GetPdfData } from '$lib/client/pdf';

const ZL: GetPdfData<'ZL'> = async ({ evidence: e }, t, _, { pump }) => {
    const uvedeni = await nazevAdresaFirmy(e.uvedeni.ico, fetch);
    const montazka = await nazevAdresaFirmy(e.montazka.ico, fetch);
    const cislo = [e.tc.cislo, e.tc.cislo2, e.tc.cislo3, e.tc.cislo4][pump];
    const model = [e.tc.model, e.tc.model2, e.tc.model3, e.tc.model4][pump];
    return {
/*        tcModel */ Text1: t.get(model),
/*        tcCislo */ Text2: cislo,
/*       montazka */ Text3: `${e.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
/* adresaMontazka */ Text4: montazka?.sidlo?.textovaAdresa ?? null,
/* detailMontazka */ Text5: `${e.montazka.email ?? ''} — ${e.montazka.telefon ?? ''}		${e.montazka.zastupce ?? ''}`,
/*        uvedeni */ Text6: `${e.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
/*  detailUvedeni */ Text7: `${e.uvedeni.email ?? ''}  — ${e.uvedeni.telefon ?? ''} 		${e.uvedeni.zastupce ?? ''}`,
/*       montazka */ Text9: montazka?.obchodniJmeno ?? null,
/*  clovekUvedeni */ Text11: e.uvedeni.zastupce,
/*  razitkoProdej */ Text12: '',
/* razitkoUvedeni */ Text13: '',
/*          datum */ Text14: today(),
    };
};

export default ZL;