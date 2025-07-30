import { nazevFirmy } from '$lib/helpers/ares';
import type { GetPdfData } from '$lib/client/pdf';
import { endUserName, irType, isMacAddress } from '$lib/helpers/ir';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { p } from '$lib/translations';

const representative = (c: Raw<FormIN>['montazka' | 'uvedeni']) =>
    `${c.zastupce} – ${c.email}; ${c.telefon ?? ''}`;

const pdfRR: GetPdfData<'RR'> = async ({ data: { evidence: e }, t }) => ({
    Text1: e.montazka.ico,
    Text2: (await nazevFirmy(e.montazka.ico, fetch)) ?? null,
    Text3: representative(e.montazka),
    Text4: e.uvedeni.ico,
    Text5: (await nazevFirmy(e.uvedeni.ico, fetch)) ?? null,
    Text6: representative(e.uvedeni),
    Text7: endUserName(e.koncovyUzivatel),
    Text8: e.koncovyUzivatel.typ == 'company'
        ? e.koncovyUzivatel.ico : e.koncovyUzivatel.narozeni.length == 0 ? null : e.koncovyUzivatel.narozeni,
    Text9: `${e.bydliste.ulice}, ${e.bydliste.psc} ${e.bydliste.obec}`,
    Text10: e.mistoRealizace.ulice,
    Text11: `${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
    Text12: e.koncovyUzivatel.email,
    Text13: e.koncovyUzivatel.telefon,
    Text14: irType(e.ir.typ),
    Text15: e.ir.typ.first == p('SOREL') ? '—'
        : isMacAddress(e.ir.cislo) ? e.ir.cislo.slice(0, 6)
            : e.ir.cislo.split(' ')[0],
    Text16: e.ir.typ.first == p('SOREL') ? '—'
        : isMacAddress(e.ir.cislo) ? e.ir.cislo.slice(6)
            : e.ir.cislo.split(' ')[1],
    Text17: e.ir.cisloBox,
    Text18: cascadePumps(e, t)
        .map(tc => `${tc.cislo} (${tc.model})`)
        .join(', '),
    Text22: e.vzdalenyPristup.plati == 'endCustomer' ? t.agreeWIthRRPrice : '',
});
export default pdfRR;