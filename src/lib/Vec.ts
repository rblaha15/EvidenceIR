import type { Translations as T } from "./translations";
import type { Data } from "./Data";
import type { HTMLInputTypeAttribute } from "svelte/elements";

type Get<U = string> = (args: { t: T, data: Data }) => U
type GetOrVal<U = string> = Get<U> | U
const toGet = <U>(getOrValue: GetOrVal<U>) => getOrValue instanceof Function ? getOrValue : () => getOrValue

type Opts = {
    mask: string,
    definitions?: {
        [key: string]: RegExp,
    },
} | undefined


export const nazevSHvezdou = (vec: Vec<any> & { nutne: Get<Boolean> }, args: { t: T, data: Data }) => !vec.nutne(args) ? vec.nazev(args) : vec.nazev(args) + " *"

export abstract class Vec<U> {
    abstract nazev: Get;
    abstract onError: Get;
    zobrazitErrorVeto = false;
    abstract zobrazit: Get<boolean>;
    abstract rawData: Get<U>;

    abstract zpravaJeChybna: Get<boolean>;
    zobrazitError: Get<boolean> = a => this.zobrazitErrorVeto && this.zpravaJeChybna(a);
}

export class Nadpisova extends Vec<undefined> {
    nazev: Get;
    onError = () => '';
    zobrazit: Get<boolean>;
    rawData = () => undefined
    zpravaJeChybna: Get<boolean> = () => false;
    constructor(args: {
        nazev: GetOrVal,
        zobrazit?: GetOrVal<boolean>
    }) {
        super();
        this.nazev = toGet(args.nazev);
        this.zobrazit = toGet(args.zobrazit ?? true);
    }
}

export class Textova extends Vec<undefined> {
    nazev: Get;
    onError = () => '';
    zobrazit: Get<boolean>;
    rawData = () => undefined
    zpravaJeChybna: Get<boolean> = () => false;
    constructor(args: {
        nazev: GetOrVal,
        zobrazit?: GetOrVal<boolean>
    }) {
        super();
        this.nazev = toGet(args.nazev);
        this.zobrazit = toGet(args.zobrazit ?? true);
    }
}

export class Vybiratkova extends Vec<string> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti: Get<string[]>;
    vybrano: number | null;
    nutne: Get<boolean>;
    rawData: Get = a => this.value(a)
    value: Get = a => this.vybrano == null ? '' : this.moznosti(a)[this.vybrano]
    zpravaJeChybna: Get<boolean> = a => this.vybrano == null && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti: GetOrVal<string[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: null | number,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? (({ t }) => t.requiredField));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.vybrano = (args.vybrano ?? null);
    }
}

type Pair = readonly [string, string]
export class DvojVybiratkova extends Vec<Pair> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti1: Get<string[]>;
    moznosti2: Get<string[]>;
    vybrano1: number | null;
    vybrano2: number | null;
    nutne: Get<boolean>;
    rawData: Get<Pair> = a => this.value(a)

    value: Get<Pair> = a => [
        this.vybrano1 == null ? '' : this.moznosti1(a)[this.vybrano1],
        this.vybrano2 == null ? '' : this.moznosti2(a)[this.vybrano2],
    ] as const

    zpravaJeChybna: Get<boolean> = a => (this.vybrano1 == null || this.vybrano2 == null) && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti1: GetOrVal<string[]>,
        moznosti2: GetOrVal<string[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano1?: null | number,
        vybrano2?: null | number,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti1 = toGet(args.moznosti1);
        this.moznosti2 = toGet(args.moznosti2);
        this.onError = toGet(args.onError ?? (({ t }) => t.requiredField));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.vybrano1 = (args.vybrano1 ?? null);
        this.vybrano2 = (args.vybrano2 ?? null);
    }
}
export class Radiova extends Vec<string> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti: Get<string[]>;
    vybrano: number | null;
    nutne: Get<boolean>;
    rawData: Get = a => this.value(a)

    value: Get = a => this.vybrano == null ? '' : this.moznosti(a)[this.vybrano!]

    zpravaJeChybna: Get<boolean> = a => this.vybrano == null && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti: GetOrVal<string[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: null | number,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? (({ t }) => t.requiredField));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.vybrano = (args.vybrano ?? null);
    }
}

type Arr = string[]
export class MultiZaskrtavatkova extends Vec<Arr> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti: Get<string[]>;
    vybrano: number[];
    nutne: Get<boolean>;
    rawData: Get<Arr> = a => this.values(a)
    values: Get<Arr> = a => this.vybrano.map(i => this.moznosti(a)[i])

    zpravaJeChybna: Get<boolean> = a => this.vybrano.length == 0 && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti: GetOrVal<string[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: number[],
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? (({ t }) => t.requiredField));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.vybrano = (args.vybrano ?? []);
    }
}
export class Pisatkova extends Vec<string> {
    nazev: Get;
    type: Get<HTMLInputTypeAttribute>;
    autocomplete: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    text: string;
    updateText: (text: string) => void = () => { };
    maskOptions: Get<Opts>;
    regex: Get<RegExp>;
    nutne: Get<boolean>;
    rawData = () => this.text
    zpravaJeChybna: Get<boolean> = a => (this.text == '' && this.nutne(a)) ||
        (this.text != '' && !this.regex(a).test(this.text));

    constructor(args: {
        nazev: GetOrVal,
        onError?: GetOrVal,
        regex?: GetOrVal<RegExp>,
        nutne?: GetOrVal<boolean>,
        maskOptions?: GetOrVal<Opts>,
        type?: GetOrVal<HTMLInputTypeAttribute>,
        autocomplete?: GetOrVal,
        zobrazit?: GetOrVal<boolean>,
        text?: string,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.onError = toGet(args.onError ?? (({ t }) => t.requiredField));
        this.regex = toGet(args.regex ?? /.*/);
        this.nutne = toGet(args.nutne ?? true);
        this.maskOptions = toGet(args.maskOptions ?? undefined);
        this.type = toGet(args.type ?? "text");
        this.autocomplete = toGet(args.autocomplete ?? "off");
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.text = args.text ?? '';
    }
}

export class Zaskrtavatkova extends Vec<boolean> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    zaskrtnuto: boolean;
    nutne: Get<boolean>;
    rawData = () => this.zaskrtnuto

    zpravaJeChybna: Get<boolean> = a => !this.zaskrtnuto && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        zaskrtnuto?: boolean,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.onError = toGet(args.onError ?? (({ t }) => t.requiredField));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.zaskrtnuto = (args.zaskrtnuto ?? false);
    }
}