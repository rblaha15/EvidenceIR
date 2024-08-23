import defaultData from "./defaultData";
import type { LanguageCode } from "./languages";
import type { Translations } from "./translations";
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
	ostatni: {
		zodpovednaOsoba: Pisatkova;
		poznamka: Pisatkova;
	};
}

export const Data = (dev: boolean) => {
	const data = defaultData()
	
	if (dev) {
		data.ir.typ.vybrano1 = 2;
		data.ir.typ.vybrano2 = 0;
		data.ir.cislo.text = 'A9 1234';
		data.ir.cisloBOX.text = '2167853-2465453';
		data.ir.chceVyplnitK.vybrano = [0];
		data.tc.druh.vybrano = 0;
		data.tc.typ.vybrano = 3;
		data.tc.cislo.text = '3514-3564-6321';
		data.koncovyUzivatel.jmeno.text = 'Radek';
		data.koncovyUzivatel.prijmeni.text = 'Bláha';
		data.koncovyUzivatel.narozeni.text = '15. 3. 2007';
		data.koncovyUzivatel.telefon.text = '+420 792 313 555';
		data.koncovyUzivatel.email.text = 'radek.blaha.15@gmail.com';
		data.bydliste.obec.text = 'České Budějovice';
		data.bydliste.ulice.text = 'Josefa Hory 18';
		data.bydliste.psc.text = '370 06';
		data.mistoRealizace.obec.text = 'České Budějovice';
		data.mistoRealizace.psc.text = '370 06';
		data.vzdalenyPristup.chce.zaskrtnuto = true;
	}

	return data
}

type NonUndefinedKeys<T> = {
	[K in keyof T]: T[K] extends undefined ? never : K;
}[keyof T];
type NonUndefinedProperties<T> = Pick<T, NonUndefinedKeys<T>>;

type MediumData = {
	[K in keyof Data]: NonUndefinedProperties<{
		[K2 in keyof Data[K]]: ReturnType<(Vec<any> & Data[K][K2])["rawData"]>;
	}>;
} & {
	language: LanguageCode,
};

export type RawData = {
	[K in keyof MediumData]: MediumData[K] extends string ? MediumData[K] : {
		[K2 in keyof MediumData[K]]: MediumData[K][K2];
	};
};

export type DataAsRecord = {
	[K in keyof Data]: {
		[K2 in keyof Data[K]]: Data[K][K2];
	};
};

export const convertData = (args: { t: Translations, data: Data, lang: LanguageCode }): RawData => {
	const recordData = args.data as DataAsRecord;
	const entries1 = Object.entries(recordData);
	const recordRawData = entries1.map(([key, subData]) => {
		const subEntries = Object.entries(subData) as [string, Vec<any>][];
		const recordRawSubData = subEntries.map(([subKey, vec]) => {
			if (vec.rawData(args) == undefined) return undefined;
			else return [subKey, vec.rawData(args)] as const;
		}).filter(it => it != undefined);
		const rawSubData = Object.fromEntries(recordRawSubData);
		return [key, rawSubData] as const;
	});
	const rawData = {
		language: args.lang,
		...Object.fromEntries(recordRawData)
	};
	return rawData as RawData;
};