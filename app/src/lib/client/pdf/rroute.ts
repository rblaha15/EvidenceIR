import { nazevFirmy } from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/server/pdf';
import { jmenoUzivatele, typIR } from '$lib/helpers/ir';

const rroute: GetPdfData = async ({ evidence: e }, t) => ({
    fileName: t.regulusRouteFileName,
/*   icoMontaznik */ Text1: e.montazka.ico,
/* firmaMontaznik */ Text2: (await nazevFirmy(e.montazka.ico, fetch)) ?? null,
/* jmenoMontaznik */ Text3: e.montazka.zastupce,
/*      icoUvadec */ Text4: e.uvedeni.ico,
/*    firmaUvadec */ Text5: (await nazevFirmy(e.uvedeni.ico, fetch)) ?? null,
/*    jmenoUvadec */ Text6: e.uvedeni.zastupce,
/*   jmenoPrimeni */ Text7: jmenoUzivatele(e.koncovyUzivatel),
/*       narozeni */ Text8: e.koncovyUzivatel.typ == 'company'
    ? e.koncovyUzivatel.ico : e.koncovyUzivatel.narozeni.length == 0 ? null : e.koncovyUzivatel.narozeni,
/*       bydliste */ Text9: `${e.bydliste.ulice}, ${e.bydliste.psc} ${e.bydliste.obec}`,
/*         adresa */ Text10: e.mistoRealizace.ulice,
/*        adresa2 */ Text11: `${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
/*          email */ Text12: e.koncovyUzivatel.email,
/*        telefon */ Text13: e.koncovyUzivatel.telefon,
/*          typIR */ Text14: typIR(e.ir.typ),
/*         serCis */ Text15: e.ir.typ.first?.includes('SOREL') ? '—' : e.ir.cislo.split(' ')[0],
/*        serCis2 */ Text16: e.ir.typ.first?.includes('SOREL') ? '—' : e.ir.cislo.split(' ')[1],
/*       cisloBOX */ Text17: e.ir.cisloBox,
/*        cisloTC */ Text18: [e.tc.cislo, e.tc.cislo2, e.tc.cislo3, e.tc.cislo4].filter(c => (c?.length ?? 0) != 0).join(', '),
/*       zaplatim */ Text22: e.vzdalenyPristup.plati == 'endCustomer' ? t.agreeWIthRRPrice : '',
/*          datum */ // Text20: '',
/*         podpis */ // Text21: '',
});
export default rroute;