// noinspection JSNonASCIINames

import { dateFromISO, dayISO } from '$lib/helpers/date';
import type { GetPdfData } from '$lib/pdf/pdf';
import { endUserName } from '$lib/helpers/ir';
import { range } from '$lib/extensions';
import { get } from '$lib/translations';
import ares from '$lib/helpers/ares';

const pdfUPF: GetPdfData<'UPF'> = async ({ data: { IN, UP: { FVE: UP }, }, t, lang }) => {
    if (!UP) throw new Error("UP FVE not filled")
    const tu = t.fve
    const fields = [
        UP.filed1, UP.filed2, UP.filed3, UP.filed4
    ].slice(0, UP.fields.count)

    return ({
/*    koncakJmeno */ Text1: endUserName(IN.koncovyUzivatel),
/*      koncakTel */ Text2: IN.koncovyUzivatel.telefon,
/*    koncakEmail */ Text3: IN.koncovyUzivatel.email,
/*      instalace */ Text4: `${IN.mistoRealizace.ulice}, ${IN.mistoRealizace.psc} ${IN.mistoRealizace.obec}`,
/*       montazka */ Text5: await ares.getName(IN.montazka.ico) ?? '',
/*    montazkaICO */ Text6: IN.montazka.ico,
/*    uvadecOsoba */ Text7: IN.uvedeni.zastupce,
/*      uvadecTel */ Text8: IN.uvedeni.telefon,
/*    uvadecEmail */ Text9: IN.uvedeni.email,
/*          datum */ Text10: dateFromISO(UP.commissioning.date ?? dayISO()),
        'Kombinované pole19': get(t.in.fve, IN.fve.typ!),
        'Kombinované pole20': '450',
        Text11: IN.fve.pocet,
        Text12: (Number(IN.fve.pocet) * 450).toLocaleString(lang),
        ...range(4).map(i => [
            `Text${13 + i * 2}`,
            `Kombinované pole${28 + i}`,
            `Text${14 + i * 2}`,
            `Kombinované pole${1 + i}`,
        ] as const).flat().associateWith(_ => ' '),
        ...fields.map((field, i) => [
            [`Text${13 + i * 2}`, field.panelCount],
            [`Kombinované pole${28 + i}`, get(tu, field.orientation)],
            [`Text${14 + i * 2}`, field.slope + ' °'],
            [`Kombinované pole${1 + i}`, get({ ...tu, onFamilyHouse: tu.onFamilyHouseShort }, field.location)],
        ] as const).flat().toRecord(),
        Text28: IN.fve.typStridace,
        Text21: IN.fve.cisloStridace,
        'Kombinované pole5': IN.fve.akumulaceDoBaterii ? tu.yes : tu.no,
        Text22: IN.fve.typBaterii,
        Text23: IN.fve.kapacitaBaterii,
        'Kombinované pole6': IN.fve.wallbox ? tu.yes : tu.no,
        'Kombinované pole10': get(tu, UP.connection.type),
        Text24: UP.connection.reservedPower,
        Text25: UP.connection.mainBreakerSize,
        Text26: UP.connection.yearlyEnergyConsumption,
        'Kombinované pole7': UP.connection.accumulationToWater ? tu.yes : tu.no,
        Text27: UP.connection.waterVolume,
        'Kombinované pole8': IN.fve.spolupraceIR ? tu.yes : tu.no,
        Text29: UP.connection.otherSmartControl,
        'Kombinované pole9': UP.connection.energySharing ? tu.yes : tu.no,
    });
};
export default pdfUPF