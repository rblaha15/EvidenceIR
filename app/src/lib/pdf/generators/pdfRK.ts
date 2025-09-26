import { endUserName } from '$lib/helpers/ir';
import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
import { type FormRK } from '$lib/forms/RK/formRK.js';
import type { GetPdfData } from '$lib/pdf/pdf';
import defaultRK from '$lib/forms/RK/defaultRK';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import ares from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';

const calculateCompressorRuntime = ({ runtimeHoursPerYear, startupCountPerYear }: {
    runtimeHoursPerYear: string[],
    startupCountPerYear: string[],
}, y: number) => {
    const thisRuntimeHours = runtimeHoursPerYear[y - 1].toNumber() || 0;
    const thisStartupCount = startupCountPerYear[y - 1].toNumber() || 0;
    const lastRuntimeHours = runtimeHoursPerYear.slice(0, y - 1).map(parseInt).findLast(Boolean) || 0;
    const lastStartupCount = startupCountPerYear.slice(0, y - 1).map(parseInt).findLast(Boolean) || 0;
    if (thisStartupCount == lastStartupCount) return 0;
    if (thisStartupCount == 0) return 0;
    return (thisRuntimeHours - lastRuntimeHours) / (thisStartupCount - lastStartupCount) * 60;
};

const pdfRK: GetPdfData<'RK'> = async ({ data: { kontrolyTC, evidence: e, uvedeniTC: u }, t, pump }) => {
    const tk = t.rk;
    const kontroly = kontrolyTC[pump] as Record<number, Raw<FormRK>>;
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
        Text141: kontroly
            .mapValues((_, k) => k.poznamky.poznamka)
            .filterValues((_, p) => Boolean(p))
            .mapTo((r, p) => `${tk.year} ${r}: ${p}`)
            .join('\n'),
    };
    const argsHP = {
        runtimeHoursPerYear: kontroly.mapTo((_, k) => k.kontrolniUkonyRegulace.stavPocitadlaCelkovychProvoznichHodinKompresoru),
        startupCountPerYear: kontroly.mapTo((_, k) => k.kontrolniUkonyRegulace.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace),
    };
    const argsHW = {
        runtimeHoursPerYear: kontroly.mapTo((_, k) => k.kontrolniUkonyRegulace.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace),
        startupCountPerYear: kontroly.mapTo((_, k) => k.kontrolniUkonyRegulace.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace),
    };
    const veci = kontroly.mapTo((rok, kontrola) => {
        const k = dataToRawData(rawDataToData(defaultRK(), kontrola)); // seřazení informací
        k.kontrolniUkonyRegulace.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly = calculateCompressorRuntime(argsHP, rok).roundTo().toLocaleString('cs');
        k.kontrolniUkonyRegulace.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly = calculateCompressorRuntime(argsHW, rok).roundTo().toLocaleString('cs');
        const array = k.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            (Number(rok) - 1) * array.length + // widgety v každém roce
            (rok == 1 ? 0 : 3); // tlaky v roce 1

        return array.map((v, i) => [
            `Text${i + start}`, typeof v == 'boolean' ? v ? tk.yes : tk.no : v,
        ] as [`Text${number}`, string]);
    }).flat().toRecord();

    const metadata = kontroly.mapTo((rok, k) => {
        const veci = k.info;
        const start =
            1 + // Indexujeme od 1
            141 + // Text141
            (Number(rok) - 1) * 2; // 2 metadata

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
export default pdfRK;