import type { GetPdfData } from '$lib/pdf/pdf';
import { endUserName, irType, isMacAddress } from '$lib/helpers/ir';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import ares from '$lib/helpers/ares';
import { today } from '$lib/helpers/date';

const representative = (c: Raw<FormIN>['montazka' | 'uvedeni']) =>
    `${c.zastupce} – ${c.email}; ${c.telefon ?? ''}`;

const pdfRR: GetPdfData<'RR'> = async ({ data: { IN }, t }) => ({
    Text1: IN.montazka.ico,
    Text2: (await ares.getName(IN.montazka.ico, fetch)) ?? null,
    Text3: representative(IN.montazka),
    Text4: IN.uvedeni.ico,
    Text5: (await ares.getName(IN.uvedeni.ico, fetch)) ?? null,
    Text6: representative(IN.uvedeni),
    Text7: endUserName(IN.koncovyUzivatel),
    Text8: IN.koncovyUzivatel.typ == 'company'
        ? IN.koncovyUzivatel.ico : IN.koncovyUzivatel.narozeni.length == 0 ? null : IN.koncovyUzivatel.narozeni,
    Text9: `${IN.bydliste.ulice}, ${IN.bydliste.psc} ${IN.bydliste.obec}`,
    Text10: IN.mistoRealizace.ulice,
    Text11: `${IN.mistoRealizace.psc} ${IN.mistoRealizace.obec}`,
    Text12: IN.koncovyUzivatel.email,
    Text13: IN.koncovyUzivatel.telefon,
    Text14: irType(IN.ir.typ),
    Text15: isMacAddress(IN.ir.cislo) ? IN.ir.cislo.slice(0, 6)
        : IN.ir.cislo.split(' ')[0],
    Text16: isMacAddress(IN.ir.cislo) ? IN.ir.cislo.slice(6)
        : IN.ir.cislo.split(' ')[1],
    Text17: IN.ir.cisloBox,
    Text18: cascadePumps(IN)
        .map(tc => `${tc.cislo} (${tc.model})`)
        .join(', '),
    Text20: today(),
    Text22: IN.vzdalenyPristup.plati == 'endCustomer' ? t.rr.agreeWIthRRPrice : '',
});
export default pdfRR;