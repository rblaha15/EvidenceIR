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
    yearlySOLCheck: 150 / 1.21,
    withoutCode: 0,
} as const;

const codes = {
    assemblyWork: 18261,
    technicalAssistance: 12510,
    technicalAssistance12: 20482,
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
    const tax = p.ukony.typPrace == 'technicalAssistance12' ? 1.12 : 1.21;
    const sumWithTax = sum * tax;
    const isFree = sumWithTax < 1.0
    return { spareParts, ip, priceTransportation, priceWork, operationsWithCascades, discount, priceOther, sum, tax, sumWithTax, isFree };
};

export const pdfNSP: GetPdfData<'NSP'> = async ({ data: p, t, addDoc, pumpCount }) => {
    const ts = t.sp;
    console.log(p);
    const assemblyCompany = await ares.getNameAndAddress(p.montazka.ico, fetch);
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
    } = calculateProtocolPrice(p, pumpCount);
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

    if (tax == 1.12) await addDoc({ args: pdfInfo.CP, data: p, lang: 'cs' });

    const isUnknown = p.montazka.ico == unknownCRN;
    const fo = p.ukony.typPrace ? fieldsOperations.slice(1) : fieldsOperations;
    return {
        fileNameSuffix: spName(p.zasah).replaceAll(/\/:/g, '_'),
        Text1: spName(p.zasah),
        Text29: p.koncovyUzivatel.typ == 'company' ? `${t.in.companyName}:` : `${t.in.name} a ${t.in.surname.toLowerCase()}:`,
        Text2: endUserName(p.koncovyUzivatel),
        Text30: p.koncovyUzivatel.typ == 'company' ? t.in.crn : t.in.birthday,
        Text3: p.koncovyUzivatel.typ == 'company'
            ? p.koncovyUzivatel.ico : p.koncovyUzivatel.narozeni.length == 0 ? null : p.koncovyUzivatel.narozeni,
        Text4: `${p.bydliste.ulice}, ${p.bydliste.psc} ${p.bydliste.obec}`,
        Text5: p.koncovyUzivatel.telefon,
        Text6: p.koncovyUzivatel.email,
        Text7: assemblyCompany?.obchodniJmeno ?? null,
        Text8: isUnknown ? null : p.montazka.ico,
        Text9: isUnknown ? null : p.montazka.zastupce,
        Text10: isUnknown ? null : assemblyCompany?.sidlo.textovaAdresa ?? null,
        Text11: isUnknown ? null : p.montazka.telefon,
        Text12: isUnknown ? null : p.montazka.email,
        Text13: `${p.mistoRealizace.ulice}, ${p.mistoRealizace.psc} ${p.mistoRealizace.obec}`,
        Text14: multilineTooLong(system) ? ts.seeSecondPage : system,
        Text15: '     ' + dateFromISO(p.zasah.datum),
        Text16: p.system.datumUvedeni ? dateFromISO(p.system.datumUvedeni) : null,
        Text17: p.zasah.clovek,
        'Zaškrtávací pole28': p.system.zaruka == `warrantyCommon`,
        'Zaškrtávací pole29': p.system.zaruka == `warrantyExtended`,
        Text19: inlineTooLong(zavada) ? ts.seeSecondPage : zavada,
        Text20: multilineTooLong(zasah) ? ts.seeSecondPage : zasah,
        Text21: p.ukony.doprava.toNumber().roundTo(2).toLocaleString('cs') + ' km',
        Text22: ip.transportation ? prices.transportation.roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč',
        'Kombinované pole32': get(ts, p.ukony.typPrace) || ts.intervention,
        Text25: p.ukony.typPrace ? codes[p.ukony.typPrace].toString().let(k => k == '0' ? '' : k) : '',
        Text23: p.ukony.typPrace ? p.ukony.doba.toNumber().roundTo(2).toLocaleString('cs') + ' h' : '',
        Text87: p.zasah.interventionDuration
            ? p.zasah.interventionDuration.toNumber().roundTo(2).toLocaleString('cs') + ' h' : '',
        Text24: p.ukony.typPrace ? ip.work ? prices.work.roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč' : '',
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
        Text39: isFree ? 'Zdarma' : get(ts, p.fakturace.hotove),
        Text41: p.fakturace.hotove != 'no' || isFree ? ''
            : p.fakturace.komu.chosen == 'otherCompany' ? p.fakturace.komu.text
                : p.fakturace.komu.chosen == 'commissioningCompany' ? (await ares.getName(p.uvedeni.ico) || p.uvedeni.ico)
                    : get(ts, p.fakturace.komu.chosen),
        Text42: p.fakturace.hotove == 'no' && !isFree ? get(ts, p.fakturace.jak) : '',
        Text43: {
            assemblyCompany: p.montazka.zastupce,
            commissioningCompany: p.uvedeni.zastupce,
            investor: endUserName(p.koncovyUzivatel),
            otherCompany: p.fakturace.komu.text,
        }[p.fakturace.komu.chosen ?? 'investor'],
        images: signature ? [{ x: 425, y: 170, page: 0, jpg: signature, maxHeight: 60 }] : [],
    } satisfies Awaited<ReturnType<GetPdfData<'SP'>>>;
};

export const pdfSP: GetPdfData<'SP'> = async ({ data: { evidence: e, installationProtocols, uvedeniTC: u }, t, addDoc, index, lang }) =>
    pdfNSP({
        data: generalizeServiceProtocol(e, installationProtocols[index], u, t), t, addDoc, lang,
        pumpCount: cascadePumps(e).length,
    });
export default pdfSP;

export const pdfCP: GetPdfData<'CP'> = async ({ data: p }) => ({
    Text1: endUserName2(p.koncovyUzivatel),
    Text2: `${p.mistoRealizace.ulice}, ${p.mistoRealizace.psc} ${p.mistoRealizace.obec}`,
    Text3: dateFromISO(p.zasah.datum),
});

export const pdfPS: GetPdfData<'PS'> = async ({ data: p, t }) => {
    const ts = t.sp;
    const system = p.system.popis;
    const zavada = p.zasah.nahlasenaZavada;
    const zasah = p.zasah.popis;
    return {
        Text1: [
            multilineTooLong(system) ? `${ts.systemDescription}:\n${system}` : '',
            inlineTooLong(zavada) ? `${ts.reportedFault}: ${zavada}` : '',
            multilineTooLong(zasah) ? `${ts.interventionDescription}:\n${zasah}` : '',
        ].filter(Boolean).join('\n\n'),
    };
};