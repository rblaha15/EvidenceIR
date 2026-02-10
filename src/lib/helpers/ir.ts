import type { FormIN, IRTypes, UserForm } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import type { GenericFormSP } from '$lib/forms/SP/formSP.svelte.js';

import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { separatorsRegExp } from '$lib/forms/IN/defaultIN';
import type { IR } from '$lib/data';

/**
 * IR14CTC R8 2547 : Novák Jan - Brno
 *
 * IR RegulusBOX CTC R8 2547 : Novák Jan - Brno
 *
 * SRS1 T : Novák Jan - Brno
 */
export const irWholeName = (evidence: Raw<FormIN>, includeEstablishment: boolean = true) =>
    evidence.ir.typ.first == 'other' ? irLabel(evidence, includeEstablishment)
        : `${irName(evidence.ir)} : ${irLabel(evidence, includeEstablishment)}`;

/**
 * RB 2024/12/31-23 : Novák Jan - Brno
 */
export const spWholeName = (sp: Raw<FormNSP>, includeEstablishment: boolean = true) =>
    `${spName(sp.zasah)} : ${irLabel(sp, includeEstablishment)}`;

/**
 * IR14CTC R8 2547
 *
 * IR RegulusBOX CTC R8 2547
 *
 * EcoZenith 1234-1234-1234
 *
 * SRS1 T
 */
export const irName = (ir: Raw<FormIN>['ir']) =>
    ir.typ.first == 'other'
        ? ir.chceVyplnitK.includes('solarCollector') ? 'SOL'
            : ir.chceVyplnitK.includes('photovoltaicPowerPlant') ? 'FVE'
                : 'Jiný'
        : ir.typ.first == 'SOREL' ? irType(ir.typ)
            : `${irType(ir.typ)} ${ir.cislo}`;

export const irNumberFromIRID = (irid: IRID) =>
    type(irid) == 'S' ? 'SOREL'
        : type(irid) == 'O' ? '?'
            : type(irid) == 'C' ? `${irid.slice(1, 5)}-${irid.slice(5, 9)}-${irid.slice(9, 13)}`
                : !isMacIRID(irid) ? `${irid.slice(1, 3)} ${irid.slice(3, 7)}`
                    : `00:0A:0${irid[6]}:${irid[7] + irid[8]}:${irid[9] + irid[10]}:${irid[11] + irid[12]}`;

/**
 * RB 2024/12/31-23:59
 */
export const spName = (zasah: Raw<GenericFormSP<never>>['zasah']) => {
    const datum = zasah.datum.split('T')[0].replaceAll('-', '/');
    const hodina = zasah.datum.split('T')[1].split(':')[0];
    const minuta = zasah.datum.split('T')[1].split(':')[1];
    const technik = zasah.inicialy;
    return `${technik} ${datum}-${hodina}:${minuta}`;
};

/**
 * IR10CTC400
 *
 * IR14CTC
 *
 * IR30
 *
 * IR RegulusBOX CTC
 *
 * SRS1 T
 *
 * EcoZenith
 */
export const irType = (type: Raw<FormIN>['ir']['typ']) => ({
    'IR 10': 'IR10CTC400',
    'IR 12': 'IR12CTC',
    'IR 14': 'IR14' + type.second!,
    'IR 30': 'IR30',
    'IR 34': 'IR34' + type.second!,
    'IR RegulusBOX': `IR RegulusBOX ` + type.second!,
    'IR RegulusHBOX': `IR RegulusHBOX ` + type.second!,
    'IR RegulusHBOX K': `IR RegulusHBOXK ` + type.second!,
    'SOREL': type.second!,
    'ctc': type.second!,
    'Thermona': 'Thermona inTHERM',
    'other': '',
} as const)[type.first!];

export const companyForms = [
    's.r.o.', 'spol. s r.o.', 'a.s.', 'k.s.', 'v.o.s.',
];
const removeCompanyForm = (name: string) => companyForms.reduce((name, typ) => name.replace(typ, '').trimEnd().replace(/,$/, ''), name);

const onlyLetters = (type: string) => type.replaceAll(/[^a-z]/g, '');

export const isCompanyFormInvalid = (company: string) =>
    companyForms.some(type =>
        onlyLetters(company).endsWith(onlyLetters(type)),
    ) && !companyForms.some(type =>
        company.endsWith(type),
    );

const s = (s: string) => s ? `(${s}) ` : '';

/**
 * Novák Jan - Brno
 */
export const irLabel = <D extends UserForm<D>>(evidence: Raw<UserForm<D>>, includeEstablishment: boolean = true) => evidence.koncovyUzivatel.typ == `company`
    ? `${removeCompanyForm(evidence.koncovyUzivatel.nazev)} ${s(includeEstablishment ? evidence.koncovyUzivatel.pobocka : '')}- ${evidence.mistoRealizace.obec}`
    : `${evidence.koncovyUzivatel.prijmeni.split(',')[0]?.trim() || ''} ${evidence.koncovyUzivatel.jmeno.split('.').at(-1)?.trim() || ''} - ${evidence.mistoRealizace.obec}`;

export const typBOX = (cisloBOX: string) => ({
    '18054': 'BOX 12 CTC 3/3',
    '18928': 'BOX 12 CTC 3/3 EN',
    '18574': 'BOX 12 RTC 3/1S',
    '18930': 'BOX 12 RTC 3/1S EN',
    '20025': 'BOX 12 RTC 3/3S EN',
    '19816': 'BOX 12 RTC 3/3S',
    '20048': 'HBOX 112 CTC 3/3',
    '20050': 'HBOX 112 CTC 3/3 EN',
    '20049': 'HBOX 112 RTC 3/1S',
    '20051': 'HBOX 112 RTC 3/1S EN',
    '19896': 'HBOX 212 CTC 3/3',
    '20026': 'HBOX 212 CTC 3/3 EN',
    '19935': 'HBOX 212 RTC 3/1S',
    '20029': 'HBOX 212 RTC 3/1S EN',
    '20527': 'HBOX K 106 CTC 3/3',
    '20630': 'HBOX K 106 CTC 3/3 EN',
    '20528': 'HBOX K 106 RTC 3/1S',
    '20631': 'HBOX K 106 RTC 3/1S EN',
})[cisloBOX.slice(0, 5)];

export const endUserEmails = (k: Raw<FormIN>['koncovyUzivatel']) =>
    k.email.split(separatorsRegExp).map(t => t.trim());

export const endUserName = (k: Raw<FormIN>['koncovyUzivatel']) =>
    k.typ == 'company' ? k.nazev : `${k.jmeno} ${k.prijmeni}`;

export const endUserName2 = (k: Raw<FormIN>['koncovyUzivatel']) =>
    k.typ == 'company' ? k.nazev : `${k.prijmeni} ${k.jmeno}`;

type IRTypeDescriptions = {
    '0': 'IR 10';
    '2': 'IR 12';
    '4': 'IR 14';
    '1': 'IR 30';
    '3': 'IR 34';
    'B': 'BOX/HBOX/HBOXK';
    'S': 'SOREL';
    'C': 'CTC';
    'T': 'Thermona inTHERM';
    'O': 'Jiný';
}

export type IRType = keyof IRTypeDescriptions;
/**
 * MAC IR:        2000A1406FFFF (13);
 *
 * Moderní IR ID: 4A12345 (7);
 *
 * CTC:           C123412341234 (13);
 *
 * ID SOREL/FVE:  S202412312359 (13);
 */
export type IRID = `${IRType}${string}`;
/**
 * SP ID: RB-2024-12-31-23-59;
 */
export type SPID = `${string}-${string}-${string}`;

const type = (irid: IRID) => irid[0] as IRType;

export const spids = (spids: string) => spids.split(' ') as SPID[];

export const isMacIRID = (irid: IRID) => irid.startsWith('2000A1409') || irid.startsWith('0000A1406');
export const isMacAddress = (irNumber: string) => irNumber.startsWith('00:0A:14:0');

const extractIRTypeFromFullIRType = (fullIRType: IRTypes): IRType => ({
    'IR 10': '0',
    'IR 12': '2',
    'IR 14': '4',
    'IR 30': '1',
    'IR 34': '3',
    'IR RegulusBOX': 'B',
    'IR RegulusHBOX': 'B',
    'IR RegulusHBOX K': 'B',
    'SOREL': 'S',
    'ctc': 'C',
    'Thermona': 'T',
    'other': 'O',
} as const)[fullIRType];

export const extractIRIDFromParts = (fullIRType: IRTypes, irNumber: string): IRID =>
    `${extractIRTypeFromFullIRType(fullIRType)}${irNumber.replaceAll(/[ :T-]/g, '')}`;
export const extractIRIDFromRawData = (evidence: Raw<FormIN>): IRID =>
    extractIRIDFromParts(evidence.ir.typ.first!, evidence.ir.cislo);
export const extractSPIDFromRawData = (zasah: Raw<GenericFormSP<never>['zasah']>): SPID => {
    const datum = zasah.datum.split('T')[0] || '';
    const hodina = zasah.datum.split('T')[1]?.split(':')?.[0] || '';
    const minuta = zasah.datum.split('T')[1]?.split(':')?.[1] || '';
    const technik = zasah.inicialy.trim();
    return `${technik}-${datum}-${hodina}-${minuta}`;
};

export const supportsOnlyCTC = (t: IRTypes | null) => t == 'IR 10' || t == 'IR 12' || t == 'IR 30' || t == 'ctc';
export const supportsMACAddresses = (t: IRTypes | null) => t == 'IR 10' || t == 'IR 12' || t == 'IR 30';
export const isMACAddressTypeIR12 = (t: IRTypes | null) => t == 'IR 12' || t == 'IR 30';
export const isMACAddressTypeIR10 = (t: IRTypes | null) => t == 'IR 10';
export const isCTC = (t: IRTypes | null) => t == 'ctc';
export const doesNotSupportHeatPumps = (t: IRTypes | null) => t == 'other';
export const doesNotHaveIRNumber = (t: IR['IN']['ir']['typ']) => t.first == 'other' || t.first == 'SOREL' || (t.first == 'ctc' && t.second == 'EcoLogic EXT');
export const supportsRemoteAccess = (t: IRTypes | null) => t != 'other' && t != 'SOREL' && t != 'ctc' && t != 'Thermona';
export const isBox = (t: IRTypes | null) => t == 'IR RegulusBOX' || t == 'IR RegulusHBOX' || t == 'IR RegulusHBOX K';
export const hasIndoorUnit = (t: IRTypes | null) => isBox(t) || t == 'Thermona';
