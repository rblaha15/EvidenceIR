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

	static Obecna(
		typ: Typ,
		nazev = '',
		onError = '',
		regex = /.*/,
		nutne = true,
		moznosti: string[] = [],
		bool = false,
		text = '',
		vybrano = '',
		zobrazit = true
	): Vec {
		return new Vec(typ, nazev, onError, regex, nutne, moznosti, bool, text, vybrano, zobrazit);
	}
	static Nadpisova(nazev = '', zobrazit = true): Vec {
		return new Vec(Typ.Nadpis, nazev, '', /.*/, false, [], false, '', '', zobrazit);
	}
	static Vybiratkova(
		nazev = '',
		moznosti: string[] = [],
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		vybrano = ''
	): Vec {
		return new Vec(
			Typ.Vybiratkovy,
			nazev,
			onError,
			/.*/,
			nutne,
			moznosti,
			false,
			'',
			vybrano,
			zobrazit
		);
	}
	static Radiova(
		nazev = '',
		moznosti: string[] = [],
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		vybrano = ''
	): Vec {
		return new Vec(
			Typ.Radiovy,
			nazev,
			onError,
			/.*/,
			nutne,
			moznosti,
			false,
			'',
			vybrano,
			zobrazit
		);
	}
	static Pisatkova(
		nazev = '',
		onError = 'Toto pole je povinné',
		regex = /.*/,
		nutne = true,
		napoveda = '',
		zobrazit = true,
		text = ''
	): Vec {
		return new Vec(
			Typ.Pisatkovy,
			nazev,
			onError,
			regex,
			nutne,
			[],
			false,
			text,
			napoveda,
			zobrazit
		);
	}
	static Zaskrtavatkova(
		nazev = '',
		onError = 'Toto pole je povinné',
		nutne = true,
		zobrazit = true,
		bool = false
	): Vec {
		return new Vec(Typ.Zaskrtavatkovy, nazev, onError, /.*/, nutne, [], bool, '', '', zobrazit);
	}
}
export enum Typ {
	Nadpis,
	Pisatkovy,
	Vybiratkovy,
	Radiovy,
	Zaskrtavatkovy
}
