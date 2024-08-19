import defaultData from "./defaultData";
import type { DvojVybiratkova, Vybiratkova, Pisatkova, Radiova, Nadpisova, Zaskrtavatkova, MultiZaskrtavatkova, Vec, Textova } from "./Vec";

export interface Data {
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
	zodpovednaOsoba: {
		jmeno: Pisatkova;
	};
}

export const Data = defaultData

type NonUndefinedKeys<T> = {
	[K in keyof T]: T[K] extends undefined ? never : K;
}[keyof T];
type NonUndefinedProperties<T> = Pick<T, NonUndefinedKeys<T>>;

type MediumData = {
	[K in keyof Data]: NonUndefinedProperties<{
		[K2 in keyof Data[K]]: ReturnType<(Vec<any> & Data[K][K2])["rawData"]>;
	}>;
};

export type RawData = {
	[K in keyof MediumData]: {
		[K2 in keyof MediumData[K]]: MediumData[K][K2];
	};
};

export type DataAsRecord = {
	[K in keyof Data]: {
		[K2 in keyof Data[K]]: Data[K][K2];
	};
};

export const convertData = (data: Data): RawData => {
	const recordData = data as DataAsRecord;
	const entries1 = Object.entries(recordData);
	const recordRawData = entries1.map(([key, subData]) => {
		const subEntries = Object.entries(subData);
		const recordRawSubData = subEntries.map(([subKey, vec]) => {
			if (vec.rawData() == undefined) return undefined;
			else return [subKey, vec.rawData()] as const;
		}).filter(it => it != undefined);
		const rawSubData = Object.fromEntries(recordRawSubData);
		return [key, rawSubData] as const;
	});
	const rawData = Object.fromEntries(recordRawData);
	return rawData as RawData;
};

