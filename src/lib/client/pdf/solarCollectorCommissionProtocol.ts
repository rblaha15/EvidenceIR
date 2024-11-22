import { nazevFirmy } from '$lib/helpers/ares';
import { p } from '$lib/Vec.svelte';
import { type PdfArgs } from '$lib/client/pdf';
import { dateFromISO } from '$lib/helpers/date';

export default {
    formName: 'solarCollectorCommissionProtocol',
    supportedLanguages: ['cs'],
    title: p`Protokol o uvedení solárního systému do trvalého provozu`,
    fileName: p`Protokol uvedení SOL.pdf`,
    getFormData: async ({ evidence: e, uvedeniSOL }, t) => {
        const u = uvedeniSOL!;

        return {
            /*    koncakJmeno */ Text1: `${e.koncovyUzivatel.jmeno} ${e.koncovyUzivatel.prijmeni}`,
            /*      koncakTel */ Text2: e.koncovyUzivatel.telefon,
            /*    koncakEmail */ Text3: e.koncovyUzivatel.email,
            /*      instalace */ Text4: `${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
            /*       montazka */ Text5: (await nazevFirmy(e.montazka.ico)) ?? '',
            /*    montazkaICO */ Text6: e.montazka.ico,
            /*    uvadecOsoba */ Text7: e.uvedeni.zastupce,
            /*      uvadecTel */ Text8: e.uvedeni.phone,
            /*    uvadecEmail */ Text9: e.uvedeni.email,
            /*          datum */ Text10: dateFromISO(u.uvadeni.date),
            /*                */ Text11: e.sol.type,
            /*                */ Text12: e.sol.count,
            /*                */ Text13: u.sol.orientace,
            /*                */ Text14: u.sol.sklon,
            /*                */ Text15: u.sol.zasobnik,
            /*                */ Text16: u.sol.akumulacka,
            /*                */ Text17: u.sol.vymenik,
            /*                */ Text18: u.sol.solRegulator,
            /*                */ Text19: u.sol.cerpadloaSkupina,
            /*                */ Text20: u.sol.expanznkaSolarni ? t.yes : t.no,
            /*                */ Text21: u.sol.objem,
            /*                */ Text22: t.get(u.sol.ovzdusneni),
            /*                */ Text23: t.get(u.sol.teplonosnaKapalina),
            /*                */ Text24: u.sol.potrubi,
            /*                */ Text25: u.sol.prumer,
            /*                */ Text26: u.sol.delkyPotrubi,
            /*                */ Text27: u.sol.izolacePotrubi ? t.yes : t.no,
            /*                */ Text28: u.uvadeni.tlakDoba ? t.yes : t.no,
            /*                */ Text29: u.uvadeni.tlakTlak ? t.yes : t.no,
            /*                */ Text30: u.uvadeni.tlakUbytek ? t.yes : t.no,
            /*                */ Text31: u.uvadeni.ovzdusneni ? t.yes : t.no,
            /*                */ Text32: u.uvadeni.blesk ? t.yes : t.no,
            /*                */ Text33: u.uvadeni.podminky ? t.yes : t.no,
            /*                */ Text34: u.uvadeni.regulator ? t.yes : t.no,
            /*                */ Text35: u.uvadeni.vlastnik ? t.yes : t.no,
        };
    }
} as PdfArgs;