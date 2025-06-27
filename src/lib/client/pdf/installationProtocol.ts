// noinspection JSNonASCIINames

import { nazevAdresaFirmy } from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';
import { cascadeDetails } from '$lib/client/pdf/check';
import '$lib/extensions';
import type { GetPdfData } from '$lib/server/pdf';
import { endUserName, irName, spName } from '$lib/helpers/ir';
import { extractSPIDFromRawData, type SPID } from '$lib/client/firestore';
import { pdfInfo } from '$lib/client/pdf';

const cenik = {
    transportation: 9.92,
    work: 661.16,
    regulusRoute: 826.45,
    installationApproval: 2479.34,
    extendedWarranty: 4958.68,
    commissioningTC: 3305.79,
    commissioningSOL: 1652.89,
    yearlyHPCheck: 2479.34,
    yearlySOLCheck: 1239.67,
    withoutCode: 0,
} as const;
type C = keyof typeof cenik

const kody = {
    assemblyWork: 18261,
    technicalAssistance: 12510,
    technicalAssistance12: 20482,
    regulusRoute: 14343,
    installationApproval: 14846,
    extendedWarranty: 14847,
    commissioningTC: 9786,
    commissioningSOL: 9785,
    yearlyHPCheck: 9787,
    yearlySOLCheck: 9782,
    withoutCode: 0,
} as const;
type K = keyof typeof kody

type A<S extends string> = S | `${string}.${S}` | null

const cena = (subject: A<C>) => cenik[subject!.split('.').at(-1) as C];
const kod = (subject: A<K>) => kody[subject!.split('.').at(-1) as K];

const poleProUkony = [
    { typ: 'Kombinované pole33', kod: 'Text26', cena: 'Text36', mnozstvi: 'Text84' },
    { typ: 'Kombinované pole34', kod: 'Text27', cena: 'Text37', mnozstvi: 'Text85' },
    { typ: 'Kombinované pole35', kod: 'Text28', cena: 'Text38', mnozstvi: 'Text86' },
];

const poleProDilyS = 44;
const poleProDily = (['nazev', 'kod', 'mnozstvi', 'sklad', 'cena'] as const)
    .map((k, i) => [k, poleProDilyS + i * 8] as const).toRecord();

export const installationProtocol = (i: number): GetPdfData => async ({ evidence: e, installationProtocols }, t, fetch, add) => {
    const { isCascade, pumps, hasHP } = e.tc.model ? { hasHP: true, ...cascadeDetails(e, t) } : { hasHP: false, isCascade: false, pumps: [] };
    const p = installationProtocols[i];
    return publicInstallationProtocol({
        ...e,
        ...p,
        system: {
            popis: `${irName(e.ir)}
${e.ir.cisloBox ? `BOX: ${e.ir.cisloBox}` : ''}
${e.sol?.typ ? `SOL: ${e.sol.typ} – ${e.sol.pocet}x` : ''}
${hasHP ? formatovatCerpadla(pumps.map(([model, cislo], i) =>
                t.pumpDetails({ n: isCascade ? `${i + 1}` : '', model, cislo })
            )) : ''}`,
            pocetTC: pumps.length,
        },
    }, t, fetch, add);
};

export const publicInstallationProtocol: GetPdfData<'SP'> = async (p, t, fetch, addPage) => {
    console.log(p)
    const montazka = await nazevAdresaFirmy(p.montazka.ico, fetch);
    const nahradniDily = [
        p.nahradniDil1, p.nahradniDil2, p.nahradniDil3, p.nahradniDil4,
        p.nahradniDil5, p.nahradniDil6, p.nahradniDil7, p.nahradniDil8,
    ].slice(0, p.nahradniDily.pocet);
    const cenaDopravy = cenik.transportation * Number(p.ukony.doprava);
    const cenaPrace = p.ukony.typPrace ? cenik.work * Number(p.ukony.doba) : 0;
    const cenaUkony = p.ukony.ukony.sumBy(typ => cena(typ) * (typ == 'sp.commissioningTC' || typ == 'sp.yearlyHPCheck' ? p.system.pocetTC : 1));
    const cenaDily = nahradniDily.sumBy(dil => Number(dil.unitPrice) * Number(dil.mnozstvi));
    const cenaOstatni = cenaUkony + cenaDily;
    const celkem = cenaDopravy + cenaPrace + cenaOstatni;
    const dph = p.ukony.typPrace == 'sp.technicalAssistance12' ? 1.12 : 1.21
    const response = await fetch(`/signatures/${p.zasah.inicialy}.jpg`)
    const signature = response.ok && !response.redirected ? await response.arrayBuffer() : null
    if (dph == 1.12) await addPage('CP', p)

    return {
        fileNameSuffix: spName(p.zasah).replaceAll(/\/:/g, '_'),
        /*             id */ Text1: spName(p.zasah),
        /*    koncakNazev */ Text29: p.koncovyUzivatel.typ == 'company' ? `${t.companyName}:` : `${t.surname} a ${t.name.toLowerCase()}:`,
        /*    koncakJmeno */ Text2: endUserName(p.koncovyUzivatel),
        /*      koncakICO */ Text30: p.koncovyUzivatel.typ == 'company' ? t.crn : t.birthday,
        /* koncakNarozeni */ Text3: p.koncovyUzivatel.typ == 'company'
            ? p.koncovyUzivatel.ico : p.koncovyUzivatel.narozeni.length == 0 ? null : p.koncovyUzivatel.narozeni,
        /*       bydliste */ Text4: `${p.bydliste.ulice}, ${p.bydliste.psc} ${p.bydliste.obec}`,
        /*       kocakTel */ Text5: p.koncovyUzivatel.telefon,
        /*     kocakEmail */ Text6: p.koncovyUzivatel.email,
        /*       montazka */ Text7: montazka?.obchodniJmeno ?? null,
        /*    montazkaICO */ Text8: p.montazka.ico,
        /*  montazkaOsoba */ Text9: p.montazka.zastupce,
        /* montazkaAdresa */ Text10: montazka?.sidlo.textovaAdresa ?? null,
        /*    montazkaTel */ Text11: p.montazka.telefon,
        /*  montazkaEmail */ Text12: p.montazka.email,
        /*      instalace */ Text13: `${p.mistoRealizace.ulice}, ${p.mistoRealizace.psc} ${p.mistoRealizace.obec}`,
        /*   popisSystemu */ Text14: p.system.popis,
        /*          datum */ Text15: dateFromISO(p.zasah.datum),
        /*   datumUvedeni */ Text16: p.zasah.datumUvedeni ? dateFromISO(p.zasah.datumUvedeni) : null,
        /*        technik */ Text17: p.zasah.clovek.split(' ').toReversed().join(' '),
        /*           druh */ 'Zaškrtávací pole28': p.zasah.zaruka == `sp.warrantyCommon`,
        /*           druh */ 'Zaškrtávací pole29': p.zasah.zaruka == `sp.warrantyExtended`,
        /*         zavada */ Text19: p.zasah.nahlasenaZavada,
        /*     dobaZasahu */ Text20: p.zasah.popis,
        /*     doprava-km */ Text21: p.ukony.doprava + ' km',
        /*  doprava-kc/km */ Text22: cenik.transportation.roundTo(2).toLocaleString('cs') + ' Kč',
        /*       praceTyp */ 'Kombinované pole32': t.get(p.ukony.typPrace) ?? 'Zásah',
        /*       praceKod */ Text25: p.ukony.typPrace ? kod(p.ukony.typPrace).toString().let(k => k == '0' ? '' : k) : '',
        /*  praceMnozstvi */ Text23: p.ukony.doba + ' h',
        /*     prace-kc/h */ Text24: p.ukony.typPrace ? cenik.work.roundTo(2).toLocaleString('cs') + ' Kč' : '',
        /*       zamykani */ ...poleProUkony.map(p => [p.typ, ' '] as const).toRecord(),
        /*          ukony */ ...p.ukony.ukony.map((typ, i) => [
            [poleProUkony[i].typ, t.get(typ)],
            [poleProUkony[i].cena, cena(typ).roundTo(2).toLocaleString('cs') + ' Kč'],
            [poleProUkony[i].kod, kod(typ).toString()],
            [poleProUkony[i].mnozstvi, typ == 'sp.commissioningTC' || typ == 'sp.yearlyHPCheck' ? p.system.pocetTC + ' ks' : ''],
        ] as const).flat().toRecord(),
        /*   nahradniDily */ ...nahradniDily.map((dil, i) => [
            [`Text${poleProDily.nazev + i}`, dil.name],
            [`Text${poleProDily.kod + i}`, dil.code],
            [`Text${poleProDily.mnozstvi + i}`, dil.mnozstvi + ' ks'],
            [`Text${poleProDily.sklad + i}`, dil.warehouse],
            [`Text${poleProDily.cena + i}`, Number(dil.unitPrice).roundTo(2).toLocaleString('cs') + ' Kč'],
        ] as const).flat().toRecord(),
        /*    dopravaCena */ Text31: cenaDopravy.roundTo(2).toLocaleString('cs') + ' Kč',
        /*      praceCena */ Text32: cenaPrace.roundTo(2).toLocaleString('cs') + ' Kč',
        /*    ostatniCena */ Text33: cenaOstatni.roundTo(2).toLocaleString('cs') + ' Kč',
        /*     celkemCena */ Text34: celkem.roundTo(2).toLocaleString('cs') + ' Kč',
        /*            DPH */ Text18: `${(dph * 100 - 100).toFixed(0)} %`,
        /*  celkemCenaDPH */ Text35: (celkem * dph).roundTo(2).toLocaleString('cs') + ' Kč',
        /*                */ Text39: t.get(p.fakturace.hotove),
        /*                */ Text40: p.fakturace.hotove == 'no' ? 'Fakturovat:' : '',
        /*                */ Text41: p.fakturace.hotove == 'no' ? t.get(p.fakturace.komu) : '',
        /*                */ Text42: p.fakturace.hotove == 'no' ? t.get(p.fakturace.jak) : '',
        /*                */ Text43: p.fakturace.komu == 'assemblyCompany' ? p.montazka.zastupce : endUserName(p.koncovyUzivatel),
        /*  popisTechnika */ Podpis64: signature ? { x: 425, y: 170, page: 0, jpg: signature, maxHeight: 60, } : null,
    } satisfies Awaited<ReturnType<GetPdfData<'SP'>>>;
};
export default installationProtocol;

const formatovatCerpadla = (a: string[]) => [a.slice(0, 2).join('; '), a.slice(2, 4).join('; ')].join('\n');

export const pdfCP: GetPdfData<'SP'> = async p => {
    return ({
        Text1: `${p.koncovyUzivatel.prijmeni} ${p.koncovyUzivatel.jmeno}`,
        Text2: `${p.mistoRealizace.ulice}, ${p.mistoRealizace.psc} ${p.mistoRealizace.obec}`,
        Text3: dateFromISO(p.zasah.datum),
    });
}