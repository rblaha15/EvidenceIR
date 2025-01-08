import { kontrolaTypes, orderArray, type KontrolaAsRecord } from '$lib/Kontrola';
import { nazevFirmy } from '$lib/helpers/ares';
import type { RawData } from '$lib/Data';
import type { Translations } from '$lib/translations';
import type { GetPdfData } from '$lib/server/pdf';

export const cascadeDetails = (e: RawData, t: Translations) => ({
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

const check: GetPdfData = async ({ kontroly, evidence: e }, t) => {
    const montazka = await nazevFirmy(e.montazka.ico);
    const { isCascade, pumps } = cascadeDetails(e, t);
    const start = {
        /*           info */ Text1:
            `${t.endCustomer}: ${e.koncovyUzivatel.jmeno} ${e.koncovyUzivatel.prijmeni} – ${e.koncovyUzivatel.telefon} – ${e.koncovyUzivatel.email}
${t.roalizationLocation}: ${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}
${t.assemblyCompany}: ${e.montazka.ico} ${montazka ? `(${montazka})` : ''}
` + pumps.map(([model, cislo], i) =>
                t.pumpDetails.parseTemplate({ n: isCascade ? `${i + 1}` : '', model, cislo })
            ).join('; '),
        /*       poznamky */ Text141: Object.values(kontroly).map((k) => k.meta.poznamky).join('\n')
    };
    const veci = Object.fromEntries(Object.entries(kontroly).flatMap(([rok, k]: [string, KontrolaAsRecord]) => {
        const veci = orderArray.filter(
            (v) =>
                kontrolaTypes[v.key1][v.key2] != 'nadpis' &&
                (rok == '1'
                    ? ['string', 'boolean', 'tlak'].includes(kontrolaTypes[v.key1][v.key2])
                    : ['string', 'boolean'].includes(kontrolaTypes[v.key1][v.key2]))
        );
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            (Number(rok) - 1) *
            veci.length + // veci v každém roce
            (rok == '1'
                ? 0
                : orderArray.filter((v) => kontrolaTypes[v.key1][v.key2] == 'tlak').length); // tlaky v roce 1

        return veci.map((v, i) => [
            `Text${i + start}`,
            kontrolaTypes[v.key1][v.key2] == 'boolean'
                ? k[v.key1][v.key2]
                    ? t.get('yes')
                    : t.get('no')
                : (k[v.key1][v.key2] ?? '')
        ]);
    }));
    const metadata = Object.fromEntries(Object.entries(kontroly).flatMap(([rok, k]) => {
        const veci = k.meta;
        const start =
            1 + // Indexujeme od 1
            141 + // Text141
            (Number(rok) - 1) * 2; // 2 metadata

        return [
            [`Text${start}`, veci.datum!],
            [`Text${start + 1}`, veci.osoba!]
        ];
    }));
    return {
        ...start,
        ...metadata,
        ...veci
    };
};
export default check;