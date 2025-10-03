// noinspection JSNonASCIINames

import { dateFromISO } from '$lib/helpers/date';
import '$lib/extensions';
import { endUserName, endUserName2, spName } from '$lib/helpers/ir';
import { generalizeServiceProtocol, type GetPdfData, pdfInfo } from '$lib/pdf/pdf';
import { get } from '$lib/translations';
import { unknownCompany } from '$lib/forms/IN/formIN';
import { inlineTooLong, invoiceableParts, multilineTooLong } from '$lib/forms/SP/defaultSP';
import ares from '$lib/helpers/ares';

const prices = {
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

const codes = {
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

const fieldsOperations = [
    { type: 'Kombinované pole33', code: 'Text26', price: 'Text36', amount: 'Text84' },
    { type: 'Kombinované pole34', code: 'Text27', price: 'Text37', amount: 'Text85' },
    { type: 'Kombinované pole35', code: 'Text28', price: 'Text38', amount: 'Text86' },
];

const fieldsPartsStart = 44;
const fieldsParts = (['name', 'code', 'amount', 'warehouse', 'price'] as const)
    .associateWith((_, i) => fieldsPartsStart + i * 8);

export const pdfNSP: GetPdfData<'NSP'> = async ({ data: p, t, addDoc }) => {
    const ts = t.sp;
    console.log(p);
    const ip = invoiceableParts.associateWith(it => p.fakturace.invoiceParts.includes(it));
    const assemblyCompany = await ares.getNameAndAddress(p.montazka.ico, fetch);
    const spareParts = [
        p.nahradniDil1, p.nahradniDil2, p.nahradniDil3, p.nahradniDil4,
        p.nahradniDil5, p.nahradniDil6, p.nahradniDil7, p.nahradniDil8,
    ].slice(0, p.nahradniDily.pocet);
    const priceTransportation = ip.transportation ? prices.transportation * Number(p.ukony.doprava) : 0;
    const priceWork = p.ukony.typPrace && ip.work ? prices.work * Number(p.ukony.doba) : 0;
    const priceOperations = p.ukony.ukony.sumBy(type =>
        ip[type] ? prices[type] * (type == 'commissioningTC' || type == 'yearlyHPCheck' ? p.system.pocetTC : 1) : 0,
    );
    const priceParts = spareParts.sumBy(dil => Number(dil.unitPrice) * Number(dil.mnozstvi));
    const priceOther = priceOperations + priceParts;
    const sum = priceTransportation + priceWork + priceOther;
    const tax = p.ukony.typPrace == 'technicalAssistance12' ? 1.12 : 1.21;
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

    const isUnknown = p.montazka.ico == unknownCompany.crn;
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
        Text15: dateFromISO(p.zasah.datum),
        Text16: p.zasah.datumUvedeni ? dateFromISO(p.zasah.datumUvedeni) : null,
        Text17: p.zasah.clovek,
        'Zaškrtávací pole28': p.zasah.zaruka == `warrantyCommon`,
        'Zaškrtávací pole29': p.zasah.zaruka == `warrantyExtended`,
        Text19: inlineTooLong(zavada) ? ts.seeSecondPage : zavada,
        Text20: multilineTooLong(zasah) ? ts.seeSecondPage : zasah,
        Text21: p.ukony.doprava + ' km',
        Text22: ip.transportation ? prices.transportation.roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč',
        'Kombinované pole32': get(ts, p.ukony.typPrace) || ts.intervention,
        Text25: p.ukony.typPrace ? codes[p.ukony.typPrace].toString().let(k => k == '0' ? '' : k) : '',
        Text23: p.ukony.doba + ' h',
        Text24: p.ukony.typPrace ? ip.work ? prices.work.roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč' : '',
        ...fieldsOperations.map(p => [p.type, ' '] as const).toRecord(),
        ...p.ukony.ukony.map((type, i) => [
            [fieldsOperations[i].type, get(ts, type)],
            [fieldsOperations[i].price, ip[type] ? prices[type].roundTo(2).toLocaleString('cs') + ' Kč' : '0 Kč'],
            [fieldsOperations[i].code, codes[type].toString()],
            [fieldsOperations[i].amount, type == 'commissioningTC' || type == 'yearlyHPCheck' ? p.system.pocetTC + ' ks' : ''],
        ] as const).flat().toRecord(),
        ...spareParts.map((dil, i) => [
            [`Text${fieldsParts.name + i}`, dil.name],
            [`Text${fieldsParts.code + i}`, dil.code],
            [`Text${fieldsParts.amount + i}`, dil.mnozstvi + ' ks'],
            [`Text${fieldsParts.warehouse + i}`, dil.warehouse],
            [`Text${fieldsParts.price + i}`, Number(dil.unitPrice).roundTo(2).toLocaleString('cs') + ' Kč'],
        ] as const).flat().toRecord(),
        Text31: priceTransportation.roundTo(2).toLocaleString('cs') + ' Kč',
        Text32: priceWork.roundTo(2).toLocaleString('cs') + ' Kč',
        Text33: priceOther.roundTo(2).toLocaleString('cs') + ' Kč',
        Text34: sum.roundTo(2).toLocaleString('cs') + ' Kč',
        Text18: `${(tax * 100 - 100).toFixed(0)} %`,
        Text35: (sum * tax).roundTo(2).toLocaleString('cs') + ' Kč',
        Text39: get(ts, p.fakturace.hotove),
        Text40: p.fakturace.hotove == 'no' ? `${ts.invoice}:` : '',
        Text41: p.fakturace.hotove == 'no' ? get(ts, p.fakturace.komu) : '',
        Text42: p.fakturace.hotove == 'no' ? get(ts, p.fakturace.jak) : '',
        Text43: p.fakturace.komu == 'assemblyCompany' ? p.montazka.zastupce : endUserName(p.koncovyUzivatel),
        images: signature ? [{ x: 425, y: 170, page: 0, jpg: signature, maxHeight: 60 }] : [],
    } satisfies Awaited<ReturnType<GetPdfData<'SP'>>>;
};

export const pdfSP: GetPdfData<'SP'> = async ({ data: { evidence: e, installationProtocols, uvedeniTC: u }, t, addDoc, index, lang }) =>
    pdfNSP({
        data: generalizeServiceProtocol(e, installationProtocols[index], u, t), t, addDoc, lang,
    });
export default pdfSP;

//[a.slice(0, 2).join('; '), a.slice(2, 4).join('; ')].join('\n');
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