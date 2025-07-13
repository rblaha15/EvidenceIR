import { nazevFirmy } from '$lib/helpers/ares';
import { endUserName } from '$lib/helpers/ir';
import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
import { type FormRK } from '$lib/forms/RK/formRK.js';
import type { GetPdfData } from '$lib/client/pdf';
import defaultRK from '$lib/forms/RK/defaultRK';
import { cascadePumps } from '$lib/forms/IN/infoIN';

const pdfRK: GetPdfData<'RK'> = async ({ kontrolyTC, evidence: e, uvedeniTC: u }, t, _, { pump }) => {
    console.log(kontrolyTC);
    const kontroly = kontrolyTC[pump] as Record<number, Raw<FormRK>>;
    const montazka = await nazevFirmy(e.montazka.ico);
    const pumps = cascadePumps(e, t);
    const start = {
        Text1:
            `${t.endCustomer}: ${endUserName(e.koncovyUzivatel)} – ${e.koncovyUzivatel.telefon} – ${e.koncovyUzivatel.email}\n` +
            `${t.realizationLocation}: ${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}\n` +
            `${t.assemblyCompany}: ${e.montazka.ico} ${montazka ? `(${montazka})` : ''}\n` +
            pumps.map(t.pumpDetails).join('; '),
        Text36: u?.os?.tlakEnOs ?? null,
        Text37: u?.os?.tlakOs ?? null,
        Text38: u?.os?.tlakEnTv ?? null,
        Text141: kontroly
            .mapValues((_, k) => k.poznamky.poznamka)
            .filterValues((_, p) => Boolean(p))
            .mapTo((r, p) => `Rok ${r}: ${p}`)
            .join('\n'),
    };
    const veci = kontroly.mapTo((rok, kontrola) => {
        const k = dataToRawData(rawDataToData(defaultRK(), kontrola)); // seřazení informací
        const array = k.omit('info', 'poznamky').getValues().flatMap(obj => obj.getValues());
        const start =
            1 + // Indexujeme od 1
            1 + // Text1
            (Number(rok) - 1) * array.length + // widgety v každém roce
            (rok == 1 ? 0 : 3); // tlaky v roce 1

        return array.map((v, i) => [
            `Text${i + start}`, typeof v == 'boolean' ? v ? t.yes : t.no : v,
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