import { nazevFirmy } from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/client/pdfGeneration';
import { endUserName, irType } from '$lib/helpers/ir';
import type { Data } from '$lib/forms/Data';
import type { Raw } from '$lib/forms/Form';

const representative = (c: Raw<Data>['montazka' | 'uvedeni']) =>
    `${c.zastupce} – ${c.email}; ${c.telefon ?? ''}`;

const rroute: GetPdfData = async ({ evidence: e }, t) => ({
/*   icoMontaznik */ Text1: e.montazka.ico,
/* firmaMontaznik */ Text2: (await nazevFirmy(e.montazka.ico, fetch)) ?? null,
/* jmenoMontaznik */ Text3: representative(e.montazka),
/*      icoUvadec */ Text4: e.uvedeni.ico,
/*    firmaUvadec */ Text5: (await nazevFirmy(e.uvedeni.ico, fetch)) ?? null,
/*    jmenoUvadec */ Text6: representative(e.uvedeni),
/*   jmenoPrimeni */ Text7: endUserName(e.koncovyUzivatel),
/*       narozeni */ Text8: e.koncovyUzivatel.typ == 'company'
        ? e.koncovyUzivatel.ico : e.koncovyUzivatel.narozeni.length == 0 ? null : e.koncovyUzivatel.narozeni,
/*       bydliste */ Text9: `${e.bydliste.ulice}, ${e.bydliste.psc} ${e.bydliste.obec}`,
/*         adresa */ Text10: e.mistoRealizace.ulice,
/*        adresa2 */ Text11: `${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
/*          email */ Text12: e.koncovyUzivatel.email,
/*        telefon */ Text13: e.koncovyUzivatel.telefon,
/*          irType */ Text14: irType(e.ir.typ),
/*         serCis */ Text15: e.ir.typ.first?.includes('SOREL') ? '—' : e.ir.cislo.split(' ')[0],
/*        serCis2 */ Text16: e.ir.typ.first?.includes('SOREL') ? '—' : e.ir.cislo.split(' ')[1],
/*       cisloBOX */ Text17: e.ir.cisloBox,
/*        cisloTC */ Text18: (['', '2', '3', '4'] as const)
        .map(n => [e.tc[`model${n}`], e.tc[`cislo${n}`]] as const)
        .filter(([m, c]) => (c?.length ?? 0) != 0 && m != null)
        .map(([m, c]) => `${c} (${t.get(m)})`)
        .join(', '),
/*       zaplatim */ Text22: e.vzdalenyPristup.plati == 'endCustomer' ? t.agreeWIthRRPrice : '',
/*          datum */ // Text20: '',
/*         podpis */ // Text21: '',
});
export default rroute;