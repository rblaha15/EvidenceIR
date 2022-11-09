export class Vec {
    nazev: string
    text: string
    onError: string
    moznosti: string[]
    bool: boolean
    vybrano: string
    regex: RegExp
    nutne: boolean

    constructor(
        nazev: string = '',
        onError: string = '',
        regex: RegExp = /.*/,
        nutne: boolean = true,
        moznosti: string[] = [],
        bool: boolean = false,
        text: string = '',
        vybrano: string = '',
    ) {
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
    static Vybiratkova(
        nazev: string = '',
        moznosti: string[] = [],
        onError: string = 'Toto pole je povinné',
        nutne: boolean = true,
        vybrano: string = '',
    ): Vec {
        return new Vec(
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