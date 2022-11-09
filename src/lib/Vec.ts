export class Vec {
    nazev: string
    text: string
    error: string
    moznosti: string[]
    bool: boolean
    vybrano: string

    constructor(
        nazev: string = '',
        moznosti: string[] = [],
        bool: boolean = false,
        error: string = '',
        text: string = '',
        vybrano: string = '',
    ) {
        this.nazev = nazev
        this.text = text
        this.error = error
        this.moznosti = moznosti
        this.bool = bool
        this.vybrano = vybrano
    }
}