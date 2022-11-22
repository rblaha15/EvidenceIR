export class Vec {
    copy = () => new Vec(
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
    )

    typ: Typ
    nazev: string
    text: string
    onError: string
    moznosti: string[]
    bool: boolean
    vybrano: string
    regex: RegExp
    nutne: boolean
    zobrazitErrorVeto: boolean = false
    zobrazit: boolean = true

    get zpravaJeChybna(): boolean {
        return new Map([
            [Typ.Nadpis, false],
            [Typ.Pisatkovy, (this.text == '' && this.nutne) || !this.regex.test(this.text)],
            [Typ.Vybiratkovy, this.vybrano == '' && this.nutne],
            [Typ.Radiovy, this.vybrano == '' && this.nutne],
            [Typ.Zaskrtavatkovy, !this.bool && this.nutne],
        ]).get(this.typ) as boolean
    }

    get zobrazitError(): boolean {
        return this.zobrazitErrorVeto && this.zpravaJeChybna
    }
    set zobrazitError(_) { }

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
        zobrazitErrorVeto: boolean = false,
    ) {
        this.typ = typ
        this.nazev = nazev
        this.text = text
        this.onError = onError
        this.moznosti = moznosti
        this.bool = bool
        this.vybrano = vybrano
        this.regex = regex
        this.nutne = nutne
        this.zobrazit = zobrazit
        this.zobrazitErrorVeto = zobrazitErrorVeto
    }

    static Obecna(
        typ: Typ,
        nazev: string = '',
        onError: string = '',
        regex: RegExp = /.*/,
        nutne: boolean = true,
        moznosti: string[] = [],
        bool: boolean = false,
        text: string = '',
        vybrano: string = '',
        zobrazit: boolean = true,
    ): Vec {
        return new Vec(
            typ,
            nazev,
            onError,
            regex,
            nutne,
            moznosti,
            bool,
            text,
            vybrano,
            zobrazit,
        )
    }
    static Nadpisova(
        nazev: string = '',
        zobrazit: boolean = true,
    ): Vec {
        return new Vec(
            Typ.Nadpis,
            nazev,
            "",
            /.*/,
            false,
            [],
            false,
            "",
            "",
            zobrazit,
        )
    }
    static Vybiratkova(
        nazev: string = '',
        moznosti: string[] = [],
        onError: string = 'Toto pole je povinné',
        nutne: boolean = true,
        zobrazit: boolean = true,
        vybrano: string = '',
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
            zobrazit,
        )
    }
    static Radiova(
        nazev: string = '',
        moznosti: string[] = [],
        onError: string = 'Toto pole je povinné',
        nutne: boolean = true,
        zobrazit: boolean = true,
        vybrano: string = '',
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
            zobrazit,
        )
    }
    static Pisatkova(
        nazev: string = '',
        onError: string = 'Toto pole je povinné',
        regex: RegExp = /.*/,
        nutne: boolean = true,
        napoveda: string = "",
        zobrazit: boolean = true,
        text: string = '',
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
            zobrazit,
        )
    }
    static Zaskrtavatkova(
        nazev: string = '',
        onError: string = 'Toto pole je povinné',
        nutne: boolean = true,
        zobrazit: boolean = true,
        bool: boolean = false,
    ): Vec {
        return new Vec(
            Typ.Zaskrtavatkovy,
            nazev,
            onError,
            /.*/,
            nutne,
            [],
            bool,
            '',
            '',
            zobrazit,
        )
    }
}
export enum Typ {
    Nadpis,
    Pisatkovy,
    Vybiratkovy,
    Radiovy,
    Zaskrtavatkovy,
}