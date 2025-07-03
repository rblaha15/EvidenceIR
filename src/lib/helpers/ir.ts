import { removePlain } from '$lib/translations';
import type { Data, UserData } from '$lib/forms/Data';
import type { Raw } from '$lib/forms/Form';
import type { GenericDataSP } from '$lib/forms/SP.svelte';
import type { DataSP2 } from '$lib/forms/SP2';

/**
 * IR14CTC R8 2547 : Novák Jan - Brno
 * IR RegulusBOX CTC R8 2547 : Novák Jan - Brno
 * SRS1 T : Novák Jan - Brno
 */
export const irWholeName = (evidence: Raw<Data>, includeEstablishment: boolean = true) =>
    `${irName(evidence.ir)} : ${irLabel(evidence, includeEstablishment)}`;

/**
 * RB 2024/12/31-23 : Novák Jan - Brno
 */
export const spWholeName = (sp: Raw<DataSP2>, includeEstablishment: boolean = true) =>
    `${spName(sp.zasah)} : ${irLabel(sp, includeEstablishment)}`;

/**
 * IR14CTC R8 2547
 * IR RegulusBOX CTC R8 2547
 * SRS1 T
 */
export const irName = (ir: Raw<Data>['ir']) => ir.typ.first?.includes('SOREL')
    ? irType(ir.typ)
    : `${irType(ir.typ)} ${ir.cislo}`;

/**
 * RB 2024/12/31-23
 */
export const spName = (zasah: Raw<GenericDataSP<never>>["zasah"]) => {
    const datum = zasah.datum.split('T')[0].replaceAll('-', '/');
    const hodina = zasah.datum.split('T')[1].split(':')[0];
    const minuta = zasah.datum.split('T')[1].split(':')[1];
    const technik = zasah.inicialy;
    return `${technik} ${datum}-${hodina}:${minuta}`;
};

/**
 * IR14CTC
 * IR RegulusBOX CTC
 * SRS1 T
 */
export const irType = (typ: Raw<Data>['ir']['typ']) =>
    typ.first?.includes('SOREL')
        ? removePlain(typ.second!)
        : typ.first?.includes('BOX')
            ? `${removePlain(typ.first!.split(' ').slice(0, 2).join(' '))} ${removePlain(typ.second!)}`
            : `${removePlain(typ.first!.replaceAll(' ', ''))}${removePlain(typ.second!)}`;

const companyForms = [
    's.r.o.', 'spol. s r.o.', 'a.s.', 'k.s.', 'v.o.s.'
];
const removeCompanyForm = (name: string) => companyForms.reduce((name, typ) => name.replace(typ, '').trimEnd().replace(/,$/, ''), name);

const onlyLetters = (type: string) => type.replaceAll(/[^a-z]/g, '');

export const isCompanyFormInvalid = (company: string) =>
    companyForms.some(type =>
        onlyLetters(company).endsWith(onlyLetters(type))
    ) && !companyForms.some(type =>
        company.endsWith(type)
    );

const s = (s: string) => s ? `(${s}) ` : '';

/**
 * Novák Jan - Brno
 */
export const irLabel = <D extends UserData<D>>(evidence: Raw<UserData<D>>, includeEstablishment: boolean = true) => evidence.koncovyUzivatel.typ == `company`
    ? `${removeCompanyForm(evidence.koncovyUzivatel.nazev)} ${s(includeEstablishment ? evidence.koncovyUzivatel.pobocka : '')}- ${evidence.mistoRealizace.obec}`
    : `${evidence.koncovyUzivatel.prijmeni} ${evidence.koncovyUzivatel.jmeno} - ${evidence.mistoRealizace.obec}`;

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

export const endUserName = (k: Raw<Data>['koncovyUzivatel']) =>
    k.typ == 'company' ? k.nazev : `${k.jmeno} ${k.prijmeni}`;

/**
 * 2: IR 12;
 * 4: IR 14;
 * 3: IR 34;
 * B: BOX/HBOX/HBOXK;
 * S: SOREL;
 */
export type IRType = '2' | '4' | '3' | 'B' | 'S';
/**
 * Zastaralé IR ID: A12345;
 * Moderní IR ID:  4A12345;
 * ID SOREL:       S202412312359;
 */
export type IRID = `${IRType}${string}`;
/**
 * Zastaralé SP ID: RB-2024-12-31-23;
 * Moderní SP ID:   RB-2024-12-31-23-59;
 */
export type SPID = `${string}-${string}-${string}`;

const extractIRTypeFromFullIRType = (fullIRType: string): IRType =>
    (fullIRType.includes('12') ? '2'
        : fullIRType.includes('14') ? '4'
            : fullIRType.includes('34') ? '3'
                : fullIRType.includes('BOX') ? 'B'
                    : fullIRType.includes('SOREL') ? 'S'
                        : undefined)!;
export const extractIRIDFromParts = (fullIRType: string, irNumber: string): IRID =>
    `${extractIRTypeFromFullIRType(fullIRType)}${irNumber.replaceAll(/[ :T-]/g, '')}`;
export const extractIRIDFromRawData = (evidence: Raw<Data>): IRID =>
    extractIRIDFromParts(evidence.ir.typ.first!, evidence.ir.cislo);
export const extractSPIDFromRawData = (zasah: Raw<GenericDataSP<never>['zasah']>): SPID => {
    const datum = zasah.datum.split('T')[0];
    const hodina = zasah.datum.split('T')[1].split(':')[0];
    const minuta = zasah.datum.split('T')[1].split(':')[1];
    const technik = zasah.inicialy;
    return `${technik}-${datum}-${hodina}-${minuta}`;
};