import type { Pair } from '$lib/Vec.svelte';
import { removePlain } from '$lib/translations';
import type { RawData } from '$lib/Data';

export const celyNazevIR = (evidence: RawData) => `${nazevIR(evidence.ir)} : ${popisIR(evidence)}`;

export const nazevIR = (ir: RawData['ir']) => `${typIR(ir.typ)} ${ir.cislo}`;

export const typIR = (typ: Pair) =>
    typ.first?.includes('BOX')
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
    )

const m = (s: string) => s ? `${s} ` : ''

export const popisIR = (evidence: RawData) =>
    evidence.koncovyUzivatel.typ == `company`
        ? `${odebratFormuSpolecnosti(evidence.koncovyUzivatel.nazev)} ${m(evidence.koncovyUzivatel.pobocka)}- ${evidence.bydliste.obec}`
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

export const jmenoUzivatele = (k: RawData['koncovyUzivatel']) =>
    k.typ == 'company' ? k.nazev : `${k.jmeno} ${k.prijmeni}`