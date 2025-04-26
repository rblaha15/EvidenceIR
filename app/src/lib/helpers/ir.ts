import type { Pair } from '$lib/Widget.svelte.js';
import { removePlain } from '$lib/translations';
import type { Data, UserData } from '$lib/forms/Data';
import type { Raw } from '$lib/forms/Form';
import type { IRID, SPID } from '$lib/client/firestore';
import type { DataSP2 } from '$lib/forms/SP2';
import type { GenericDataSP } from '$lib/forms/SP.svelte';

export const isIRID = (irid_spid: string): irid_spid is IRID => !irid_spid.includes('-');
export const isSPID = (irid_spid: string): irid_spid is SPID => irid_spid.includes('-');

/**
 * IR14CTC R8 2547 : Novák Jan - Brno
 * IR RegulusBOX CTC R8 2547 : Novák Jan - Brno
 * SRS1 T : Novák Jan - Brno
 */
export const celyNazevIR = (evidence: Raw<Data>, includeEstablishment: boolean = true) =>
    `${nazevIR(evidence.ir)} : ${popisIR(evidence, includeEstablishment)}`;

/**
 * RB 2024/12/31-23 : Novák Jan - Brno
 */
export const celyNazevSP = (sp: Raw<DataSP2>, includeEstablishment: boolean = true) =>
    `${nazevSP(sp.zasah)} : ${popisIR(sp, includeEstablishment)}`;

/**
 * IR14CTC R8 2547
 * IR RegulusBOX CTC R8 2547
 * SRS1 T
 */
export const nazevIR = (ir: Raw<Data>['ir']) => ir.typ.first?.includes('SOREL')
    ? typIR(ir.typ)
    : `${typIR(ir.typ)} ${ir.cislo}`;

/**
 * RB 2024/12/31-23
 */
export const nazevSP = (zasah: Raw<GenericDataSP<never>>["zasah"]) => {
    const datum = zasah.datum.split('T')[0].replaceAll('-', '/');
    const hodina = zasah.datum.split('T')[1].split(':')[0];
    const technik = zasah.inicialy;
    return `${technik} ${datum}-${hodina}`;
};

/**
 * IR14CTC
 * IR RegulusBOX CTC
 * SRS1 T
 */
export const typIR = (typ: Pair) =>
    typ.first?.includes('SOREL')
        ? removePlain(typ.second!)
        : typ.first?.includes('BOX')
            ? `${removePlain(typ.first!.split(' ').slice(0, 2).join(' '))} ${removePlain(typ.second!)}`
            : `${removePlain(typ.first!.replaceAll(' ', ''))}${removePlain(typ.second!)}`;

const formySpolecnosti = [
    's.r.o.', 'spol. s r.o.', 'a.s.', 'k.s.', 'v.o.s.'
];
const odebratFormuSpolecnosti = (nazev: string) => formySpolecnosti.reduce((nazev, typ) => nazev.replace(typ, '').trimEnd().replace(/,$/, ''), nazev);

const jenPismena = (typ: string) => typ.replaceAll(/[^a-z]/g, '');

export const formaSpolecnostiJeSpatne = (spolecnost: string) =>
    formySpolecnosti.some(typ =>
        jenPismena(spolecnost).endsWith(jenPismena(typ))
    ) && !formySpolecnosti.some(typ =>
        spolecnost.endsWith(typ)
    );

const m = (s: string) => s ? `(${s}) ` : '';

/**
 * Novák Jan - Brno
 */
export const popisIR = <D extends UserData<D>>(evidence: Raw<UserData<D>>, includeEstablishment: boolean = true) => evidence.koncovyUzivatel.typ == `company`
    ? `${odebratFormuSpolecnosti(evidence.koncovyUzivatel.nazev)} ${m(includeEstablishment ? evidence.koncovyUzivatel.pobocka : '')}- ${evidence.bydliste.obec}`
    : `${evidence.koncovyUzivatel.prijmeni} ${evidence.koncovyUzivatel.jmeno} - ${evidence.bydliste.obec}`;

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

export const jmenoUzivatele = (k: Raw<Data>['koncovyUzivatel']) =>
    k.typ == 'company' ? k.nazev : `${k.jmeno} ${k.prijmeni}`;