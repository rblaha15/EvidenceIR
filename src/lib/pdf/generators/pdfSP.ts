// noinspection JSNonASCIINames

import { dateFromISO } from '$lib/helpers/date';
import '$lib/extensions';
import { endUserName, endUserName2, spName } from '$lib/helpers/ir';
import { generalizeServiceProtocol, type GetPdfData, pdfInfo } from '$lib/pdf/pdf';
import { get } from '$lib/translations';
import { unknownCRN } from '$lib/forms/IN/formIN';
import { inlineTooLong, invoiceableParts, multilineTooLong } from '$lib/forms/SP/defaultSP';
import ares from '$lib/helpers/ares';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import type { Raw } from '$lib/forms/Form';
import type { GenericFormSP } from '$lib/forms/SP/formSP.svelte';

const prices = {
    transportation: 12 / 1.21,
    work: 800 / 1.21,
    regulusRoute: 1_000 / 1.21,
    installationApproval: 3_000 / 1.21,
    extendedWarranty: 6_000 / 1.21,
    commissioningTC: 4_000 / 1.21,
    commissioningHPInCascade: 1_600 / 1.21,
    commissioningSOL: 2_000 / 1.21,
    commissioningFVE: 2_000 / 1.21,
    yearlyHPCheck: 3_000 / 1.21,
    yearlyHPInCascadeCheck: 1_200 / 1.21,
    yearlySOLCheck: 1_500 / 1.21,
    withoutCode: 0,
} as const;

const codes = {
    assemblyWork: 18261,
    technicalAssistance: 12510,
    assemblyWork12: 20486,
    regulusRoute: 14343,
    installationApproval: 14846,
    extendedWarranty: 14847,
    commissioningTC: 9786,
    commissioningHPInCascade: 21840,
    commissioningSOL: 9785,
    commissioningFVE: 21665,
    yearlyHPCheck: 9787,
    yearlyHPInCascadeCheck: 21829,
    yearlySOLCheck: 9782,
    withoutCode: 0,
} as const;

const fieldsOperations = [
    { type: 'Kombinované pole32', code: 'Text25', price: 'Text24', amount: 'Text23' }, // Shared with work
    { type: 'Kombinované pole33', code: 'Text26', price: 'Text36', amount: 'Text84' },
    { type: 'Kombinované pole34', code: 'Text27', price: 'Text37', amount: 'Text85' },
    { type: 'Kombinované pole35', code: 'Text28', price: 'Text38', amount: 'Text86' },
];

const fieldsPartsStart = 44;
export const fieldsParts = (['name', 'code', 'amount', 'warehouse', 'price'] as const)
    .associateWith((_, i) => fieldsPartsStart + i * 8);

export const calculateProtocolPrice = <D extends GenericFormSP<D>>(p: Raw<D>, pumpCount: number | undefined) => {
    const spareParts = [
        p.nahradniDil1, p.nahradniDil2, p.nahradniDil3, p.nahradniDil4,
        p.nahradniDil5, p.nahradniDil6, p.nahradniDil7, p.nahradniDil8,
    ].slice(0, p.nahradniDily.pocet);
    const ip = invoiceableParts.associateWith(it => !p.fakturace.invoiceParts?.includes(it)).let(ip => ({
        ...ip, yearlyHPInCascadeCheck: ip.yearlyHPCheck, commissioningHPInCascade: ip.commissioningTC,
    }));

    const priceTransportation = ip.transportation ? prices.transportation * Number(p.ukony.doprava) : 0;
    const priceWork = p.ukony.typPrace && ip.work ? prices.work * Number(p.ukony.doba) : 0;
    const operationsWithCascades = p.ukony.ukony.flatMap(type => [
        ...type == 'yearlyHPCheck' && (pumpCount ?? 1) > 1 ? [['yearlyHPCheck', 1 as number] as const, ['yearlyHPInCascadeCheck', pumpCount! - 1] as const]
            : type == 'commissioningTC' && (pumpCount ?? 1) > 1 ? [['commissioningTC', 1 as number] as const, ['commissioningHPInCascade', pumpCount! - 1] as const]
                : [[type, 1 as number] as const],
    ]);
    const priceOperations = operationsWithCascades.sumBy(([type, count]) => ip[type] ? prices[type] * count : 0);
    const priceParts = spareParts.sumBy(dil => Number(dil.unitPrice) * Number(dil.mnozstvi));
    const priceWithoutDiscount = priceTransportation + priceWork + priceOperations + priceParts;
    const discount = Math.min(p.fakturace.discount?.toNumber() ?? 0, priceWithoutDiscount);
    const priceOther = priceOperations + priceParts - discount;
    const sum = priceTransportation + priceWork + priceOther;
    const tax = p.ukony.typPrace == 'assemblyWork12' ? 1.12 : 1.21;
    const sumWithTax = sum * tax;
    const isFree = sumWithTax < 1.0;
    return { spareParts, ip, priceTransportation, priceWork, operationsWithCascades, discount, priceOther, sum, tax, sumWithTax, isFree };
};

export const pdfNSP: GetPdfData<'NSP'> = async ({ data, t, addDoc, pumpCount }) => {
    const { NSP } = data;
    const ts = t.sp;
    const assemblyCompany = await ares.getNameAndAddress(NSP.montazka.ico, fetch);
    const {
        spareParts,
        ip,
        priceTransportation,
        priceWork,
        operationsWithCascades,
        discount,
        priceOther,
        sum,
        tax,
        sumWithTax,
        isFree,
    } = calculateProtocolPrice(NSP, pumpCount);
    let response: Response;
    try {
        response = await fetch(`/signatures/${NSP.zasah.inicialy}.jpg`);
    } catch (_: unknown) {
        response = new Response(null, { status: 400 });
    }
    const signature = response.ok && !response.redirected ? await response.arrayBuffer() : null;

    const system = NSP.system.popis;
    const zavada = NSP.zasah.nahlasenaZavada;
    const zasah = NSP.zasah.popis;
    if (multilineTooLong(system) || inlineTooLong(zavada) || multilineTooLong(zasah))
        await addDoc({ args: pdfInfo.PS, data, lang: 'cs' });

    if (tax == 1.12) await addDoc({ args: pdfInfo.CP, data, lang: 'cs' });

    const isUnknown = NSP.montazka.ico == unknownCRN;
    const fo = NSP.ukony.typPrace ? fieldsOperations.slice(1) : fieldsOperations;
    return {
        fileNameSuffix: spName(NSP.zasah).replaceAll(/\/:/g, '_'),
        Text1: spName(NSP.zasah),
        Text29: NSP.koncovyUzivatel.typ == 'company' ? `${t.in.companyName}:` : `Jméno a příjmení:`,
        Text2: endUserName(NSP.koncovyUzivatel),
        Text30: NSP.koncovyUzivatel.typ == 'company' ? t.in.crn : t.in.birthday,
        Text3: NSP.koncovyUzivatel.typ == 'company'
            ? NSP.koncovyUzivatel.ico : NSP.koncovyUzivatel.narozeni.length == 0 ? null : NSP.koncovyUzivatel.narozeni,
        Text4: `${NSP.bydliste.ulice}, ${NSP.bydliste.psc} ${NSP.bydliste.obec}`,
        Text5: NSP.koncovyUzivatel.telefon,
        Text6: NSP.koncovyUzivatel.email,
        Text7: assemblyCompany?.obchodniJmeno ?? null,
        Text8: isUnknown ? null : NSP.montazka.ico,
        Text9: isUnknown ? null : NSP.montazka.zastupce,
        Text10: isUnknown ? null : assemblyCompany?.sidlo.textovaAdresa ?? null,
        Text11: isUnknown ? null : NSP.montazka.telefon,
        Text12: isUnknown ? null : NSP.montazka.email,
        Text13: NSP.koncovyUzivatel.pobocka
            ? `${NSP.koncovyUzivatel.pobocka}, ${NSP.mistoRealizace.ulice}, ${NSP.mistoRealizace.psc} ${NSP.mistoRealizace.obec}`
            : `${NSP.mistoRealizace.ulice}, ${NSP.mistoRealizace.psc} ${NSP.mistoRealizace.obec}`,
        Text14: multilineTooLong(system) ? ts.seeSecondPage : system,
        Text15: '     ' + dateFromISO(NSP.zasah.datum),
        Text16: NSP.system.datumUvedeni ? dateFromISO(NSP.system.datumUvedeni) : null,
        Text17: NSP.zasah.clovek,
        'Zaškrtávací pole28': NSP.system.zaruka == `warrantyCommon`,
        'Zaškrtávací pole29': NSP.system.zaruka == `warrantyExtended`,
        Text19: inlineTooLong(zavada) ? ts.seeSecondPage : zavada,
        Text20: multilineTooLong(zasah) ? ts.seeSecondPage : zasah,
        Text21: NSP.ukony.doprava.toNumber().roundTo(2).toLocaleString('cs') + ' km',
        Text22: ip.transportation ? prices.transportation.roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč',
        'Kombinované pole32': get(ts, NSP.ukony.typPrace) || ts.intervention,
        Text25: NSP.ukony.typPrace ? codes[NSP.ukony.typPrace].toString().let(k => k == '0' ? '' : k) : '',
        Text23: NSP.ukony.typPrace ? NSP.ukony.doba.toNumber().roundTo(2).toLocaleString('cs') + ' h' : '',
        Text87: NSP.zasah.interventionDuration
            ? NSP.zasah.interventionDuration.toNumber().roundTo(2).toLocaleString('cs') + ' h' : '',
        Text24: NSP.ukony.typPrace ? ip.work ? prices.work.roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč' : '',
        ...fo.map(p => [p.type, ' '] as const).toRecord(),
        ...operationsWithCascades.map(([type, count], i) => [
            [fo[i].type, get(ts, type)],
            [fo[i].price, ip[type] ? prices[type].roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč'],
            [fo[i].code, codes[type].toString()],
            [fo[i].amount, count > 1 ? count + ' ks' : ''],
        ] as const).flat().toRecord(),
        ...spareParts.map((dil, i) => [
            [`Text${fieldsParts.name + i}`, dil.name],
            [`Text${fieldsParts.code + i}`, dil.code],
            [`Text${fieldsParts.amount + i}`, dil.mnozstvi.toNumber().roundTo(2).toLocaleString('cs') + ' ks'],
            [`Text${fieldsParts.warehouse + i}`, dil.warehouse],
            [`Text${fieldsParts.price + i}`, Number(dil.unitPrice).roundTo(2).toLocaleString('cs') + ' Kč'],
        ] as const).flat().toRecord(),
        ...(spareParts.length == 8 || discount == 0 ? {} : {
            [`Text${fieldsParts.name + 7}`]: 'Sleva',
            [`Text${fieldsParts.price + 7}`]: (-discount).roundTo(2).toLocaleString('cs') + ' Kč',
        }),
        Text31: priceTransportation.roundTo(2).toLocaleString('cs') + ' Kč',
        Text32: priceWork.roundTo(2).toLocaleString('cs') + ' Kč',
        Text33: priceOther.roundTo(2).toLocaleString('cs') + ' Kč',
        Text34: sum.roundTo(2).toLocaleString('cs') + ' Kč',
        Text18: (tax * 100 - 100).toFixed(0) + ' %',
        Text35: sumWithTax.roundTo(2).toLocaleString('cs') + ' Kč',
        Text39: isFree ? 'Zdarma' : get(ts, NSP.fakturace.hotove),
        Text41: NSP.fakturace.hotove != 'no' || isFree ? ''
            : NSP.fakturace.komu.chosen == 'otherCompany' ? detectCRN(NSP.fakturace.komu.text)
                : NSP.fakturace.komu.chosen == 'commissioningCompany' ? (await ares.getName(NSP.uvedeni.ico) || NSP.uvedeni.ico)
                    : get(ts, NSP.fakturace.komu.chosen),
        Text42: NSP.fakturace.hotove == 'no' && !isFree ? get(ts, NSP.fakturace.jak) : '',
        Text43: {
            assemblyCompany: NSP.montazka.zastupce,
            commissioningCompany: NSP.uvedeni.zastupce,
            investor: {
                individual: endUserName(NSP.koncovyUzivatel),
                company: NSP.koncovyUzivatel.kontaktniOsoba,
            }[NSP.koncovyUzivatel.typ!],
            otherCompany: detectCRN(NSP.fakturace.komu.text),
        }[NSP.fakturace.komu.chosen ?? 'investor'],
        images: signature ? [{ x: 425, y: 170, page: 0, jpg: signature, maxHeight: 60 }] : [],
    } satisfies Awaited<ReturnType<GetPdfData<'SP'>>>;
};

const detectCRN = (text: string) => /^[0-9]{8}$/.test(text) ? `IČO: ${text}` : text

export const pdfSP: GetPdfData<'SP'> = async ({ data, t, addDoc, index, lang }) =>
    pdfNSP({
        data: generalizeServiceProtocol(data.meta, data.IN, data.SPs[index], t), t, addDoc, lang,
        pumpCount: cascadePumps(data.IN).length,
    });
export default pdfSP;

export const pdfCP: GetPdfData<'CP'> = async ({ data: { NSP } }) => ({
    Text1: endUserName2(NSP.koncovyUzivatel),
    Text2: `${NSP.mistoRealizace.ulice}, ${NSP.mistoRealizace.psc} ${NSP.mistoRealizace.obec}`,
    Text3: dateFromISO(NSP.zasah.datum),
});

export const pdfPS: GetPdfData<'PS'> = async ({ data: { NSP }, t }) => {
    const ts = t.sp;
    const system = NSP.system.popis;
    const zavada = NSP.zasah.nahlasenaZavada;
    const zasah = NSP.zasah.popis;
    return {
        Text1: [
            multilineTooLong(system) ? `${ts.systemDescription}:\n${system}` : '',
            inlineTooLong(zavada) ? `${ts.reportedFault}: ${zavada}` : '',
            multilineTooLong(zasah) ? `${ts.interventionDescription}:\n${zasah}` : '',
        ].filter(Boolean).join('\n\n'),
    };
};