import { nazevFirmy } from "$lib/helpers/ares";
import { p } from "$lib/Vec";
import { type PdfArgs } from "$lib/client/pdf";
import { nazevIR } from "$lib/Data";
import { today } from "$lib/helpers/date";

export default {
    formName: 'commissionProtocol',
    supportedLanguages: ['cs'],
    title: p`Protokol o uvedení tepelného čerpadla do trvalého provozu`,
    fileName: p`Protokol uvedení TČ.pdf`,
    getFormData: async ({ evidence: e, uvedeni, }, t) => {
        const u = uvedeni!

        return ({
        /*    koncakJmeno */ Text1: `${e.koncovyUzivatel.jmeno} ${e.koncovyUzivatel.prijmeni}`,
        /*      koncakTel */ Text2: e.koncovyUzivatel.telefon,
        /*    koncakEmail */ Text3: e.koncovyUzivatel.email,
        /*      instalace */ Text4: `${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
        /*       montazka */ Text5: await nazevFirmy(e.montazka.ico) ?? '',
        /*    montazkaICO */ Text6: e.montazka.ico,
        /*    uvadecOsoba */ Text7: e.uvedeni.zastupce,
        /*      uvadecTel */ Text8: '',
        /*    uvadecEmail */ Text9: e.uvedeni.email,
        /*          datum */ Text10: today(),
        /*                */ Text11: t.get(e.tc.model!),
        /*                */ Text12: e.tc.cislo,
        /*                */ Text13: e.ir.typ.first!.includes('BOX') ? t.get(e.ir.typ.first!).slice(3) : '—',
        /*                */ Text14: e.ir.typ.first!.includes('BOX') ? e.ir.cisloBOX : '—',
        /*                */ Text15: u.tc.jisticTC ? 'vyhovuje' : 'nevyhovuje',
        /*                */ Text16: u.tc.jisticVJ ? 'vyhovuje' : 'nevyhovuje',
        /*                */ Text17: u.tc.vzdalenostZdi ? 'vyhovuje' : 'nevyhovuje',
        /*                */ Text18: u.os.tcTv ? `Doplňkový zdroj přípravy teplé vody` : `Hlavní a doplňkový zdroj přípravy teplé vody`,
        /*                */ Text19: e.tc.typ == 'airToWater' ? u.tc.kondenzator ? 'ano' : 'ne' : '—',
        /*                */ Text20: u.tc.filtr ? 'ano' : 'ne',
        /*                */ Text21: u.nadrze.akumulacka,
        /*                */ Text22: u.nadrze.zasobnik,
        /*                */ Text23: t.get(u.os.tvori!),
        /*                */ Text24: u.os.dzTop ? 'ano' : 'ne',
        /*                */ Text25: u.os.dzTop ? u.os.typDzTop : '—',
        /*                */ Text26: u.os.tcTv ? 'ano' : 'ne',
        /*                */ Text27: u.os.zTv,
        /*                */ Text28: u.os.objemEnOs ? 'vyhovuje' : 'nevyhovuje',
        /*                */ Text29: u.os.bazenTc ? 'ano' : 'ne',
        /*                */ Text30: nazevIR(t, e.ir.typ),
        /*                */ Text31: e.ir.cislo,
        /*                */ Text32: t.get(u.reg.pripojeniKInternetu!),
        /*                */ Text33: u.reg.pospojeni ? 'ano' : 'ne',
        /*                */ Text34: u.reg.spotrebice ? 'ano' : 'ne',
        /*                */ Text35: e.tc.typ == 'airToWater' ? u.reg.zalZdroj ? 'ano' : 'ne' : '—',
        /*                */ Text36: e.tc.typ == 'groundToWater' ? t.get(u.primar.typ!) : '—',
        /*                */ Text37: e.tc.typ == 'groundToWater' ? u.primar.popis : '—',
        /*                */ Text38: e.tc.typ == 'groundToWater' ? u.primar.typ == p`Hlubinné vrty` ? `Počet a hloubka vrtů` : u.primar.typ == p`Plošný kolektor` ? `Počet a délka okruhů` : p`Popis` : '—',
        /*                */ Text39: e.tc.typ == 'groundToWater' ? u.primar.nemrz : '—',
        /*                */ Text40: e.tc.typ == 'groundToWater' ? t.get(u.primar.nadoba!) : '—',
        /*                */ Text41: e.tc.typ == 'groundToWater' ? u.primar.kontrola ? 'ano' : 'ne' : '—',
        /*                */ Text42: u.uvadeni.tc ? 'ano' : 'ne',
        /*                */ Text43: u.uvadeni.reg ? 'ano' : 'ne',
        /*                */ Text44: u.uvadeni.vlastnik ? 'ano' : 'ne',
        /*                */ Text45: t.get(u.uvadeni.typZaruky!),
        /*                */ Text46: u.uvadeni.typZaruky?.includes('ano') ?? false ? u.uvadeni.zaruka ? 'ano' : 'ne' : '—',
        });
    },
} as PdfArgs