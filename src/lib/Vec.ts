export abstract class Vec {
	abstract nazev: string;
	abstract onError: string;
	zobrazitErrorVeto = false;
	abstract zobrazit: boolean;

	abstract get zpravaJeChybna(): boolean;

	get zobrazitError(): boolean {
		return this.zobrazitErrorVeto && this.zpravaJeChybna;
	}
	set zobrazitError(_) {
		_;
	}
}

export class Nadpisova extends Vec {
	nazev: string;
	onError = '';
	zobrazit: boolean;
	get zpravaJeChybna(): boolean {
		return false;
	}
	constructor(nazev = '', zobrazit = true) {
		super();
		this.nazev = nazev;
		this.zobrazit = zobrazit;
	}
}
export class Vybiratkova extends Vec {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	moznosti: string[];
	vybrano: string;
	nutne: boolean;

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
export class Radiova extends Vec {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	moznosti: string[];
	vybrano: string;
	nutne: boolean;

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
export class MultiZaskrtavatkova extends Vec {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	moznosti: string[];
	vybrano: string[];
	nutne: boolean;

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
export class Pisatkova extends Vec {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	text: string;
	napoveda: string;
	regex: RegExp;
	nutne: boolean;

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
export class Zaskrtavatkova extends Vec {
	nazev: string;
	onError: string;
	zobrazit: boolean;
	zaskrtnuto: boolean;
	nutne: boolean;

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
}
