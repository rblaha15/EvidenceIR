import { dateFromISO, dayISO } from '$lib/helpers/date';
import { type GetPdfData, pdfInfo } from '$lib/pdf/pdf';
import { endUserName, irType, typBOX } from '$lib/helpers/ir';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { get } from '$lib/translations';
import ares from '$lib/helpers/ares';

const pdfUPT: GetPdfData<'UPT'> = async ({ data, t, addDoc, lang }) => {
    const { IN, UP: { TC: UP, dateTC } } = data
    if (!UP) throw new Error("UP TC not filled")
    const tu = t.tc
    const pumps = cascadePumps(IN);
    const isCascade = Boolean(IN.tc.model2);

    await addDoc({
        lang: 'cs',
        args: pdfInfo.TCI,
        data: {},
    })

    const cascadeText = !isCascade ? '' : tu.cascade + '\n' + pumps
        .map(tu.pumpDetails).chunk(3)
        .map(g => g.join('; ')).join('\n');
    const noteText = UP.uvadeni.note ? `Poznámka: ${UP.uvadeni.note}` : '';
    return ({
        Text1: endUserName(IN.koncovyUzivatel),
        Text2: IN.koncovyUzivatel.telefon,
        Text3: IN.koncovyUzivatel.email,
        Text4: `${IN.mistoRealizace.ulice}, ${IN.mistoRealizace.psc} ${IN.mistoRealizace.obec}`,
        Text5: await ares.getName(IN.montazka.ico) ?? '',
        Text6: IN.montazka.ico,
        Text7: IN.uvedeni.zastupce,
        Text8: IN.uvedeni.telefon,
        Text9: IN.uvedeni.email,
        Text10: dateFromISO(dateTC || dayISO()),
        Text11: isCascade ? tu.cascadeSee : IN.tc.model!,
        Text12: isCascade ? '—' : IN.tc.cislo,
        Text13: IN.ir.typ.first!.includes('BOX') ? typBOX(IN.ir.cisloBox) ?? IN.ir.typ.first!.slice(10) + ' ' + IN.ir.typ.second! : '—',
        Text14: IN.ir.typ.first!.includes('BOX') ? IN.ir.cisloBox : '—',
        Text15: UP.tc.jisticTC ? tu.suits : tu.suitsNot,
        Text16: IN.ir.typ.first!.includes('BOX') ? UP.tc.jisticVJ ? tu.suits : tu.suitsNot : '—',
        Text17: IN.tc.typ == 'airToWater' ? UP.tc.vzdalenostZdi ? tu.suits : tu.suitsNot : '—',
        Text18: UP.os.tcTv ? tu.additionalHotWaterSource : tu.mainHotWaterSource,
        Text19: IN.tc.typ == 'airToWater' ? UP.tc.kondenzator ? tu.yes : tu.no : '—',
        Text20: UP.tc.filtr ? tu.yes : tu.no,
        Text21: IN.tanks.accumulation,
        Text22: IN.tanks.water,
        Text23: UP.os.tvori == 'otherHeatingSystem' ? UP.os.popis : get(tu, UP.os.tvori!),
        Text24: UP.os.dzTop ? tu.yes : tu.no,
        Text25: UP.os.dzTop ? UP.os.typDzTop : '—',
        Text26: UP.os.tcTv ? tu.yes : tu.no,
        Text27: UP.os.zTv,
        Text28: UP.os.objemEnOs ? tu.suits : tu.suitsNot,
        Text29: UP.os.bazenTc ? tu.yes : tu.no,
        Text30: irType(IN.ir.typ),
        Text31: IN.ir.typ.first == 'SOREL' ? '—' : IN.ir.cislo,
        Text32: get(tu, UP.reg.pripojeniKInternetu!),
        Text33: UP.reg.pospojeni ? tu.yes : tu.no,
        Text34: UP.reg.spotrebice ? tu.yes : tu.no,
        Text35: IN.tc.typ == 'airToWater' ? UP.reg.zalZdroj ? tu.yes : tu.no : '—',
        Text36: IN.tc.typ == 'groundToWater' ? get(tu, UP.primar.typ!) : '—',
        Text37: IN.tc.typ == 'groundToWater' ? UP.primar.popis : '—',
        Text38: IN.tc.typ == 'groundToWater' ? UP.primar.typ == `groundBoreholes` ? tu.numberAndDepthOfBoreholes : UP.primar.typ == `surfaceCollector` ? tu.numberAndLengthOfCircuits : tu.collectorDescription : '—',
        Text39: IN.tc.typ == 'groundToWater' ? UP.primar.nemrz : '—',
        Text40: IN.tc.typ == 'groundToWater' ? get(tu, UP.primar.nadoba!) : '—',
        Text41: IN.tc.typ == 'groundToWater' ? UP.primar.kontrola ? tu.yes : tu.no : '—',
        Text42: UP.uvadeni.tc ? tu.yes : tu.no,
        Text43: UP.uvadeni.reg ? tu.yes : tu.no,
        Text44: UP.uvadeni.vlastnik ? tu.yes : tu.no,
        Text45: get(tu, UP.uvadeni.typZaruky!),
        Text46: UP.uvadeni.typZaruky?.includes('extendedWarranty') ?? false ? UP.uvadeni.zaruka ? tu.yes : tu.no : '—',
        Text47: [cascadeText, noteText].filter(Boolean).join('\n'),
    });
};
export default pdfUPT;