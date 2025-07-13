import { nazevFirmy } from '$lib/helpers/ares';
import { dateFromISO, todayISO } from '$lib/helpers/date';
import type { GetPdfData } from '$lib/client/pdf';
import { endUserName, irType, typBOX } from '$lib/helpers/ir';
import { cascadePumps } from '$lib/forms/IN/infoIN';

const pdfUPT: GetPdfData<'UPT'> = async ({ evidence: e, uvedeniTC }, t) => {
    const u = uvedeniTC!;
    const pumps = cascadePumps(e, t);

    const isCascade = Boolean(e.tc.model2);
    return ({
        Text1: endUserName(e.koncovyUzivatel),
        Text2: e.koncovyUzivatel.telefon,
        Text3: e.koncovyUzivatel.email,
        Text4: `${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
        Text5: await nazevFirmy(e.montazka.ico) ?? '',
        Text6: e.montazka.ico,
        Text7: e.uvedeni.zastupce,
        Text8: e.uvedeni.telefon,
        Text9: e.uvedeni.email,
        Text10: dateFromISO(u.uvadeni.date ?? todayISO()),
        Text11: isCascade ? t.cascadeSee : t.get(e.tc.model!),
        Text12: isCascade ? '—' : e.tc.cislo,
        Text13: e.ir.typ.first!.includes('BOX') ? typBOX(e.ir.cisloBox) ?? t.get(e.ir.typ.first!).slice(10) + ' ' + t.get(e.ir.typ.second!) : '—',
        Text14: e.ir.typ.first!.includes('BOX') ? e.ir.cisloBox : '—',
        Text15: u.tc.jisticTC ? t.suits : t.suitsNot,
        Text16: e.ir.typ.first!.includes('BOX') ? u.tc.jisticVJ ? t.suits : t.suitsNot : '—',
        Text17: e.tc.typ == 'airToWater' ? u.tc.vzdalenostZdi ? t.suits : t.suitsNot : '—',
        Text18: u.os.tcTv ? t.additionalHotWaterSource : t.mainHotWaterSource,
        Text19: e.tc.typ == 'airToWater' ? u.tc.kondenzator ? t.yes : t.no : '—',
        Text20: u.tc.filtr ? t.yes : t.no,
        Text21: u.nadrze.akumulacka,
        Text22: u.nadrze.zasobnik,
        Text23: u.os.tvori == 'otherHeatingSystem' ? u.os.popis : t.get(u.os.tvori!),
        Text24: u.os.dzTop ? t.yes : t.no,
        Text25: u.os.dzTop ? u.os.typDzTop : '—',
        Text26: u.os.tcTv ? t.yes : t.no,
        Text27: u.os.zTv,
        Text28: u.os.objemEnOs ? t.suits : t.suitsNot,
        Text29: u.os.bazenTc ? t.yes : t.no,
        Text30: irType(e.ir.typ),
        Text31: e.ir.typ.first?.includes('SOREL') ? '—' : e.ir.cislo,
        Text32: t.get(u.reg.pripojeniKInternetu!),
        Text33: u.reg.pospojeni ? t.yes : t.no,
        Text34: u.reg.spotrebice ? t.yes : t.no,
        Text35: e.tc.typ == 'airToWater' ? u.reg.zalZdroj ? t.yes : t.no : '—',
        Text36: e.tc.typ == 'groundToWater' ? t.get(u.primar.typ!) : '—',
        Text37: e.tc.typ == 'groundToWater' ? u.primar.popis : '—',
        Text38: e.tc.typ == 'groundToWater' ? u.primar.typ == `groundBoreholes` ? t.numberAndDepthOfBoreholes : u.primar.typ == `surfaceCollector` ? t.numberAndLengthOfCircuits : t.collectorDescription : '—',
        Text39: e.tc.typ == 'groundToWater' ? u.primar.nemrz : '—',
        Text40: e.tc.typ == 'groundToWater' ? t.get(u.primar.nadoba!) : '—',
        Text41: e.tc.typ == 'groundToWater' ? u.primar.kontrola ? t.yes : t.no : '—',
        Text42: u.uvadeni.tc ? t.yes : t.no,
        Text43: u.uvadeni.reg ? t.yes : t.no,
        Text44: u.uvadeni.vlastnik ? t.yes : t.no,
        Text45: t.get(u.uvadeni.typZaruky!),
        Text46: u.uvadeni.typZaruky?.includes('extendedWarranty') ?? false ? u.uvadeni.zaruka ? t.yes : t.no : '—',
        Text47: !isCascade ? '' : t.cascade + '\n' + pumps
            .map(t.pumpDetails).chunk(3)
            .map(g => g.join('; ')).join('\n'),
    });
};
export default pdfUPT;