import { endUserName } from '$lib/helpers/ir';
import { dataToRawData, rawDataToData } from '$lib/forms/Form';
import { type GetPdfData, pdfInfo } from '$lib/pdf/pdf';
import defaultRKS from '$lib/forms/RKS/defaultRKS';
import ares from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';
import type { Year } from '$lib/data';
import { range } from '$lib/extensions';

const pdfRKS: GetPdfData<'RKS'> = async ({ data, t, lastYear, addDoc, lang }) => {
    const { kontrolySOL, evidence: e, uvedeniSOL: u } = data;
    const tk = t.rks;
    const originalChecks = kontrolySOL!
    const maxYear = Math.max(...originalChecks.keys().map(Number));
    const allYears = range(1, maxYear + 1) as Year[];
    const startYear = lastYear ? lastYear + 1 : allYears.find(y => originalChecks[y])!;
    const nextStartYear = (startYear + 6) as Year;
    const years = range(startYear, nextStartYear) as Year[];
    const yearsLeft = nextStartYear <= maxYear ? range(nextStartYear, maxYear + 1) : [];
    const checks = years.associateWith(y => originalChecks[y]);
    if (yearsLeft.length) await addDoc({
        data, lang, args: pdfInfo.RKS, lastYear: nextStartYear - 1 as Year,
    });

    const montazka = await ares.getName(e.montazka.ico);
    const start = {
        Text1:
            `${t.in.endCustomer}: ${endUserName(e.koncovyUzivatel)} – ${e.koncovyUzivatel.telefon} – ${e.koncovyUzivatel.email}\n` +
            `${t.in.realizationLocation}: ${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}\n` +
            `${t.in.assemblyCompany}: ${e.montazka.ico} ${montazka ? `(${montazka})` : ''}\n` +
            tk.systemDetails({ type: e.sol.typ, count: e.sol.pocet }),
        Text30: u ? u.sol.tlakKapaliny + ' ' + t.units.bar : null,
        Text31: u ? u.sol.tlakEnSol + ' ' + t.units.bar : null,
        Text32: u ? u.sol.tlakEnTv + ' ' + t.units.bar : null,
        Text141: checks
            .mapValues((_, k) => k?.poznamky?.poznamka)
            .filterValues((_, p) => Boolean(p))
            .mapTo((r, p) => `${tk.year} ${r}: ${p}`)
            .join('\n'),
        ...range(6).associate(i => [`Text150.${i}`, `${tk.year} ${years[i]}`] as const)
            .mapEntries((k, v) => [k == 'Text150.3' ? 'Text150.3.0' : k, v]),
        ...range(6).associate(i => [`Text151.${i}`, `${years[i]}.`] as const),
    };
    const veci = checks.mapTo((rok, kontrola) => {
        if (!kontrola) return [];
        const k = dataToRawData(rawDataToData(defaultRKS(rok, []), kontrola)); // seřazení informací
        const array = k.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start = 2

        return array.map((v, i) => [
            `Text${start + i}.${rok - 1}`, typeof v == 'boolean' ? v ? tk.yes : tk.no : v,
        ] as [`Text${number}.${number}`, string]);
    }).flat().toRecord();

    const metadata = checks.mapTo((_, k, i) => {
        if (!k) return [];
        const veci = k.info;
        const start = [142, 144, 146, 148, 152, 154][i]

        return [
            [`Text${start}`, dateFromISO(veci.datum)],
            [`Text${start + 1}`, veci.osoba],
        ] as [`Text${number}`, string][];
    }).flat().toRecord();
    return {
        ...start,
        ...metadata,
        ...veci,
    }.also(console.log);
};
export default pdfRKS;