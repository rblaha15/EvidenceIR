// noinspection JSNonASCIINames

import { nazevAdresaFirmy } from '$lib/helpers/ares';
import { dateFromISO } from '$lib/helpers/date';
import '$lib/extensions';
import { endUserName, irName, spName } from '$lib/helpers/ir';
import { type GetPdfData, pdfInfo } from '$lib/client/pdf';
import { cascadePumps } from '$lib/forms/IN/infoIN';

const cenik = {
    transportation: 9.92,
    work: 661.16,
    regulusRoute: 826.45,
    installationApproval: 2479.34,
    extendedWarranty: 4958.68,
    commissioningTC: 3305.79,
    commissioningSOL: 1652.89,
    commissioningFVE: 1652.89,
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
    commissioningFVE: 21665,
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
    .associateWith((_, i) => poleProDilyS + i * 8);

const multilineLineLength = 70;
const multilineMaxLength = multilineLineLength * 4;
const inlineMaxLength = 55;

const multilineTooLong = (text: string) => text.split('\n').sumBy(line =>
    Math.ceil(line.length / multilineLineLength) * multilineLineLength,
) > multilineMaxLength;
const inlineTooLong = (text: string) => text.length > inlineMaxLength;

export const pdfSP: GetPdfData<'SP'> = async ({ data: { evidence: e, installationProtocols }, t, addDoc, index, lang }) => {
    const pumps = e.tc.model ? cascadePumps(e, t) : [];
    const p = installationProtocols[index];
    return pdfNSP({
        data: {
            ...e,
            ...p,
            system: {
                popis:
                    irName(e.ir) +
                    (e.ir.cisloBox ? `; BOX: ${e.ir.cisloBox}` : '') +
                    (e.sol?.typ ? `\nSOL: ${e.sol.typ} – ${e.sol.pocet}x` : '') +
                    (e.rek?.typ ? `\nREK: ${e.rek.typ}` : '') +
                    (e.fve?.pocet ? `\nFVE: ${t.get(e.fve.typ)} – ${e.fve.pocet}x` : '') +
                    (e.fve?.akumulaceDoBaterii ? `; baterie: ${e.fve.typBaterii} – ${e.fve.kapacitaBaterii} kWh` : '') +
                    (e.jine?.popis ? `\nJiné zařízení: ${e.jine.popis}` : '') +
                    (e.tc.model ? '\n' + formatovatCerpadla(pumps.map(t.pumpDetails)) : ''),
                pocetTC: pumps.length,
            },
        }, t, addDoc, lang,
    });
};

export const pdfNSP: GetPdfData<'NSP'> = async ({ data: p, t, addDoc }) => {
    console.log(p);
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
    const dph = p.ukony.typPrace == 'sp.technicalAssistance12' ? 1.12 : 1.21;
    let response: Response;
    try {
        response = await fetch(`/signatures/${p.zasah.inicialy}.jpg`);
    } catch (_: unknown) {
        response = new Response(null, { status: 400 });
    }
    const signature = response.ok && !response.redirected ? await response.arrayBuffer() : null;

    const system = p.system.popis;
    const zavada = p.zasah.nahlasenaZavada;
    const zasah = p.zasah.popis;
    if (multilineTooLong(system) || inlineTooLong(zavada) || multilineTooLong(zasah))
        await addDoc({ args: pdfInfo.PS, data: p, lang: 'cs' });

    if (dph == 1.12) await addDoc({ args: pdfInfo.CP, data: p, lang: 'cs' });

    return {
        fileNameSuffix: spName(p.zasah).replaceAll(/\/:/g, '_'),
        Text1: spName(p.zasah),
        Text29: p.koncovyUzivatel.typ == 'company' ? `${t.companyName}:` : `${t.name} a ${t.surname.toLowerCase()}:`,
        Text2: endUserName(p.koncovyUzivatel),
        Text30: p.koncovyUzivatel.typ == 'company' ? t.crn : t.birthday,
        Text3: p.koncovyUzivatel.typ == 'company'
            ? p.koncovyUzivatel.ico : p.koncovyUzivatel.narozeni.length == 0 ? null : p.koncovyUzivatel.narozeni,
        Text4: `${p.bydliste.ulice}, ${p.bydliste.psc} ${p.bydliste.obec}`,
        Text5: p.koncovyUzivatel.telefon,
        Text6: p.koncovyUzivatel.email,
        Text7: montazka?.obchodniJmeno ?? null,
        Text8: p.montazka.ico,
        Text9: p.montazka.zastupce,
        Text10: montazka?.sidlo.textovaAdresa ?? null,
        Text11: p.montazka.telefon,
        Text12: p.montazka.email,
        Text13: `${p.mistoRealizace.ulice}, ${p.mistoRealizace.psc} ${p.mistoRealizace.obec}`,
        Text14: multilineTooLong(system) ? 'Viz druhá strana' : system,
        Text15: dateFromISO(p.zasah.datum),
        Text16: p.zasah.datumUvedeni ? dateFromISO(p.zasah.datumUvedeni) : null,
        Text17: p.zasah.clovek,
        'Zaškrtávací pole28': p.zasah.zaruka == `sp.warrantyCommon`,
        'Zaškrtávací pole29': p.zasah.zaruka == `sp.warrantyExtended`,
        Text19: inlineTooLong(zavada) ? 'Viz druhá strana' : zavada,
        Text20: multilineTooLong(zasah) ? 'Viz druhá strana' : zasah,
        Text21: p.ukony.doprava + ' km',
        Text22: cenik.transportation.roundTo(2).toLocaleString('cs') + ' Kč',
        'Kombinované pole32': t.get(p.ukony.typPrace) ?? 'Zásah',
        Text25: p.ukony.typPrace ? kod(p.ukony.typPrace).toString().let(k => k == '0' ? '' : k) : '',
        Text23: p.ukony.doba + ' h',
        Text24: p.ukony.typPrace ? cenik.work.roundTo(2).toLocaleString('cs') + ' Kč' : '',
        ...poleProUkony.map(p => [p.typ, ' '] as const).toRecord(),
        ...p.ukony.ukony.map((typ, i) => [
            [poleProUkony[i].typ, t.get(typ)],
            [poleProUkony[i].cena, cena(typ).roundTo(2).toLocaleString('cs') + ' Kč'],
            [poleProUkony[i].kod, kod(typ).toString()],
            [poleProUkony[i].mnozstvi, typ == 'sp.commissioningTC' || typ == 'sp.yearlyHPCheck' ? p.system.pocetTC + ' ks' : ''],
        ] as const).flat().toRecord(),
        ...nahradniDily.map((dil, i) => [
            [`Text${poleProDily.nazev + i}`, dil.name],
            [`Text${poleProDily.kod + i}`, dil.code],
            [`Text${poleProDily.mnozstvi + i}`, dil.mnozstvi + ' ks'],
            [`Text${poleProDily.sklad + i}`, dil.warehouse],
            [`Text${poleProDily.cena + i}`, Number(dil.unitPrice).roundTo(2).toLocaleString('cs') + ' Kč'],
        ] as const).flat().toRecord(),
        Text31: cenaDopravy.roundTo(2).toLocaleString('cs') + ' Kč',
        Text32: cenaPrace.roundTo(2).toLocaleString('cs') + ' Kč',
        Text33: cenaOstatni.roundTo(2).toLocaleString('cs') + ' Kč',
        Text34: celkem.roundTo(2).toLocaleString('cs') + ' Kč',
        Text18: `${(dph * 100 - 100).toFixed(0)} %`,
        Text35: (celkem * dph).roundTo(2).toLocaleString('cs') + ' Kč',
        Text39: t.get(p.fakturace.hotove),
        Text40: p.fakturace.hotove == 'no' ? 'Fakturovat:' : '',
        Text41: p.fakturace.hotove == 'no' ? t.get(p.fakturace.komu) : '',
        Text42: p.fakturace.hotove == 'no' ? t.get(p.fakturace.jak) : '',
        Text43: p.fakturace.komu == 'assemblyCompany' ? p.montazka.zastupce : endUserName(p.koncovyUzivatel),
        Podpis64: signature ? { x: 425, y: 170, page: 0, jpg: signature, maxHeight: 60 } : null,
    } satisfies Awaited<ReturnType<GetPdfData<'SP'>>>;
};
export default pdfSP;

const formatovatCerpadla = (a: string[]) => a.join('; ');//[a.slice(0, 2).join('; '), a.slice(2, 4).join('; ')].join('\n');

export const pdfCP: GetPdfData<'CP'> = async ({ data: p }) => ({
    Text1: `${p.koncovyUzivatel.prijmeni} ${p.koncovyUzivatel.jmeno}`,
    Text2: `${p.mistoRealizace.ulice}, ${p.mistoRealizace.psc} ${p.mistoRealizace.obec}`,
    Text3: dateFromISO(p.zasah.datum),
});

export const pdfPS: GetPdfData<'PS'> = async ({ data: p }) => {
    const system = p.system.popis;
    const zavada = p.zasah.nahlasenaZavada;
    const zasah = p.zasah.popis;
    return {
        Text1: [
            multilineTooLong(system) ? 'Popis systému:\n' + system : '',
            inlineTooLong(zavada) ? 'Nahlášená závada: ' + zavada : '',
            multilineTooLong(zasah) ? 'Popis zásahu:\n' + zasah : '',
        ].filter(Boolean).join('\n\n'),
    };
};