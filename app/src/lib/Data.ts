import defaultData from "./defaultData";
import { getTranslations, removePlain, type TranslationReference, type Translations } from './translations';
import {
	DvojVybiratkova,
	Vybiratkova,
	Pisatkova,
	Radiova,
	Nadpisova,
	Zaskrtavatkova,
	MultiZaskrtavatkova,
	Vec,
	Textova,
	type Pair,
	type Raw,
	SearchWidget
} from './Vec.svelte';
import type { Company, Technician } from '$lib/client/realtime';

export type Data = {
	ir: {
		typ: DvojVybiratkova<Data>;
		cislo: Pisatkova<Data>;
		cisloBox: Pisatkova<Data>;
		chceVyplnitK: MultiZaskrtavatkova<Data>;
	};
	tc: {
		nadpis: Nadpisova<Data>;
		poznamka: Textova<Data>;
		typ: Radiova<Data>;
		model: Vybiratkova<Data>;
		cislo: Pisatkova<Data>;
		model2: Vybiratkova<Data>;
		cislo2: Pisatkova<Data>;
		model3: Vybiratkova<Data>;
		cislo3: Pisatkova<Data>;
		model4: Vybiratkova<Data>;
		cislo4: Pisatkova<Data>;
	};
	sol: {
		title: Nadpisova<Data>;
		typ: Pisatkova<Data>;
		pocet: Pisatkova<Data>;
	};
	koncovyUzivatel: {
		nadpis: Nadpisova<Data>;
		typ: Radiova<Data>;
		prijmeni: Pisatkova<Data>;
		jmeno: Pisatkova<Data>;
		narozeni: Pisatkova<Data>;
		nazev: Pisatkova<Data>;
		pobocka: Pisatkova<Data>;
		ico: Pisatkova<Data>;
		telefon: Pisatkova<Data>;
		email: Pisatkova<Data>;
	};
	bydliste: {
		nadpis: Nadpisova<Data>;
		obec: Pisatkova<Data>;
		ulice: Pisatkova<Data>;
		psc: Pisatkova<Data>;
	};
	mistoRealizace: {
		nadpis: Nadpisova<Data>;
		jakoBydliste: Zaskrtavatkova<Data>;
		obec: Pisatkova<Data>;
		ulice: Pisatkova<Data>;
		psc: Pisatkova<Data>;
	};
	montazka: {
		nadpis: Nadpisova<Data>;
		company: SearchWidget<Data, Company>;
		nebo: Textova<Data>;
		ico: Pisatkova<Data>;
		zastupce: Pisatkova<Data>;
		email: Pisatkova<Data>;
		telefon: Pisatkova<Data>;
	};
	uvedeni: {
		nadpis: Nadpisova<Data>;
		jakoMontazka: Zaskrtavatkova<Data>;
		company: SearchWidget<Data, Company>;
		nebo: Textova<Data>;
		ico: Pisatkova<Data>;
		regulus: SearchWidget<Data, Technician>;
		zastupce: Pisatkova<Data>;
		email: Pisatkova<Data>;
		telefon: Pisatkova<Data>;
	};
	vzdalenyPristup: {
		nadpis: Nadpisova<Data>;
		chce: Zaskrtavatkova<Data>;
		pristupMa: MultiZaskrtavatkova<Data>;
		plati: Radiova<Data>;
	};
	ostatni: {
		zodpovednaOsoba: Pisatkova<Data>;
		poznamka: Pisatkova<Data>;
	};
}

export const rawDataToData = (toData: Data, rawData: RawData) => {
	const d = toData as GeneralData

	Object.entries(rawData).map(a =>
		a as [keyof Data, RawData[keyof RawData]]
	).forEach(([key1, section]) =>
		Object.entries(section).map(a =>
			a as [string, any]
		).forEach(([key2, value]) => {
			if (d[key1] == undefined) return
			if (d[key1][key2] == undefined) d[key1][key2] = (defaultData()[key1] as GeneralData[string])[key2]
			else d[key1][key2].value = value
		})
	)

	return d as Data
}

export const newData = () => defaultData()

export type RawData = Raw<Data>
export type GeneralData = Record<string, Record<string, Vec<Data, any>>>

export const dataToRawData = (data: Data): RawData => {
	const dataEntries = Object.entries(data);
	const rawDataEntries = dataEntries.map(([key, subData]) => {
		const subDataEntries = Object.entries(subData) as [string, Vec<Data, any>][];
		const rawSubDataEntries = subDataEntries.map(([subKey, vec]) => {
			if (vec == undefined) return undefined;
			if (vec.value == undefined) return undefined;
			else return [subKey, vec.value] as const;
		}).filter(it => it != undefined);
		const rawSubData = Object.fromEntries(rawSubDataEntries);
		return [key, rawSubData] as const;
	});
	return Object.fromEntries(rawDataEntries) as RawData;
};

export const celyNazevIR = (evidence: RawData) => `${nazevIR(evidence.ir)} : ${popisIR(evidence)}`
export const nazevIR = (ir: RawData['ir']) => `${typIR(ir.typ)} ${ir.cislo}`

export const typIR = (typ: Pair) =>
	typ.first?.includes('BOX')
		? `${removePlain(typ.first!.split(' ').slice(0, 2).join(' '))} ${removePlain(typ.second!)}`
		: `${removePlain(typ.first!.replaceAll(' ', ''))}${removePlain(typ.second!)}`;

const odebratTypSpolecnosti = (nazev: string) => [
	's.r.o.', 'spol. s r.o.', 'a.s.', 'k.s.', 'v.o.s.'
].reduce((nazev, typ) => nazev.replace(typ, ''), nazev).trim()

export const popisIR = (evidence: RawData) =>
	evidence.koncovyUzivatel.typ == `company`
		? `${odebratTypSpolecnosti(evidence.koncovyUzivatel.nazev)} - ${evidence.bydliste.obec}`
		: `${evidence.koncovyUzivatel.prijmeni} ${evidence.koncovyUzivatel.jmeno} - ${evidence.bydliste.obec}`

export const typBOX = (cisloBOX: string) => ({
	"18054": "BOX 12 CTC 3/3",
	"18928": "BOX 12 CTC 3/3 EN",
	"18574": "BOX 12 RTC 3/1S",
	"18930": "BOX 12 RTC 3/1S EN",
	"20025": "BOX 12 RTC 3/3S EN",
	"19816": "BOX 12 RTC 3/3S",
	"20048": "HBOX 112 CTC 3/3",
	"20050": "HBOX 112 CTC 3/3 EN",
	"20049": "HBOX 112 RTC 3/1S",
	"20051": "HBOX 112 RTC 3/1S EN",
	"19896": "HBOX 212 CTC 3/3",
	"20026": "HBOX 212 CTC 3/3 EN",
	"19935": "HBOX 212 RTC 3/1S",
	"20029": "HBOX 212 RTC 3/1S EN",
	"20527": "HBOX K 106 CTC 3/3",
	"20630": "HBOX K 106 CTC 3/3 EN",
	"20528": "HBOX K 106 RTC 3/1S",
	"20631": "HBOX K 106 RTC 3/1S EN",
})[cisloBOX.slice(0, 5)]