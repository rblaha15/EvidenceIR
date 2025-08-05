import { nazevFirmy } from '$lib/helpers/ares';
import { dateFromISO, todayISO } from '$lib/helpers/date';
import { type GetPdfData, pdfInfo } from '$lib/client/pdf';
import { endUserName, irType, typBOX } from '$lib/helpers/ir';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { p } from '$lib/translations';

const pdfUPT: GetPdfData<'UPT'> = async ({ data, t, addDoc }) => {
    const { evidence: e, uvedeniTC } = data
    const u = uvedeniTC!;
    const tu = t.tc
    const pumps = cascadePumps(e, t);
    const isCascade = Boolean(e.tc.model2);

    await addDoc({
        lang: 'cs',
        args: pdfInfo.TCI,
        data,
    })

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
        Text11: isCascade ? tu.cascadeSee : t.get(e.tc.model!),
        Text12: isCascade ? '—' : e.tc.cislo,
        Text13: e.ir.typ.first!.includes('BOX') ? typBOX(e.ir.cisloBox) ?? t.get(e.ir.typ.first!).slice(10) + ' ' + t.get(e.ir.typ.second!) : '—',
        Text14: e.ir.typ.first!.includes('BOX') ? e.ir.cisloBox : '—',
        Text15: u.tc.jisticTC ? tu.suits : tu.suitsNot,
        Text16: e.ir.typ.first!.includes('BOX') ? u.tc.jisticVJ ? tu.suits : tu.suitsNot : '—',
        Text17: e.tc.typ == 'airToWater' ? u.tc.vzdalenostZdi ? tu.suits : tu.suitsNot : '—',
        Text18: u.os.tcTv ? tu.additionalHotWaterSource : tu.mainHotWaterSource,
        Text19: e.tc.typ == 'airToWater' ? u.tc.kondenzator ? tu.yes : tu.no : '—',
        Text20: u.tc.filtr ? tu.yes : tu.no,
        Text21: u.nadrze.akumulacka,
        Text22: u.nadrze.zasobnik,
        Text23: u.os.tvori == 'otherHeatingSystem' ? u.os.popis : t.get(u.os.tvori!),
        Text24: u.os.dzTop ? tu.yes : tu.no,
        Text25: u.os.dzTop ? u.os.typDzTop : '—',
        Text26: u.os.tcTv ? tu.yes : tu.no,
        Text27: u.os.zTv,
        Text28: u.os.objemEnOs ? tu.suits : tu.suitsNot,
        Text29: u.os.bazenTc ? tu.yes : tu.no,
        Text30: irType(e.ir.typ),
        Text31: e.ir.typ.first == p('SOREL') ? '—' : e.ir.cislo,
        Text32: t.get(u.reg.pripojeniKInternetu!),
        Text33: u.reg.pospojeni ? tu.yes : tu.no,
        Text34: u.reg.spotrebice ? tu.yes : tu.no,
        Text35: e.tc.typ == 'airToWater' ? u.reg.zalZdroj ? tu.yes : tu.no : '—',
        Text36: e.tc.typ == 'groundToWater' ? t.get(u.primar.typ!) : '—',
        Text37: e.tc.typ == 'groundToWater' ? u.primar.popis : '—',
        Text38: e.tc.typ == 'groundToWater' ? u.primar.typ == `groundBoreholes` ? tu.numberAndDepthOfBoreholes : u.primar.typ == `surfaceCollector` ? tu.numberAndLengthOfCircuits : tu.collectorDescription : '—',
        Text39: e.tc.typ == 'groundToWater' ? u.primar.nemrz : '—',
        Text40: e.tc.typ == 'groundToWater' ? t.get(u.primar.nadoba!) : '—',
        Text41: e.tc.typ == 'groundToWater' ? u.primar.kontrola ? tu.yes : tu.no : '—',
        Text42: u.uvadeni.tc ? tu.yes : tu.no,
        Text43: u.uvadeni.reg ? tu.yes : tu.no,
        Text44: u.uvadeni.vlastnik ? tu.yes : tu.no,
        Text45: t.get(u.uvadeni.typZaruky!),
        Text46: u.uvadeni.typZaruky?.includes('extendedWarranty') ?? false ? u.uvadeni.zaruka ? tu.yes : tu.no : '—',
        Text47: !isCascade ? '' : tu.cascade + '\n' + pumps
            .map(tu.pumpDetails).chunk(3)
            .map(g => g.join('; ')).join('\n'),
    });
};
export default pdfUPT;