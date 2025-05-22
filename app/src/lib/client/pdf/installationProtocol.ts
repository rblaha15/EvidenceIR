// noinspection JSNonASCIINames

import { nazevAdresaFirmy } from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';
import { cascadeDetails } from '$lib/client/pdf/check';
import type { TranslationReference } from '$lib/translations';
import '$lib/extensions';
import type { GetPdfData } from '$lib/server/pdf';
import { endUserName, irName } from '$lib/helpers/ir';
import type { SPID } from '$lib/client/firestore';

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
} as const;

const cena = (subject: TranslationReference | null) => cenik[subject!.split('.').at(-1) as keyof typeof cenik];
const kod = (subject: TranslationReference | null) => kody[subject!.split('.').at(-1) as keyof typeof kody];

const poleProUkony = [
    { typ: 'Kombinované pole33', kod: 'Text26', cena: 'Text36' },
    { typ: 'Kombinované pole34', kod: 'Text27', cena: 'Text37' },
    { typ: 'Kombinované pole35', kod: 'Text28', cena: 'Text38' },
];

const poleProDily = [39, 44, 49];

export const installationProtocol = (i: number): GetPdfData => async ({ evidence: e, uvedeniTC, installationProtocols }, t, fetch) => {
    const { isCascade, pumps, hasHP } = e.tc.model ? { hasHP: true, ...cascadeDetails(e, t) } : { hasHP: false, isCascade: false, pumps: [] };
    const p = installationProtocols[i];
    return publicInstallationProtocol({
        ...e,
        ...p,
        system: {
            nadpis: undefined as never,
            popis: `${irName(e.ir)}
${e.ir.cisloBox ? `BOX: ${e.ir.cisloBox}` : ''}
${e.sol?.typ ? `SOL: ${e.sol.typ} – ${e.sol.pocet}x` : ''}
${hasHP ? formatovatCerpadla(pumps.map(([model, cislo], i) =>
                t.pumpDetails.parseTemplate({ n: isCascade ? `${i + 1}` : '', model, cislo })
            )) : ''}`,
            datumUvedeni: uvedeniTC?.uvadeni?.date ?? '',
        },
    }, t, fetch);
};

export const publicInstallationProtocol: GetPdfData<SPID> = async (p, t, fetch) => {
    const montazka = await nazevAdresaFirmy(p.montazka.ico, fetch);
    const nahradniDily = [p.nahradniDil1, p.nahradniDil2, p.nahradniDil3].slice(0, p.nahradniDily.pocet);
    const cenaDopravy = cenik.transportation * Number(p.ukony.doprava);
    const cenaPrace = p.ukony.typPrace ? cenik.work * Number(p.ukony.mnozstviPrace) : 0;
    const cenaUkony = p.ukony.ukony.reduce((sum, typ) => sum + cena(typ), 0);
    const cenaDily = nahradniDily.reduce((sum, dil) => sum + Number(dil.dil!.unitPrice) * Number(dil.mnozstvi), 0);
    const cenaOstatni = cenaUkony + cenaDily;
    const celkem = cenaDopravy + cenaPrace + cenaOstatni;
    const dph = p.ukony.typPrace == 'sp.technicalAssistance12' ? 1.12 : 1.21
    const datum = p.zasah.datum.split('T')[0].split('-').join('/');
    const hodina = p.zasah.datum.split('T')[1].split(':')[0];
    const technik = p.zasah.inicialy;
    const response = await fetch(`/signatures/${technik}.jpg`)
    const signature = response.ok && !response.redirected ? await response.arrayBuffer() : null

    return {
        fileName: `SP-${technik}-${datum.replace('/', '_')}-${hodina}.pdf`,
        doNotPrefixFileNameWithIR: true,
        /*             id */ Text1: `${technik} ${datum}-${hodina}`,
        /*    koncakJmeno */ Text2: endUserName(p.koncovyUzivatel),
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
        /*   datumUvedeni */ Text16: p.system.datumUvedeni ? dateFromISO(p.system.datumUvedeni) : null,
        /*        technik */ Text17: p.zasah.clovek,
        /*     dobaZasahu */ Text18: p.zasah.doba + ' h',
        /*           druh */ 'Zaškrtávací pole26': p.zasah.druh.includes(`commissioning`),
        /*           druh */ 'Zaškrtávací pole27': p.zasah.druh.includes(`sp.yearlyCheck`),
        /*           druh */ 'Zaškrtávací pole28': p.zasah.druh.includes(`sp.warrantyRepair`),
        /*           druh */ 'Zaškrtávací pole29': p.zasah.druh.includes(`sp.postWarrantyRepair`),
        /*           druh */ 'Zaškrtávací pole30': p.zasah.druh.includes(`sp.installationApproval`),
        /*           druh */ 'Zaškrtávací pole31': p.zasah.druh.includes(`sp.otherType`),
        /*         zavada */ Text19: p.zasah.nahlasenaZavada,
        /*     dobaZasahu */ Text20: p.zasah.popis,
        /*     doprava-km */ Text21: p.ukony.doprava,
        /*  doprava-kc/km */ Text22: cenik.transportation.roundTo(2).toLocaleString('cs') + ' Kč',
        /*       praceTyp */ 'Kombinované pole32': t.get(p.ukony.typPrace) ?? ' ',
        /*       praceKod */ Text25: p.ukony.typPrace ? kod(p.ukony.typPrace).toString() : '',
        /*  praceMnozstvi */ Text23: p.ukony.typPrace ? p.ukony.mnozstviPrace : '',
        /*     prace-kc/h */ Text24: p.ukony.typPrace ? cenik.work.roundTo(2).toLocaleString('cs') + ' Kč' : '',
        /*       zamykani */ ...Object.fromEntries([...[26, 27, 28], ...Array.from({ length: 18 }, (_, i) => i + 36)].map(i => [`Text${i}`, ''])),
        /*       zamykani */ 'Kombinované pole33': ' ',
        /*       zamykani */ 'Kombinované pole34': ' ',
        /*       zamykani */ 'Kombinované pole35': ' ',
        /*          ukony */ ...Object.fromEntries([...p.ukony.ukony.map((typ, i) => [
            [poleProUkony[i].typ, t.get(typ)],
            [poleProUkony[i].cena, cena(typ).roundTo(2).toLocaleString('cs') + ' Kč'],
            [poleProUkony[i].kod, kod(typ).toString()],
        ])].flat()),
        /*   nahradniDily */ ...Object.fromEntries([...nahradniDily.map((dil, i) => [
            [`Text${poleProDily[i]}`, dil.dil!.name],
            [`Text${poleProDily[i] + 1}`, dil.dil!.code.toString()],
            [`Text${poleProDily[i] + 2}`, dil.mnozstvi],
            [`Text${poleProDily[i] + 4}`, dil.dil!.unitPrice.roundTo(2).toLocaleString('cs') + ' Kč'],
        ])].flat()),
        /*    dopravaCena */ Text54: cenaDopravy.roundTo(2).toLocaleString('cs') + ' Kč',
        /*      praceCena */ Text55: cenaPrace.roundTo(2).toLocaleString('cs') + ' Kč',
        /*    ostatniCena */ Text56: cenaOstatni.roundTo(2).toLocaleString('cs') + ' Kč',
        /*     celkemCena */ Text57: celkem.roundTo(2).toLocaleString('cs') + ' Kč',
        /*  celkemCenaDPH */ Text58: (celkem * dph).roundTo(2).toLocaleString('cs') + ' Kč',
        /*                */ Text59: t.get(p.fakturace.hotove),
        /*                */ Text60: p.fakturace.hotove == 'no' ? 'Fakturovat:' : '',
        /*                */ Text61: p.fakturace.hotove == 'no' ? t.get(p.fakturace.komu) : '',
        /*                */ Text62: p.fakturace.hotove == 'no' ? t.get(p.fakturace.jak) : '',
        /*                */ Text63: p.fakturace.komu == 'assemblyCompany' ? p.montazka.zastupce : `${p.koncovyUzivatel.prijmeni} ${p.koncovyUzivatel.jmeno}`,
        /*  popisTechnika */ Podpis64: signature ? { x: 265, y: 160, page: 0, jpg: signature, maxHeight: 60, } : null,
    };
};
export default installationProtocol;

const formatovatCerpadla = (a: string[]) => [a.slice(0, 2).join('; '), a.slice(2, 4).join('; ')].join('\n');