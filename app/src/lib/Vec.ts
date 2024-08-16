export abstract class Vec<T> {
	abstract nazev: string;
	abstract onError: string;
	zobrazitErrorVeto = false;
	abstract zobrazit: boolean;
	abstract rawData(): T;

	abstract get zpravaJeChybna(): boolean;

	get zobrazitError(): boolean {
		return this.zobrazitErrorVeto && this.zpravaJeChybna;
	}
	set zobrazitError(_) {
		_;
	}
}

export class Nadpisova extends Vec<undefined> {
	nazev: string;
	onError = '';
	zobrazit: boolean;
	rawData() { return undefined }
	get zpravaJeChybna(): boolean {
		return false;
	}
	constructor(nazev = '', zobrazit = true) {
		super();
		this.nazev = nazev;
		this.zobrazit = zobrazit;
	}
}
export class Vybiratkova extends Vec<string> {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	moznosti: string[];
	vybrano: string;
	nutne: boolean;
	rawData() { return this.vybrano }

	get zpravaJeChybna(): boolean {
		return this.vybrano == '' && this.nutne;
	}
	constructor(
		nazev = '',
		moznosti: string[] = [],
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		vybrano = ''
	) {
		super();

		this.nazev = nazev;
		this.onError = onError;
		this.zobrazit = zobrazit;
		this.moznosti = moznosti;
		this.vybrano = vybrano;
		this.nutne = nutne;
	}
}
export class Radiova extends Vec<string> {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	moznosti: string[];
	vybrano: string;
	nutne: boolean;
	rawData() { return this.vybrano }

	get zpravaJeChybna(): boolean {
		return this.vybrano == '' && this.nutne;
	}
	constructor(
		nazev = '',
		moznosti: string[] = [],
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		vybrano = ''
	) {
		super();

		this.nazev = nazev;
		this.onError = onError;
		this.zobrazit = zobrazit;
		this.moznosti = moznosti;
		this.vybrano = vybrano;
		this.nutne = nutne;
	}
}
export class MultiZaskrtavatkova extends Vec<string[]> {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	moznosti: string[];
	vybrano: string[];
	nutne: boolean;
	rawData() { return this.vybrano }

	get zpravaJeChybna(): boolean {
		return this.vybrano.length == 0 && this.nutne;
	}
	constructor(
		nazev = '',
		moznosti: string[] = [],
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		vybrano: string[] = []
	) {
		super();

		this.nazev = nazev;
		this.onError = onError;
		this.zobrazit = zobrazit;
		this.moznosti = moznosti;
		this.vybrano = vybrano;
		this.nutne = nutne;
	}
}
export class Pisatkova extends Vec<string> {
	copy = () =>
		new Pisatkova(
			this.nazev,
			this.onError,
			this.regex,
			this.nutne,
			this.napoveda,
			this.zobrazit,
			this.text
		);

	nazev: string;
	onError: string;
	zobrazit: boolean;
	text: string;
	napoveda: string;
	regex: RegExp;
	nutne: boolean;
	rawData() { return this.text }

	get zpravaJeChybna(): boolean {
		return (this.text == '' && this.nutne) || (this.text != '' && !this.regex.test(this.text));
	}
	constructor(
		nazev = '',
		onError = 'Toto pole je povinné',
		regex = /.*/,
		nutne = true,
		napoveda = '',
		zobrazit = true,
		text = ''
	) {
		super();

		this.nazev = nazev;
		this.onError = onError;
		this.zobrazit = zobrazit;
		this.text = text;
		this.napoveda = napoveda;
		this.regex = regex;
		this.nutne = nutne;
	}
}
export class Zaskrtavatkova extends Vec<boolean> {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	zaskrtnuto: boolean;
	nutne: boolean;
	rawData() { return this.zaskrtnuto }

	get zpravaJeChybna(): boolean {
		return !this.zaskrtnuto && this.nutne;
	}
	constructor(
		nazev = '',
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		zaskrtnuto = false
	) {
		super();

		this.nazev = nazev;
		this.onError = onError;
		this.zobrazit = zobrazit;
		this.zaskrtnuto = zaskrtnuto;
		this.nutne = nutne;
	}
}

export interface Data {
	ir: {
		typ: Vybiratkova;
		cislo: Pisatkova;
	};
	tc: {
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

export type RawData = {
	[K in keyof Data]: {
		[K2 in keyof Data[K]]: ReturnType<(Vec<any> & Data[K][K2])["rawData"]>
	}
}

type DataAsRecord = {
	[K in keyof Data]: {
		[K2 in keyof Data[K]]: Data[K][K2]
	}
}

export const convertData = (data: Data): RawData => {
	const recordData = data as DataAsRecord
	const entries1 = Object.entries(recordData)
	const recordRawData = entries1.map(([key, subData]) => {
		const subEntries = Object.entries(subData)
		const recordRawSubData = subEntries.map(([subKey, vec]) => {
			if (vec.rawData() == undefined) return undefined
			else return [subKey, vec.rawData()] as const
		}).filter(it => it != undefined)
		const rawSubData = Object.fromEntries(recordRawSubData)
		return [key, rawSubData] as const
	})
	const rawData = Object.fromEntries(recordRawData)
	return rawData as RawData
}