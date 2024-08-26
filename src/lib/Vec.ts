import type { Translations, TranslationReference } from "./translations";
import type { Data } from "./Data";
import type { HTMLInputTypeAttribute } from "svelte/elements";
import { zip } from "lodash-es";

type Get<U = TranslationReference> = (data: Data) => U
type GetOrVal<U = TranslationReference> = Get<U> | U
const toGet = <U>(getOrValue: GetOrVal<U>) => getOrValue instanceof Function ? getOrValue : () => getOrValue

type Opts = {
    mask: string,
    definitions?: {
        [key: string]: RegExp,
    },
} | undefined

const template = (strings: TemplateStringsArray, ...args: string[]) => {
    return zip(strings, args).flat().slice(0, -1).join('')
}

const createTemplate = <U>(edit: (string: string) => U): (strings: TemplateStringsArray, ...args: string[]) => U =>
    (strings: TemplateStringsArray, ...args: string[]) => edit(template(strings, ...args))

export const p = createTemplate((plainString: string) => `PLAIN_${plainString}` as TranslationReference)
export const t = (ref: TranslationReference) => ref

export const nazevSHvezdou = (vec: Vec<any> & { nutne: Get<boolean> }, data: Data, t: Translations) => t.get(vec.nazev(data)) + (!vec.nutne(data) ? '' : ' *')

export abstract class Vec<U> {
    abstract nazev: Get;
    abstract onError: Get;
    zobrazitErrorVeto = false;
    abstract zobrazit: Get<boolean>;
    abstract value: U;

    abstract zpravaJeChybna: Get<boolean>;
    zobrazitError: Get<boolean> = ((data) => this.zobrazitErrorVeto && this.zpravaJeChybna(data));
}

export class Nadpisova extends Vec<undefined> {
    nazev: Get;
    onError = () => '' as const;
    zobrazit: Get<boolean>;
    value = undefined
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
    onError = () => '' as const;
    zobrazit: Get<boolean>;
    value = undefined
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

export class Vybiratkova extends Vec<TranslationReference | null> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti: Get<TranslationReference[]>;
    value: TranslationReference | null;
    nutne: Get<boolean>;
    zpravaJeChybna: Get<boolean> = a => this.value == null && this.nutne(a);

    constructor(args: {
        nazev: GetOrVal,
        moznosti: GetOrVal<TranslationReference[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: null | TranslationReference,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = (args.vybrano ?? null);
    }
}

export type Pair = {
    first: TranslationReference | null,
    second: TranslationReference | null,
}
export class DvojVybiratkova extends Vec<Pair> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti1: Get<TranslationReference[]>;
    moznosti2: Get<TranslationReference[]>;
    value: Pair;
    nutne: Get<boolean>;

    zpravaJeChybna: Get<boolean> = a => (this.value.first == null || this.value.second == null) && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti1: GetOrVal<TranslationReference[]>,
        moznosti2: GetOrVal<TranslationReference[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: Pair,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti1 = toGet(args.moznosti1);
        this.moznosti2 = toGet(args.moznosti2);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = (args.vybrano ?? { first: null, second: null, });
    }
}
export class Radiova extends Vec<TranslationReference | null> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti: Get<TranslationReference[]>;
    value: TranslationReference | null;
    nutne: Get<boolean>;

    zpravaJeChybna: Get<boolean> = a => this.value == null && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti: GetOrVal<TranslationReference[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: null | TranslationReference,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = (args.vybrano ?? null);
    }
}

export type Arr = TranslationReference[]
export class MultiZaskrtavatkova extends Vec<Arr> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    moznosti: Get<TranslationReference[]>;
    value: TranslationReference[];
    nutne: Get<boolean>;

    zpravaJeChybna: Get<boolean> = a => this.value.length == 0 && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        moznosti: GetOrVal<TranslationReference[]>,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        vybrano?: TranslationReference[],
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = (args.vybrano ?? []);
    }
}
export class Pisatkova extends Vec<string> {
    nazev: Get;
    type: Get<HTMLInputTypeAttribute>;
    autocomplete: Get<string>;
    onError: Get;
    zobrazit: Get<boolean>;
    value: string;
    updateText: (text: string) => void = it => { this.value = it };
    maskOptions: Get<Opts>;
    regex: Get<RegExp>;
    nutne: Get<boolean>;
    zpravaJeChybna: Get<boolean> = a => (this.value == '' && this.nutne(a)) ||
        (this.value != '' && !this.regex(a).test(this.value));

    constructor(args: {
        nazev: GetOrVal,
        onError?: GetOrVal,
        regex?: GetOrVal<RegExp>,
        nutne?: GetOrVal<boolean>,
        maskOptions?: GetOrVal<Opts>,
        type?: GetOrVal<HTMLInputTypeAttribute>,
        autocomplete?: GetOrVal<string>,
        zobrazit?: GetOrVal<boolean>,
        text?: string,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.regex = toGet(args.regex ?? /.*/);
        this.nutne = toGet(args.nutne ?? true);
        this.maskOptions = toGet(args.maskOptions ?? undefined);
        this.type = toGet(args.type ?? "text");
        this.autocomplete = toGet(args.autocomplete ?? "off");
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = args.text ?? '';
    }
}

export class Zaskrtavatkova extends Vec<boolean> {
    nazev: Get;
    onError: Get;
    zobrazit: Get<boolean>;
    value: boolean;
    nutne: Get<boolean>;

    zpravaJeChybna: Get<boolean> = a => !this.value && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal,
        onError?: GetOrVal,
        nutne?: GetOrVal<boolean>,
        zobrazit?: GetOrVal<boolean>,
        zaskrtnuto?: boolean,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = (args.zaskrtnuto ?? false);
    }
}