export class Vec {
	copy = () =>
		new Vec(
			this.typ,
			this.nazev,
			this.onError,
			this.regex,
			this.nutne,
			this.moznosti,
			this.bool,
			this.text,
			this.vybrano,
			this.zobrazit,
			this.zobrazitErrorVeto
		);

	typ: Typ;
	nazev: string;
	text: string;
	onError: string;
	moznosti: string[];
	bool: boolean;
	vybrano: string;
	regex: RegExp;
	nutne: boolean;
	zobrazitErrorVeto = false;
	zobrazit = true;

	get zpravaJeChybna(): boolean {
		return new Map([
			[Typ.Nadpis, false],
			[
				Typ.Pisatkovy,
				(this.text == '' && this.nutne) || (this.text != '' && !this.regex.test(this.text))
			],
			[Typ.Vybiratkovy, this.vybrano == '' && this.nutne],
			[Typ.Radiovy, this.vybrano == '' && this.nutne],
			[Typ.Zaskrtavatkovy, !this.bool && this.nutne]
		]).get(this.typ) as boolean;
	}

	get zobrazitError(): boolean {
		return this.zobrazitErrorVeto && this.zpravaJeChybna;
	}
	set zobrazitError(_) {
		_;
	}

	constructor(
		typ: Typ,
		nazev: string,
		onError: string,
		regex: RegExp,
		nutne: boolean,
		moznosti: string[],
		bool: boolean,
		text: string,
		vybrano: string,
		zobrazit: boolean,
		zobrazitErrorVeto = false
	) {
		this.typ = typ;
		this.nazev = nazev;
		this.text = text;
		this.onError = onError;
		this.moznosti = moznosti;
		this.bool = bool;
		this.vybrano = vybrano;
		this.regex = regex;
		this.nutne = nutne;
		this.zobrazit = zobrazit;
		this.zobrazitErrorVeto = zobrazitErrorVeto;
	}

	static Nadpisova = class Nadpisova extends Vec {
		constructor(nazev = '', zobrazit = true) {
			super(Typ.Nadpis, nazev, '', /.*/, false, [], false, '', '', zobrazit);
		}
	};
	static Vybiratkova = class Vybiratkova extends Vec {
		constructor(
			nazev = '',
			moznosti: string[] = [],
			onError = 'Toto pole je povinné',
			nutne = true,
			zobrazit = true,
			vybrano = ''
		) {
			super(Typ.Vybiratkovy, nazev, onError, /.*/, nutne, moznosti, false, '', vybrano, zobrazit);
		}
	};
	static Radiova = class Radiova extends Vec {
		constructor(
			nazev = '',
			moznosti: string[] = [],
			onError = 'Toto pole je povinné',
			nutne = true,
			zobrazit = true,
			vybrano = ''
		) {
			super(Typ.Radiovy, nazev, onError, /.*/, nutne, moznosti, false, '', vybrano, zobrazit);
		}
	};
	static Pisatkova = class Pisatkova extends Vec {
		constructor(
			nazev = '',
			onError = 'Toto pole je povinné',
			regex = /.*/,
			nutne = true,
			napoveda = '',
			zobrazit = true,
			text = ''
		) {
			super(Typ.Pisatkovy, nazev, onError, regex, nutne, [], false, text, napoveda, zobrazit);
		}
	};
	static Zaskrtavatkova = class Zaskrtavatkova extends Vec {
		constructor(
			nazev = '',
			onError = 'Toto pole je povinné',
			nutne = true,
			zobrazit = true,
			bool = false
		) {
			super(Typ.Zaskrtavatkovy, nazev, onError, /.*/, nutne, [], bool, '', '', zobrazit);
		}
	};
}
export enum Typ {
	Nadpis,
	Pisatkovy,
	Vybiratkovy,
	Radiovy,
	Zaskrtavatkovy
}

export interface Data {
	ir: {
		typ: Vec;
		cislo: Vec;
	};
	tc: {
		druh: Vec;
		typ: Vec;
		cislo: Vec;
	};
	koncovyUzivatel: {
		nadpis: Vec;
		jmeno: Vec;
		prijmeni: Vec;
		narozeni: Vec;
		telefon: Vec;
		email: Vec;
	};
	mistoRealizace: {
		nadpis: Vec;
		obec: Vec;
		ulice: Vec;
		psc: Vec;
	};
	montazka: {
		nadpis: Vec;
		ico: Vec;
		zastupce: Vec;
		email: Vec;
	};
	uvedeni: {
		nadpis: Vec;
		jakoMontazka: Vec;
		ico: Vec;
		zastupce: Vec;
		email: Vec;
	};
}
