export class Vec {
    nazev: string
    text: string
    errorFunc: (_: Vec) => string
    moznosti: string[]
    bool: boolean
    vybrano: string

    constructor(
        nazev: string = '',
        moznosti: string[] = [],
        bool: boolean = false,
        errorFunc: (_: Vec) => string = (_) => '',
        text: string = '',
        vybrano: string = '',
    ) {
        this.nazev = nazev
        this.text = text
        this.errorFunc = errorFunc
        this.moznosti = moznosti
        this.bool = bool
        this.vybrano = vybrano
    }

    get error() {
        return this.errorFunc(this);
    }
}