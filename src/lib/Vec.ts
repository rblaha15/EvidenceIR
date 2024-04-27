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
	zodpovednaOsoba: {
		jmeno: Pisatkova;
	};
}


export interface RawData {
	ir: {
		typ: string;
		cislo: string;
	};
	tc: {
		druh: string;
		typ: string;
		cislo: string;
	};
	koncovyUzivatel: {
		jmeno: string;
		prijmeni: string;
		narozeni: string;
		telefon: string;
		email: string;
	};
	mistoRealizace: {
		obec: string;
		ulice: string;
		psc: string;
	};
	montazka: {
		ico: string;
		zastupce: string;
		email: string;
	};
	uvedeni: {
		jakoMontazka: boolean;
		ico: string;
		zastupce: string;
		email: string;
	};
	vzdalenyPristup: {
		chce: boolean;
		pristupMa: string[];
		fakturuje: string;
	};
	zodpovednaOsoba: {
		jmeno: string;
	};
}

export const convertData = (data: Data): RawData => {
	return {
		ir: {
			typ: data.ir.typ.vybrano,
			cislo: data.ir.cislo.text,
		},
		tc: {
			druh: data.tc.cislo.text,
			typ: data.tc.typ.vybrano,
			cislo: data.tc.cislo.text,
		},
		koncovyUzivatel: {
			jmeno: data.koncovyUzivatel.jmeno.text,
			prijmeni: data.koncovyUzivatel.prijmeni.text,
			narozeni: data.koncovyUzivatel.narozeni.text,
			telefon: data.koncovyUzivatel.telefon.text,
			email: data.koncovyUzivatel.email.text,
		},
		mistoRealizace: {
			obec: data.mistoRealizace.obec.text,
			ulice: data.mistoRealizace.ulice.text,
			psc: data.mistoRealizace.psc.text,
		},
		montazka: {
			ico: data.montazka.ico.text,
			zastupce: data.montazka.zastupce.text,
			email: data.montazka.email.text,
		},
		uvedeni: {
			jakoMontazka: data.uvedeni.jakoMontazka.zaskrtnuto,
			ico: data.uvedeni.ico.text,
			zastupce: data.uvedeni.zastupce.text,
			email: data.uvedeni.email.text,
		},
		vzdalenyPristup: {
			chce: data.vzdalenyPristup.chce.zaskrtnuto,
			pristupMa: data.vzdalenyPristup.pristupMa.vybrano,
			fakturuje: data.vzdalenyPristup.fakturuje.vybrano,
		},
		zodpovednaOsoba: {
			jmeno: data.zodpovednaOsoba.jmeno.text,
		},
	}
}