import { endUserName } from '$lib/helpers/ir';
import { dataToRawData, rawDataToData } from '$lib/forms/Form';
import { type GetPdfData, pdfInfo } from '$lib/pdf/pdf';
import defaultRKT from '$lib/forms/RKT/defaultRKT';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import ares from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';
import type { Year } from '$lib/data';
import { range } from '$lib/extensions';

const calculateCompressorRuntime = ({ runtimeHoursPerYear, startupCountPerYear }: {
    runtimeHoursPerYear: number[],
    startupCountPerYear: number[],
}, y: number) => {
    const thisRuntimeHours = runtimeHoursPerYear[y - 1];
    const thisStartupCount = startupCountPerYear[y - 1];
    const lastRuntimeHours = runtimeHoursPerYear.slice(0, y - 1).findLast(Boolean) || 0;
    const lastStartupCount = startupCountPerYear.slice(0, y - 1).findLast(Boolean) || 0;
    if (thisStartupCount == lastStartupCount) return 0;
    if (thisStartupCount == 0) return 0;
    return (thisRuntimeHours - lastRuntimeHours) / (thisStartupCount - lastStartupCount) * 60;
};

const pdfRKT: GetPdfData<'RKT'> = async ({ data, t, pump, lastYear, addDoc, lang }) => {
    const { kontrolyTC, evidence: e, uvedeniTC: u } = data;
    const tk = t.rkt;
    const originalChecks = kontrolyTC[pump]!
    const maxYear = Math.max(...originalChecks.keys().map(Number));
    const allYears = range(1, maxYear + 1) as Year[];
    const allChecks = allYears.associateWith(y => originalChecks[y]);
    const startYear = lastYear ? lastYear + 1 : allYears.find(y => originalChecks[y])!;
    const nextStartYear = (startYear + 4) as Year;
    const years = range(startYear, nextStartYear) as Year[];
    const yearsLeft = nextStartYear <= maxYear ? range(nextStartYear, maxYear + 1) : [];
    const checks = years.associateWith(y => originalChecks[y]);
    if (yearsLeft.length) await addDoc({
        data, lang, args: pdfInfo.RKT, pump, lastYear: nextStartYear - 1 as Year,
    });
    await addDoc({
        lang: 'cs',
        args: pdfInfo.RS,
        data: {},
    })

    const montazka = await ares.getName(e.montazka.ico);
    const pumpInfo = cascadePumps(e)[pump - 1];
    const start = {
        Text1:
            `${t.in.endCustomer}: ${endUserName(e.koncovyUzivatel)} – ${e.koncovyUzivatel.telefon} – ${e.koncovyUzivatel.email}\n` +
            `${t.in.realizationLocation}: ${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}\n` +
            `${t.in.assemblyCompany}: ${e.montazka.ico} ${montazka ? `(${montazka})` : ''}\n` +
            tk.pumpDetails(pumpInfo),
        Text36: u?.os?.tlakEnOs ?? null,
        Text37: u?.os?.tlakOs ?? null,
        Text38: u?.os?.tlakEnTv ?? null,
        Text141: checks
            .mapValues((_, k) => k?.poznamky?.poznamka)
            .filterValues((_, p) => Boolean(p))
            .mapTo((r, p) => `${tk.year} ${r}: ${p}`)
            .join('\n'),
        ...range(4).associate(i => [`Text150.${i}`, `${tk.year} ${years[i]}`] as const),
        ...range(4).associate(i => [`Text151.${i}`, `${years[i]}.`] as const),
    };
    const argsHP = {
        runtimeHoursPerYear: allChecks.mapTo((_, k) => k?.kontrolniUkonyRegulace?.stavPocitadlaCelkovychProvoznichHodinKompresoru?.toNumber() || 0),
        startupCountPerYear: allChecks.mapTo((_, k) => k?.kontrolniUkonyRegulace?.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace?.toNumber() || 0),
    };
    const argsHW = {
        runtimeHoursPerYear: allChecks.mapTo((_, k) => k?.kontrolniUkonyRegulace?.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace?.toNumber() || 0),
        startupCountPerYear: allChecks.mapTo((_, k) => k?.kontrolniUkonyRegulace?.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace?.toNumber() || 0),
    };
    const veci = checks.mapTo((rok, kontrola, i) => {
        if (!kontrola) return [];
        const k = dataToRawData(rawDataToData(defaultRKT(rok, []), kontrola)); // seřazení informací
        k.kontrolniUkonyRegulace.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly = calculateCompressorRuntime(argsHP, rok).roundTo().toLocaleString('cs');
        k.kontrolniUkonyRegulace.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly = calculateCompressorRuntime(argsHW, rok).roundTo().toLocaleString('cs');
        const array = k.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            i * array.length + // widgety v každém roce
            (i == 0 ? 0 : 3); // tlaky v roce 1

        return array.map((v, i) => [
            `Text${i + start}`, typeof v == 'boolean' ? v ? tk.yes : tk.no : v,
        ] as [`Text${number}`, string]);
    }).flat().toRecord();

    const metadata = checks.mapTo((_, k, i) => {
        if (!k) return [];
        const veci = k.info;
        const start =
            1 + // Indexujeme od 1
            141 + // Text141
            i * 2; // 2 metadata

        return [
            [`Text${start}`, dateFromISO(veci.datum)],
            [`Text${start + 1}`, veci.osoba],
        ] as [`Text${number}`, string][];
    }).flat().toRecord();
    return {
        ...start,
        ...metadata,
        ...veci,
    };
};
export default pdfRKT;