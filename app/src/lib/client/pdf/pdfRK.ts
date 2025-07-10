import { nazevFirmy } from '$lib/helpers/ares';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Translations } from '$lib/translations';
import { endUserName } from '$lib/helpers/ir';
import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
import { type FormRK } from '$lib/forms/RK/formRK.js';
import type { GetPdfData } from '$lib/client/pdf';
import defaultRK from '$lib/forms/RK/defaultRK';

export const cascadeDetails = (e: Raw<FormIN>, t: Translations) => ({
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

const pdfRK: GetPdfData<'RK'> = async ({ kontrolyTC, evidence: e, uvedeniTC: u }, t, _, { pump }) => {
    console.log(kontrolyTC)
    const kontroly = kontrolyTC[pump] as Record<number, Raw<FormRK>>;
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
        /*           tlak */ Text36: u?.os?.tlakEnOs ?? null,
        /*           tlak */ Text37: u?.os?.tlakOs ?? null,
        /*           tlak */ Text38: u?.os?.tlakEnTv ?? null,
        /*       poznamky */ Text141: kontroly
            .mapValues((_, k) => k.poznamky.poznamka)
            .filterValues((_, p) => Boolean(p))
            .mapTo((r, p) => `Rok ${r}: ${p}`)
            .join('\n'),
    };
    const veci = kontroly.mapTo((rok, kontrola) => {
        const k = dataToRawData(rawDataToData(defaultRK(), kontrola)) // seřazení informací
        const array = k.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            (Number(rok) - 1) * array.length + // widgety v každém roce
            (rok == 1 ? 0 : 3); // tlaky v roce 1

        return array.map((v, i) => [
            `Text${i + start}`, typeof v == 'boolean' ? v ? t.yes : t.no : v
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
        ...veci,
    };
};
export default pdfRK;