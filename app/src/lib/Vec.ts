import type { Translations, TranslationReference } from "./translations";
import type { Data } from "./Data";
import type { HTMLInputTypeAttribute } from "svelte/elements";
import { zip } from "lodash-es";

export type Get<D, U = TranslationReference> = (data: D) => U
export type GetOrVal<D, U = TranslationReference> = Get<D, U> | U
const toGet = <D, U>(getOrValue: GetOrVal<D, U>) => getOrValue instanceof Function ? getOrValue : () => getOrValue

export type Raw<U, D = U> = {
    [K in keyof U]: {
        [K2 in keyof U[K]]: U[K][K2] extends Vec<D, infer T> ? T extends undefined ? never : T : U[K][K2];
    };
};

type Opts = {
    mask: string,
    definitions?: {
        [key: string]: RegExp,
    },
} | undefined

const template = (strings: TemplateStringsArray, ...args: string[]) => {
    return zip(strings, args).flat().slice(0, -1).join('')
}

export const createTemplate = <U>(edit: (string: string) => U): (strings: TemplateStringsArray, ...args: string[]) => U =>
    (strings: TemplateStringsArray, ...args: string[]) => edit(template(strings, ...args))
export const createTemplateG = <T extends string, U>(edit: (args: { strings: TemplateStringsArray, args: T[] }) => { strings: TemplateStringsArray, args: string[] }, edit2: (string: string) => U): (strings: TemplateStringsArray, ...args: T[]) => U =>
    (strings: TemplateStringsArray, ...args: T[]) => {
        const t = edit({ strings, args })
        return edit2(template(t.strings, ...t.args))
    }

export const p = createTemplate((plainString: string) => `PLAIN_${plainString}` as `PLAIN_${typeof plainString}`)
export const t = (ref: TranslationReference) => ref

export const nazevSHvezdou = <D>(vec: Vec<any, any> & { nutne: Get<D, boolean> }, data: D, t: Translations) => t.get(vec.nazev(data)) + (!vec.nutne(data) ? '' : ' *')

export abstract class Vec<D, U> {
    abstract nazev: Get<D, TranslationReference>;
    abstract onError: Get<D, TranslationReference>;
    zobrazitErrorVeto = false;
    abstract zobrazit: Get<D, boolean>;
    abstract value: U;

    abstract zpravaJeChybna: Get<D, boolean>;
    zobrazitError: Get<D, boolean> = ((data) => this.zobrazitErrorVeto && this.zpravaJeChybna(data));
}

export class Nadpisova<D> extends Vec<D, undefined> {
    nazev: Get<D, TranslationReference>;
    onError = () => '' as const;
    zobrazit: Get<D, boolean>;
    value = undefined
    zpravaJeChybna: Get<D, boolean> = () => false;
    constructor(args: {
        nazev: GetOrVal<D>,
        zobrazit?: GetOrVal<D, boolean>
    }) {
        super();
        this.nazev = toGet(args.nazev);
        this.zobrazit = toGet(args.zobrazit ?? true);
    }
}

export class Textova<D> extends Vec<D, undefined> {
    nazev: Get<D, TranslationReference>;
    onError = () => '' as const;
    zobrazit: Get<D, boolean>;
    value = undefined
    zpravaJeChybna: Get<D, boolean> = () => false;
    constructor(args: {
        nazev: GetOrVal<D>,
        zobrazit?: GetOrVal<D, boolean>
    }) {
        super();
        this.nazev = toGet(args.nazev);
        this.zobrazit = toGet(args.zobrazit ?? true);
    }
}

export class Vybiratkova<D> extends Vec<D, TranslationReference | null> {
    nazev: Get<D, TranslationReference>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    moznosti: Get<D, TranslationReference[]>;
    value: TranslationReference | null;
    nutne: Get<D, boolean>;
    zpravaJeChybna: Get<D, boolean> = a => this.value == null && this.nutne(a);

    constructor(args: {
        nazev: GetOrVal<D>,
        moznosti: GetOrVal<D, TranslationReference[]>,
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
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
export class DvojVybiratkova<D> extends Vec<D, Pair> {
    nazev: Get<D, TranslationReference>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    moznosti1: Get<D, TranslationReference[]>;
    moznosti2: Get<D, TranslationReference[]>;
    value: Pair;
    nutne: Get<D, boolean>;

    zpravaJeChybna: Get<D, boolean> = a => (this.value.first == null || this.value.second == null) && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal<D>,
        moznosti1: GetOrVal<D, TranslationReference[]>,
        moznosti2: GetOrVal<D, TranslationReference[]>,
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
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
export class Radiova<D> extends Vec<D, TranslationReference | null> {
    nazev: Get<D, TranslationReference>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    moznosti: Get<D, TranslationReference[]>;
    value: TranslationReference | null;
    nutne: Get<D, boolean>;

    zpravaJeChybna: Get<D, boolean> = a => this.value == null && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal<D>,
        moznosti: GetOrVal<D, TranslationReference[]>,
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
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
export class Prepinatkova<D> extends Vec<D, boolean> {
    nazev: Get<D, TranslationReference>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    moznosti: readonly [TranslationReference, TranslationReference];
    value: boolean;
    nutne: Get<D, boolean>;

    zpravaJeChybna: Get<D, boolean> = a => !this.value && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal<D>,
        moznosti: readonly [TranslationReference, TranslationReference],
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
        vybrano?: boolean,
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = args.moznosti;
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.nutne = toGet(args.nutne ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.value = (args.vybrano ?? false);
    }
}

export type Arr = TranslationReference[]
export class MultiZaskrtavatkova<D> extends Vec<D, Arr> {
    nazev: Get<D, TranslationReference>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    moznosti: Get<D, TranslationReference[]>;
    value: TranslationReference[];
    nutne: Get<D, boolean>;

    zpravaJeChybna: Get<D, boolean> = a => this.value.length == 0 && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal<D>,
        moznosti: GetOrVal<D, TranslationReference[]>,
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
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
export class Pisatkova<D> extends Vec<D, string> {
    nazev: Get<D, TranslationReference>;
    type: Get<D, HTMLInputTypeAttribute>;
    autocomplete: Get<D, string>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    value: string
        get() {
            return this.value
        };
        set(value: string) {
            this.updateText(value)
        };
    updateText: (text: string) => void = it => { this.value = it };
    maskOptions: Get<D, Opts>;
    regex: Get<D, RegExp>;
    nutne: Get<D, boolean>;
    zpravaJeChybna: Get<D, boolean> = a => (this.value == '' && this.nutne(a)) ||
        (this.value != '' && !this.regex(a).test(this.value));

    constructor(args: {
        nazev: GetOrVal<D>,
        onError?: GetOrVal<D>,
        regex?: GetOrVal<D, RegExp>,
        nutne?: GetOrVal<D, boolean>,
        maskOptions?: GetOrVal<D, Opts>,
        type?: GetOrVal<D, HTMLInputTypeAttribute>,
        autocomplete?: GetOrVal<D, string>,
        zobrazit?: GetOrVal<D, boolean>,
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

export class Zaskrtavatkova<D> extends Vec<D, boolean> {
    nazev: Get<D, TranslationReference>;
    onError: Get<D, TranslationReference>;
    zobrazit: Get<D, boolean>;
    value: boolean;
    nutne: Get<D, boolean>;

    zpravaJeChybna: Get<D, boolean> = a => !this.value && this.nutne(a);
    constructor(args: {
        nazev: GetOrVal<D>,
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
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