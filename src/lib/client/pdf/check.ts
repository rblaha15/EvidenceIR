import { nazevFirmy } from '$lib/helpers/ares';
import type { Data } from '$lib/forms/Data';
import type { Translations } from '$lib/translations';
import { endUserName } from '$lib/helpers/ir';
import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
import { defaultKontrola, type Kontrola } from '$lib/forms/Kontrola.svelte';
import type { GetPdfData } from '$lib/client/pdf';

export const cascadeDetails = (e: Raw<Data>, t: Translations) => ({
    isCascade: !!e.tc.model2,
    pumps: [
        [e.tc.model!, e.tc.cislo] as const,
        [e.tc.model2!, e.tc.cislo2] as const,
        [e.tc.model3!, e.tc.cislo3] as const,
        [e.tc.model4!, e.tc.cislo4] as const
    ]
        .filter(([m]) => m)
        .map(([m, c]) => [t.get(m), c] as const)
});

const check: GetPdfData<'RK'> = async ({ kontrolyTC, evidence: e }, t, _, { pump }) => {
    const kontroly = kontrolyTC[pump] as Record<number, Raw<Kontrola>>;
    const montazka = await nazevFirmy(e.montazka.ico);
    const { isCascade, pumps } = cascadeDetails(e, t);
    const start = {
        /*           info */ Text1:
            `${t.endCustomer}: ${endUserName(e.koncovyUzivatel)} – ${e.koncovyUzivatel.telefon} – ${e.koncovyUzivatel.email}
${t.realizationLocation}: ${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}
${t.assemblyCompany}: ${e.montazka.ico} ${montazka ? `(${montazka})` : ''}
` + pumps.map(([model, cislo], i) =>
                t.pumpDetails({ n: isCascade ? `${i + 1}` : '', model, cislo })
            ).join('; '),
        /*       poznamky */ Text141: kontroly.mapTo((_, k) => k.poznamky.poznamka).join('\n')
    };
    const veci = kontroly.mapTo((rok, kontrola) => {
        const k = dataToRawData(rawDataToData(defaultKontrola(), kontrola)) // seřazení informací
        const k2 = {
            ...k,
            kontrolniUkonyOtopneSoustavy:
                rok == 1 ? k.kontrolniUkonyOtopneSoustavy : k.kontrolniUkonyOtopneSoustavy.omit('nastavenyTlakPriUvadeniDoProvozu', 'nastavenyTlakPriUvadeniDoProvozu2'),
            kontrolaZasobnikuTv:
                rok == 1 ? k.kontrolaZasobnikuTv : k.kontrolaZasobnikuTv.omit('nastavenyTlakPriUvadeniDoProvozu'),
        }
        const array = k2.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            (Number(rok) - 1) * array.length + // widgets v každém roce
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