import { dateFromISO } from '$lib/helpers/date';
import type { GetPdfData } from '$lib/pdf/pdf';
import { endUserName } from '$lib/helpers/ir';
import { get } from '$lib/translations';
import ares from '$lib/helpers/ares';

const pdfUPS: GetPdfData<'UPS'> = async ({ data: { IN, UP: { SOL: UP, dateSOL } }, t }) => {
    if (!UP) throw new Error("UP SOL not filled")
    const tu = t.sol

    return {
/*    koncakJmeno */ Text1: endUserName(IN.koncovyUzivatel),
/*      koncakTel */ Text2: IN.koncovyUzivatel.telefon,
/*    koncakEmail */ Text3: IN.koncovyUzivatel.email,
/*      instalace */ Text4: `${IN.mistoRealizace.ulice}, ${IN.mistoRealizace.psc} ${IN.mistoRealizace.obec}`,
/*       montazka */ Text5: (await ares.getName(IN.montazka.ico)) ?? '',
/*    montazkaICO */ Text6: IN.montazka.ico,
/*    uvadecOsoba */ Text7: IN.uvedeni.zastupce,
/*      uvadecTel */ Text8: IN.uvedeni.telefon,
/*    uvadecEmail */ Text9: IN.uvedeni.email,
/*          datum */ Text10: dateFromISO(dateSOL!),
/*                */ Text11: IN.sol.typ,
/*                */ Text12: IN.sol.pocet,
/*                */ Text13: UP.sol.orientace,
/*                */ Text14: UP.sol.sklon,
/*                */ Text15: UP.sol.zasobnik,
/*                */ Text16: UP.sol.akumulacka,
/*                */ Text17: UP.sol.vymenik,
/*                */ Text18: UP.sol.solRegulator,
/*                */ Text19: UP.sol.cerpadloaSkupina,
/*                */ Text20: UP.sol.expanznkaSolarni ? tu.yes : tu.no,
/*                */ Text21: UP.sol.objem,
/*                */ Text22: get(tu, UP.sol.ovzdusneni),
/*                */ Text23: get(tu, UP.sol.teplonosnaKapalina),
/*                */ Text24: UP.sol.potrubi,
/*                */ Text25: UP.sol.prumer,
/*                */ Text26: UP.sol.delkyPotrubi,
/*                */ Text27: UP.sol.izolacePotrubi ? tu.yes : tu.no,
/*                */ Text28: UP.uvadeni.tlakDoba ? tu.yes : tu.no,
/*                */ Text29: UP.uvadeni.tlakTlak ? tu.yes : tu.no,
/*                */ Text30: UP.uvadeni.tlakUbytek ? tu.yes : tu.no,
/*                */ Text31: UP.uvadeni.ovzdusneni ? tu.yes : tu.no,
/*                */ Text32: UP.uvadeni.blesk ? tu.yes : tu.no,
/*                */ Text33: UP.uvadeni.podminky ? tu.yes : tu.no,
/*                */ Text34: UP.uvadeni.regulator ? tu.yes : tu.no,
/*                */ Text35: UP.uvadeni.vlastnik ? tu.yes : tu.no,
    };
};
export default pdfUPS
