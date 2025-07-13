import { nazevFirmy } from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/client/pdf';
import { endUserName, irType } from '$lib/helpers/ir';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import { TCNumbers } from '$lib/forms/IN/defaultIN';
import { cascadePumps } from '$lib/forms/IN/infoIN';

const representative = (c: Raw<FormIN>['montazka' | 'uvedeni']) =>
    `${c.zastupce} – ${c.email}; ${c.telefon ?? ''}`;

const pdfRR: GetPdfData<'RR'> = async ({ evidence: e }, t) => ({
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
/*        cisloTC */ Text18: cascadePumps(e, t)
        .map(tc => `${tc.cislo} (${tc.model})`)
        .join(', '),
/*       zaplatim */ Text22: e.vzdalenyPristup.plati == 'endCustomer' ? t.agreeWIthRRPrice : '',
/*          datum */ // Text20: '',
/*         podpis */ // Text21: '',
});
export default pdfRR;