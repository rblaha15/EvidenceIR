import defaultData from "./defaultData";
import type { TranslationReference, Translations } from "./translations";
import { DvojVybiratkova, Vybiratkova, Pisatkova, Radiova, Nadpisova, Zaskrtavatkova, MultiZaskrtavatkova, Vec, Textova, type Pair, Prepinatkova, type Raw } from "./Vec.svelte";

export type Data = {
	ir: {
		typ: DvojVybiratkova<Data>;
		cislo: Pisatkova<Data>;
		cisloBOX: Pisatkova<Data>;
		chceVyplnitK: MultiZaskrtavatkova<Data>;
	};
	tc: {
		nadpis: Nadpisova<Data>;
		poznamka: Textova<Data>;
		typ: Radiova<Data>;
		model: Vybiratkova<Data>;
		cislo: Pisatkova<Data>;
	};
	koncovyUzivatel: {
		nadpis: Nadpisova<Data>;
		jmeno: Pisatkova<Data>;
		prijmeni: Pisatkova<Data>;
		narozeni: Pisatkova<Data>;
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
		ico: Pisatkova<Data>;
		zastupce: Pisatkova<Data>;
		email: Pisatkova<Data>;
		phone: Pisatkova<Data>;
	};
	uvedeni: {
		nadpis: Nadpisova<Data>;
		jakoMontazka: Zaskrtavatkova<Data>;
		ico: Pisatkova<Data>;
		zastupce: Pisatkova<Data>;
		email: Pisatkova<Data>;
		phone: Pisatkova<Data>;
	};
	vzdalenyPristup: {
		nadpis: Nadpisova<Data>;
		chce: Zaskrtavatkova<Data>;
		pristupMa: MultiZaskrtavatkova<Data>;
		fakturuje: Radiova<Data>;
	};
	ostatni: {
		zodpovednaOsoba: Pisatkova<Data>;
		poznamka: Pisatkova<Data>;
	};
}

export const rawDataToData = (toData: Data, rawData: RawData) => {
	const d = toData as Record<string, Record<string, Vec<Data, any>>>

	Object.entries(rawData).map(a =>
		a as [keyof Data, RawData[keyof RawData]]
	).forEach(([key1, section]) =>
		Object.entries(section).map(a =>
			a as [string, any]
		).forEach(([key2, value]) => {
			d[key1][key2].value = value
			if (d[key1][key2] instanceof Pisatkova) d[key1][key2].updateText(value as string)
		})
	)

	return d as Data
}

export const newData = () => defaultData()

export type RawData = Raw<Data>

export const dataToRawData = (data: Data): RawData => {
	const dataEntries = Object.entries(data);
	const rawDataEntries = dataEntries.map(([key, subData]) => {
		const subDataEntries = Object.entries(subData) as [string, Vec<Data, any>][];
		const rawSubDataEntries = subDataEntries.map(([subKey, vec]) => {
			if (vec.value == undefined) return undefined;
			else return [subKey, vec.value] as const;
		}).filter(it => it != undefined);
		const rawSubData = Object.fromEntries(rawSubDataEntries);
		return [key, rawSubData] as const;
	});
	return Object.fromEntries(rawDataEntries) as RawData;
};

export const nazevIR = (t: Translations, { first, second }: Pair) =>
	first?.includes('BOX')
		? t.getT`${<TranslationReference>first!.split(' ').slice(0, 2).join(' ')} ${second!}`
		: t.getT`${<TranslationReference>first!.replaceAll(' ', '')}${second!}`;

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