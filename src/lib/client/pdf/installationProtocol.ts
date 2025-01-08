// noinspection JSNonASCIINames

import { nazevAdresaFirmy } from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';
import { cascadeDetails } from '$lib/client/pdf/check';
import { nazevIR } from '$lib/Data';
import type { TranslationReference } from '$lib/translations';
import '$lib/extensions';
import { technicians } from '$lib/server/realtime';
import type { GetPdfData } from '$lib/server/pdf';

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
} as const;

const kody = {
    technicalAssistance: 12510,
    assemblyWork: 18261,
    regulusRoute: 14343,
    installationApproval: 14846,
    extendedWarranty: 14847,
    commissioningTC: 9786,
    commissioningSOL: 9785,
    yearlyHPCheck: 9787,
    yearlySOLCheck: 9782,
} as const;

const cena = (subject: TranslationReference | null) => cenik[subject!.split('.').at(-1) as keyof typeof cenik];
const kod = (subject: TranslationReference | null) => kody[subject!.split('.').at(-1) as keyof typeof kody];

const poleProUkony = [
    { typ: 'Kombinované pole33', kod: 'Text26', cena: 'Text36' },
    { typ: 'Kombinované pole34', kod: 'Text27', cena: 'Text37' },
    { typ: 'Kombinované pole35', kod: 'Text28', cena: 'Text38' },
]

const poleProDily = [39, 44, 49]

const installationProtocol = (i: number): GetPdfData => async (g, t) => {
    console.log(g)
    const { evidence: e, uvedeniTC: h, installationProtocols } = g
    console.log(installationProtocols)
    const p = installationProtocols[i]
    const montazka = await nazevAdresaFirmy(e.montazka.ico, fetch);
    const { isCascade, pumps, hasHP } = e.tc.model ? { hasHP: true, ...cascadeDetails(e, t) } : { hasHP: false, isCascade: false, pumps: [] };
    const nahradniDily = [p.nahradniDil1, p.nahradniDil2, p.nahradniDil3].slice(0, p.nahradniDily.pocet)
    const cenaDopravy = cenik.transportation * Number(p.ukony.doprava);
    const cenaPrace = cenik.work * Number(p.ukony.mnozstviPrace);
    const cenaUkony = p.ukony.ukony.reduce((sum, typ) => sum + cena(typ), 0);
    const cenaDily = nahradniDily.reduce((sum, dil) => sum + Number(dil.jednotkovaCena) * Number(dil.mnozstvi), 0);
    const cenaOstatni = cenaUkony + cenaDily
    const celkem = cenaDopravy + cenaPrace + cenaOstatni;
    const datum = p.zasah.datum.split('T')[0].split('-').join('/')
    const hodina = p.zasah.datum.split('T')[1].split(':')[0]
    const technici = await technicians();
    const technik = technici.find(t => t.name == p.zasah.clovek)!.initials;

    return {
        fileName: `SP-${technik}-${datum.replace('/', '_')}-${hodina}`,
/*             id */ Text1: `${technik} ${datum}-${hodina}`,
/*    koncakJmeno */ Text2: `${e.koncovyUzivatel.prijmeni} ${e.koncovyUzivatel.jmeno}`,
/* koncakNarozeni */ Text3: e.koncovyUzivatel.narozeni.length == 0 ? null : e.koncovyUzivatel.narozeni,
/*       bydliste */ Text4: `${e.bydliste.ulice}, ${e.bydliste.psc} ${e.bydliste.obec}`,
/*       kocakTel */ Text5: e.koncovyUzivatel.telefon,
/*     kocakEmail */ Text6: e.koncovyUzivatel.email,
/*       montazka */ Text7: montazka?.obchodniJmeno ?? null,
/*    montazkaICO */ Text8: e.montazka.ico,
/*  montazkaOsoba */ Text9: e.montazka.zastupce,
/* montazkaAdresa */ Text10: montazka?.sidlo.textovaAdresa ?? null,
/*    montazkaTel */ Text11: e.montazka.telefon,
/*  montazkaEmail */ Text12: e.montazka.email,
/*      instalace */ Text13: `${e.mistoRealizace.ulice}, ${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
/*   popisSystemu */ Text14: `${nazevIR(t, e.ir.typ)} ${e.ir.cislo}
${e.ir.cisloBox ? `BOX: ${e.ir.cisloBox}` : ''}
${e.sol.typ ? `SOL: ${e.sol.typ} – ${e.sol.pocet}x` : ''}
${hasHP ? formatovatCerpadla(pumps.map(([model, cislo], i) =>
    t.pumpDetails.parseTemplate({ n: isCascade ? `${i + 1}` : '', model, cislo })
)) : ''}`,
/*          datum */ Text15: dateFromISO(p.zasah.datum),
/*   datumUvedeni */ Text16: h ? dateFromISO(h?.uvadeni.date) : null,
/*        technik */ Text17: p.zasah.clovek,
/*     dobaZasahu */ Text18: p.zasah.doba,
/*           druh */ 'Zaškrtávací pole26': p.zasah.druh.includes(`commissioning`),
/*           druh */ 'Zaškrtávací pole27': p.zasah.druh.includes(`sp.yearlyCheck`),
/*           druh */ 'Zaškrtávací pole28': p.zasah.druh.includes(`sp.warrantyRepair`),
/*           druh */ 'Zaškrtávací pole29': p.zasah.druh.includes(`sp.postWarrantyRepair`),
/*           druh */ 'Zaškrtávací pole30': p.zasah.druh.includes(`sp.installationApproval`),
/*           druh */ 'Zaškrtávací pole31': p.zasah.druh.includes(`sp.otherType`),
/*         zavada */ Text19: p.zasah.nahlasenaZavada,
/*     dobaZasahu */ Text20: p.zasah.popis,
/*     doprava-km */ Text21: p.ukony.doprava,
/*  doprava-kc/km */ Text22: cenik.transportation.toFixed(2),
/*       praceTyp */ 'Kombinované pole32': t.get(p.ukony.typPrace),
/*       praceKod */ Text25: kod(p.ukony.typPrace).toString(),
/*  praceMnozstvi */ Text23: p.ukony.mnozstviPrace,
/*     prace-kc/h */ Text24: cenik.work.toFixed(2),
/*       zamykani */ ...Object.fromEntries([...[26, 27, 28], ...Array.from({length: 18}, (_, i) => i + 36)].map(i => [`Text${i}`, ''])),
/*       zamykani */ 'Kombinované pole33': ' ',
/*       zamykani */ 'Kombinované pole34': ' ',
/*       zamykani */ 'Kombinované pole35': ' ',
/*          ukony */ ...Object.fromEntries([...p.ukony.ukony.map((typ, i) => [
    [poleProUkony[i].typ, t.get(typ)],
    [poleProUkony[i].cena, cena(typ).toFixed(2) + ' Kč'],
    [poleProUkony[i].kod, kod(typ).toString()],
])].flat()),
/*   nahradniDily */ ...Object.fromEntries([...nahradniDily.map((dil, i) => [
    [`Text${poleProDily[i]}`, dil.nazev],
    [`Text${poleProDily[i] + 1}`, dil.kod],
    [`Text${poleProDily[i] + 2}`, dil.mnozstvi],
    [`Text${poleProDily[i] + 4}`, dil.jednotkovaCena + ' Kč'],
])].flat()),
/*    dopravaCena */ Text54: cenaDopravy.toFixed(2) + ' Kč',
/*      praceCena */ Text55: cenaPrace.toFixed(2) + ' Kč',
/*    ostatniCena */ Text56: cenaOstatni.toFixed(2) + ' Kč',
/*     celkemCena */ Text57: celkem.toFixed(2) + ' Kč',
/*  celkemCenaDPH */ Text58: (celkem * 1.21).toFixed(2) + ' Kč',
/*                */ Text59: t.get(p.fakturace.hotove),
/*                */ Text60: p.fakturace.hotove == 'no' ? 'Fakturovat:' : '',
/*                */ Text61: p.fakturace.hotove == 'no' ? t.get(p.fakturace.komu) : '',
/*                */ Text62: p.fakturace.hotove == 'no' ? t.get(p.fakturace.jak) : '',
/*                */ Text63: `${e.koncovyUzivatel.prijmeni} ${e.koncovyUzivatel.jmeno}`,
    };
};
export default installationProtocol

const formatovatCerpadla = (a: string[]) => [a.slice(0, 2).join('; '), a.slice(2, 4).join('; ')].join('\n');