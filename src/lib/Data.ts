import defaultData from "./defaultData";
import { DvojVybiratkova, Vybiratkova, Pisatkova, Radiova, Nadpisova, Zaskrtavatkova, MultiZaskrtavatkova, Vec, Textova } from "./Vec";

export type Data = {
	ir: {
		typ: DvojVybiratkova;
		cislo: Pisatkova;
		cisloBOX: Pisatkova;
		chceVyplnitK: MultiZaskrtavatkova;
	};
	tc: {
		nadpis: Nadpisova;
		poznamka: Textova;
		druh: Radiova;
		typ: Vybiratkova;
		cislo: Pisatkova;
	};
	koncovyUzivatel: {
		nadpis: Nadpisova;
		jmeno: Pisatkova;
		prijmeni: Pisatkova;
		narozeni: Pisatkova;
		telefon: Pisatkova;
		email: Pisatkova;
	};
	bydliste: {
		nadpis: Nadpisova;
		obec: Pisatkova;
		ulice: Pisatkova;
		psc: Pisatkova;
	};
	mistoRealizace: {
		nadpis: Nadpisova;
		obec: Pisatkova;
		ulice: Pisatkova;
		psc: Pisatkova;
	};
	montazka: {
		nadpis: Nadpisova;
		ico: Pisatkova;
		zastupce: Pisatkova;
		email: Pisatkova;
	};
	uvedeni: {
		nadpis: Nadpisova;
		jakoMontazka: Zaskrtavatkova;
		ico: Pisatkova;
		zastupce: Pisatkova;
		email: Pisatkova;
	};
	vzdalenyPristup: {
		nadpis: Nadpisova;
		chce: Zaskrtavatkova;
		pristupMa: MultiZaskrtavatkova;
		fakturuje: Radiova;
	};
	ostatni: {
		zodpovednaOsoba: Pisatkova;
		poznamka: Pisatkova;
	};
}

export const rawDataToData = (toData: Data, rawData: RawData) => {
	const d = toData as Record<string, Record<string, Vec<any>>>

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

export type RawData = {
	[K in keyof Data]: {
		[K2 in keyof Data[K]]: Data[K][K2] extends Vec<infer T> ? T extends undefined ? never : T : never;
	};
};

export const dataToRawData = (data: Data): RawData => {
	const dataEntries = Object.entries(data);
	const rawDataEntries = dataEntries.map(([key, subData]) => {
		const subDataEntries = Object.entries(subData) as [string, Vec<any>][];
		const rawSubDataEntries = subDataEntries.map(([subKey, vec]) => {
			if (vec.value == undefined) return undefined;
			else return [subKey, vec.value] as const;
		}).filter(it => it != undefined);
		const rawSubData = Object.fromEntries(rawSubDataEntries);
		return [key, rawSubData] as const;
	});
	return Object.fromEntries(rawDataEntries) as RawData;
};