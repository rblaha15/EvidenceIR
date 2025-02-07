import { nazevFirmy } from '$lib/helpers/ares';
import type { Data } from '$lib/forms/Data';
import type { Translations } from '$lib/translations';
import type { GetPdfData } from '$lib/server/pdf';
import { jmenoUzivatele } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import type { Kontrola } from '$lib/forms/Kontrola.svelte';

export const cascadeDetails = (e: Raw<Data>, t: Translations) => ({
    isCascade: (e.tc.model2 ?? 'noPump') != 'noPump',
    pumps: [
        [e.tc.model!, e.tc.cislo] as const,
        [e.tc.model2!, e.tc.cislo2] as const,
        [e.tc.model3!, e.tc.cislo3] as const,
        [e.tc.model4!, e.tc.cislo4] as const
    ]
        .filter(([m]) => (m ?? 'noPump') != 'noPump')
        .map(([m, c]) => [t.get(m), c] as const)
});

const check: GetPdfData = async ({ kontroly: k, evidence: e }, t) => {
    const kontroly = k as Record<number, Raw<Kontrola>>;
    const montazka = await nazevFirmy(e.montazka.ico);
    const { isCascade, pumps } = cascadeDetails(e, t);
    const start = {
        fileName: t.yearlyCheckFileName,
        /*           info */ Text1:
            `${t.endCustomer}: ${jmenoUzivatele(e.koncovyUzivatel)} – ${e.koncovyUzivatel.telefon} – ${e.koncovyUzivatel.email}
${t.realizationLocation}: ${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}
${t.assemblyCompany}: ${e.montazka.ico} ${montazka ? `(${montazka})` : ''}
` + pumps.map(([model, cislo], i) =>
                t.pumpDetails.parseTemplate({ n: isCascade ? `${i + 1}` : '', model, cislo })
            ).join('; '),
        /*       poznamky */ Text141: kontroly.mapTo((_, k) => k.poznamky.poznamka).join('\n')
    };
    const veci = kontroly.mapTo((rok, k) => {
        const array = k.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            (Number(rok) - 1) * array.length + // veci v každém roce
            (rok == 1 ? 0 : 3); // tlaky v roce 1

        return array.map((v, i) => [
            `Text${i + start}`,
            typeof v == 'boolean'
                ? v ? t.yes : t.no
                : v
        ] as [`Text${number}`, string]);
    }).flat().toRecord();
    const metadata = kontroly.mapTo((rok, k) => {
        const veci = k.info;
        const start =
            1 + // Indexujeme od 1
            141 + // Text141
            (Number(rok) - 1) * 2; // 2 metadata

        return [
            [`Text${start}`, veci.datum],
            [`Text${start + 1}`, veci.osoba]
        ] as [`Text${number}`, string][];
    }).flat().toRecord();
    return {
        ...start,
        ...metadata,
        ...veci
    };
};
export default check;