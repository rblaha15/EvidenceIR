export class Vec {
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

    get zpravaJeChybna(): boolean {
        return new Map([
            [Typ.Nadpis, false],
            [Typ.Pisatkovy, (this.text == '' && this.nutne) || !this.regex.test(this.text)],
            [Typ.Vybiratkovy, this.vybrano == '' && this.nutne],
            [Typ.Zaskrtavatkovy, !this.bool && this.nutne],
        ]).get(this.typ) as boolean
    }

    get zobrazitError(): boolean {
        return this.zobrazitErrorVeto && this.zpravaJeChybna
    }
    set zobrazitError(_) { }

    constructor(
        typ: Typ,
        nazev: string = '',
        onError: string = '',
        regex: RegExp = /.*/,
        nutne: boolean = true,
        moznosti: string[] = [],
        bool: boolean = false,
        text: string = '',
        vybrano: string = '',
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
        )
    }
    static Nadpisova(
        nazev: string = '',
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
        )
    }
    static Vybiratkova(
        nazev: string = '',
        moznosti: string[] = [],
        onError: string = 'Toto pole je povinné',
        nutne: boolean = true,
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
        )
    }
    static Pisatkova(
        nazev: string = '',
        onError: string = 'Toto pole je povinné',
        regex: RegExp = /.*/,
        nutne: boolean = true,
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
            '',
        )
    }
    static Zaskrtavatkova(
        nazev: string = '',
        onError: string = 'Toto pole je povinné',
        nutne: boolean = true,
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
        )
    }
}
export enum Typ {
    Nadpis,
    Pisatkovy,
    Vybiratkovy,
    Zaskrtavatkovy,
}