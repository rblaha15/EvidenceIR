// noinspection JSNonASCIINames

import { nazevFirmy } from "$lib/helpers/ares";
import { dateFromISO, todayISO } from '$lib/helpers/date';
import type { GetPdfData } from '$lib/client/pdf';
import { endUserName } from '$lib/helpers/ir';
import { range } from '$lib/extensions';

const pdfUPF: GetPdfData<'UPF'> = async ({ evidence: e, uvedeniFVE, }, t) => {
    const u = uvedeniFVE!
    const fields = [
        u.filed1, u.filed2, u.filed3, u.filed4
    ].slice(0, u.fields.count)

    return ({
/*    koncakJmeno */ Text1: endUserName(e.koncovyUzivatel),
/*      koncakTel */ Text2: e.koncovyUzivatel.telefon,
/*    koncakEmail */ Text3: e.koncovyUzivatel.email,
/*      instalace */ Text4: `${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
/*       montazka */ Text5: await nazevFirmy(e.montazka.ico) ?? '',
/*    montazkaICO */ Text6: e.montazka.ico,
/*    uvadecOsoba */ Text7: e.uvedeni.zastupce,
/*      uvadecTel */ Text8: e.uvedeni.telefon,
/*    uvadecEmail */ Text9: e.uvedeni.email,
/*          datum */ Text10: dateFromISO(u.commissioning.date ?? todayISO()),
        'Kombinované pole19': t.get(e.fve.typ!),
        'Kombinované pole20': '450',
        Text11: e.fve.pocet,
        Text12: (Number(e.fve.pocet) * 450).toLocaleString('cs'),
        ...range(4).map(i => [
            `Text${13 + i * 2}`,
            `Kombinované pole${28 + i}`,
            `Text${14 + i * 2}`,
            `Kombinované pole${1 + i}`,
        ] as const).flat().associateWith(_ => ' '),
        ...fields.map((field, i) => [
            [`Text${13 + i * 2}`, field.panelCount],
            [`Kombinované pole${28 + i}`, t.get(field.orientation)],
            [`Text${14 + i * 2}`, field.slope + ' °'],
            [`Kombinované pole${1 + i}`, t.get(field.location)?.replace('rodinném domě', 'RD')],
        ] as const).flat().toRecord(),
        Text28: e.fve.typStridace,
        Text21: e.fve.cisloStridace,
        'Kombinované pole5': e.fve.akumulaceDoBaterii ? 'Ano' : 'Ne',
        Text22: e.fve.typBaterii,
        Text23: e.fve.kapacitaBaterii,
        'Kombinované pole6': e.fve.wallbox ? 'Ano' : 'Ne',
        'Kombinované pole10': t.get(u.connection.type),
        Text24: u.connection.reservedPower,
        Text25: u.connection.mainBreakerSize,
        Text26: u.connection.yearlyEnergyConsumption,
        'Kombinované pole7': u.connection.accumulationToWater ? 'Ano' : 'Ne',
        Text27: u.connection.waterVolume,
        'Kombinované pole8': e.fve.spolupraceIR ? 'Ano' : 'Ne',
        Text29: u.connection.otherSmartControl,
        'Kombinované pole9': u.connection.energySharing ? 'Ano' : 'Ne',
    });
};
export default pdfUPF