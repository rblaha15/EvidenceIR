import type { TranslationReference, Translations } from './translations';
import type { FullAutoFill, HTMLInputTypeAttribute } from 'svelte/elements';

export type Get<D, U = TranslationReference> = (data: D) => U;
export type GetOrVal<D, U = TranslationReference> = Get<D, U> | U;
const toGet = <D, U>(getOrValue: GetOrVal<D, U>) =>
    getOrValue instanceof Function ? getOrValue : () => getOrValue;

type Opts = {
    mask: string;
    definitions?: {
        [key: string]: RegExp;
    };
} | undefined;

const template = (strings: TemplateStringsArray, ...args: string[]) => {
    return strings.zip(args).flat().slice(0, -1).join('');
};

export const createTemplate =
    <U>(edit: (string: string) => U): ((strings: TemplateStringsArray, ...args: string[]) => U) =>
        (strings: TemplateStringsArray, ...args: string[]) =>
            edit(template(strings, ...args));
export const createTemplateG =
    <T extends string, U>(
        edit: (args: { strings: TemplateStringsArray; args: T[] }) => {
            strings: TemplateStringsArray;
            args: string[];
        },
        edit2: (string: string) => U
    ): ((strings: TemplateStringsArray, ...args: T[]) => U) =>
        (strings: TemplateStringsArray, ...args: T[]) => {
            const t = edit({ strings, args });
            return edit2(template(t.strings, ...t.args));
        };

export const p = createTemplate(
    (plainString: string) => `PLAIN_${plainString}` as `PLAIN_${typeof plainString}`
);

export function t(ref: TranslationReference) {
    return ref;
}

export const nazevSHvezdou = <D>(
    vec: Vec<D, unknown> & { required: Get<D, boolean> },
    data: D,
    t: Translations
) => {
    const nazev = t.get(vec.nazev(data));
    return nazev == '' ? '' : nazev + (!vec.required(data) ? '' : ' *');
};

export abstract class Vec<D, U> {
    abstract nazev: Get<D, TranslationReference>;
    abstract onError: Get<D, TranslationReference>;
    zobrazitErrorVeto = $state(false);
    abstract zobrazit: Get<D, boolean>;
    abstract showText: Get<D, boolean>;
    abstract value: U;

    abstract zpravaJeChybna: Get<D, boolean>;
    zobrazitError: Get<D, boolean> = $state(
        (data) => this.zobrazitErrorVeto && this.zpravaJeChybna(data)
    );
}

export class Nadpisova<D> extends Vec<D, undefined> {
    nazev = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    onError = () => '' as const;
    value = undefined;
    zpravaJeChybna = () => false;

    constructor(args: { nazev: GetOrVal<D>; zobrazit?: GetOrVal<D, boolean>; showInXML?: GetOrVal<D, boolean> }) {
        super();
        this.nazev = toGet(args.nazev);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
    }
}

export class Textova<D> extends Vec<D, undefined> {
    nazev = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    onError = () => '' as const;
    value = undefined;
    zpravaJeChybna = () => false;

    constructor(args: { nazev: GetOrVal<D>; zobrazit?: GetOrVal<D, boolean>; showInXML?: GetOrVal<D, boolean> }) {
        super();
        this.nazev = toGet(args.nazev);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
    }
}

export class Vybiratkova<D> extends Vec<D, TranslationReference | null> {
    nazev = $state() as Get<D, TranslationReference>;
    onError = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    moznosti = $state() as Get<D, TranslationReference[]>;
    value = $state() as TranslationReference | null;
    required = $state() as Get<D, boolean>;
    zpravaJeChybna = $state((a) => this.value == null && this.required(a)) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        moznosti: GetOrVal<D, TranslationReference[]>;
        onError?: GetOrVal<D>;
        required?: GetOrVal<D, boolean>;
        zobrazit?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        vybrano?: null | TranslationReference;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.required = toGet(args.required ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.vybrano ?? null;
    }
}

export type SearchItemPiece = { text: TranslationReference, width?: number };
export type SearchItem = { pieces: SearchItemPiece[], href?: string };

export class SearchWidget<D, T> extends Vec<D, T | null> {
    nazev = $state() as Get<D>;
    onError = $state() as Get<D>;
    zobrazit = $state() as Get<D, boolean>;
    type = $state() as Get<D, HTMLInputTypeAttribute>;
    getSearchItem = $state() as (item: T) => SearchItem;
    getXmlEntry = $state() as () => string;
    showText = $state() as Get<D, boolean>;
    items = $state() as Get<D, T[]>;
    value = $state() as T | null;
    required = $state() as Get<D, boolean>;
    zpravaJeChybna = $state((a) => this.value == null && this.required(a)) as Get<D, boolean>;

    constructor(args: {
        label: GetOrVal<D>;
        items: GetOrVal<D, T[]>;
        getSearchItem: (item: T) => SearchItem;
        getXmlEntry?: () => string;
        onError?: GetOrVal<D>;
        type?: GetOrVal<D, HTMLInputTypeAttribute>;
        required?: GetOrVal<D, boolean>;
        show?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        chosen?: null | T;
    }) {
        super();

        this.nazev = toGet(args.label);
        this.items = toGet(args.items);
        this.getSearchItem = toGet(args.getSearchItem);
        this.getXmlEntry = args.getXmlEntry ?? (() => JSON.stringify(this.value));
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.required = toGet(args.required ?? false);
        this.type = toGet(args.type ?? 'search');
        this.zobrazit = toGet(args.show ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.chosen ?? null;
    }
}

export type Pair = {
    first: TranslationReference | null;
    second: TranslationReference | null;
};

export class DvojVybiratkova<D> extends Vec<D, Pair> {
    nazev = $state() as Get<D, TranslationReference>;
    onError = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    lock1 = $state() as Get<D, boolean>;
    lock2 = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    moznosti1 = $state() as Get<D, TranslationReference[]>;
    moznosti2 = $state() as Get<D, TranslationReference[]>;
    value = $state() as Pair;
    required = $state() as Get<D, boolean>;

    zpravaJeChybna = $state(
        (a) => (this.value.first == null || this.value.second == null) && this.required(a)
    ) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        moznosti1: GetOrVal<D, TranslationReference[]>;
        moznosti2: GetOrVal<D, TranslationReference[]>;
        onError?: GetOrVal<D>;
        required?: GetOrVal<D, boolean>;
        zobrazit?: GetOrVal<D, boolean>;
        lock1?: GetOrVal<D, boolean>;
        lock2?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        vybrano?: Pair;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti1 = toGet(args.moznosti1);
        this.moznosti2 = toGet(args.moznosti2);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.required = toGet(args.required ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.lock1 = toGet(args.lock1 ?? false);
        this.lock2 = toGet(args.lock2 ?? false);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.vybrano ?? { first: null, second: null };
    }
}

export class Pocitatkova<D> extends Vec<D, number> {
    nazev = $state() as Get<D>;
    onError = $state() as Get<D>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    min = $state() as Get<D, number>;
    max = $state() as Get<D, number>;
    value = $state() as number;

    zpravaJeChybna = $state(() => false) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        min: GetOrVal<D, number>;
        max: GetOrVal<D, number>;
        onError?: GetOrVal<D>;
        zobrazit?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        vybrano: number;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.min = toGet(args.min);
        this.max = toGet(args.max);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.vybrano;
    }
}

export class Radiova<D> extends Vec<D, TranslationReference | null> {
    nazev = $state() as Get<D, TranslationReference>;
    onError = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    moznosti = $state() as Get<D, TranslationReference[]>;
    value = $state() as TranslationReference | null;
    required = $state() as Get<D, boolean>;

    zpravaJeChybna = $state((a) => this.value == null && this.required(a)) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        moznosti: GetOrVal<D, TranslationReference[]>;
        onError?: GetOrVal<D>;
        required?: GetOrVal<D, boolean>;
        zobrazit?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        vybrano?: null | TranslationReference;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.required = toGet(args.required ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.vybrano ?? null;
    }
}

export class Prepinatkova<D> extends Vec<D, boolean> {
    nazev = $state() as Get<D, TranslationReference>;
    onError = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    moznosti = $state() as readonly [TranslationReference, TranslationReference];
    value = $state() as boolean;
    required = $state() as Get<D, boolean>;
    hasPositivity = $state() as Get<D, boolean>;

    zpravaJeChybna = $state((a) => !this.value && this.required(a)) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        moznosti: readonly [TranslationReference, TranslationReference];
        onError?: GetOrVal<D>;
        required?: GetOrVal<D, boolean>;
        zobrazit?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        hasPositivity?: GetOrVal<D, boolean>;
        vybrano?: boolean;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = args.moznosti;
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.required = toGet(args.required ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.hasPositivity = toGet(args.hasPositivity ?? false);
        this.value = args.vybrano ?? false;
    }
}

export type Arr = TranslationReference[];

export class MultiZaskrtavatkova<D> extends Vec<D, Arr> {
    nazev = $state() as Get<D>;
    onError = $state() as Get<D>;
    max = $state() as Get<D, number>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    moznosti = $state() as Get<D, TranslationReference[]>;
    value = $state() as TranslationReference[];
    required = $state() as Get<D, boolean>;

    zpravaJeChybna = $state((a) => this.value.length == 0 && this.required(a)) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        moznosti: GetOrVal<D, TranslationReference[]>;
        onError?: GetOrVal<D>;
        required?: GetOrVal<D, boolean>;
        max?: GetOrVal<D, number>;
        zobrazit?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        vybrano?: TranslationReference[];
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.moznosti = toGet(args.moznosti);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.max = toGet(args.max ?? Number.MAX_VALUE);
        this.required = toGet(args.required ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.vybrano ?? [];
    }
}

export class Pisatkova<D> extends Vec<D, string> {
    nazev = $state() as Get<D, TranslationReference>;
    type = $state() as Get<D, HTMLInputTypeAttribute>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    onError = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    private valueField = $state() as string;

    get value() {
        return this.valueField;
    }

    set value(value: string) {
        this.valueField = value;
        this.updateMaskValue(value);
    }

    updateMaskValue = $state(() => {}) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    required = $state() as Get<D, boolean>;
    capitalize = $state() as Get<D, boolean>;
    zpravaJeChybna = $state(
        (a) =>
            (this.value == '' && this.required(a)) || (this.value != '' && !this.regex(a).test(this.value))
    ) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        onError?: GetOrVal<D>;
        regex?: GetOrVal<D, RegExp>;
        required?: GetOrVal<D, boolean>;
        capitalize?: GetOrVal<D, boolean>;
        maskOptions?: GetOrVal<D, Opts>;
        type?: GetOrVal<D, HTMLInputTypeAttribute>;
        autocomplete?: GetOrVal<D, FullAutoFill>;
        zobrazit?: GetOrVal<D, boolean>;
        lock?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        text?: string;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.regex = toGet(args.regex ?? /.*/);
        this.required = toGet(args.required ?? true);
        this.capitalize = toGet(args.capitalize ?? false);
        this.maskOptions = toGet(args.maskOptions ?? undefined);
        this.type = toGet(args.type ?? 'text');
        this.autocomplete = toGet(args.autocomplete ?? 'off');
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.lock = toGet(args.lock ?? false);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.value = args.text ?? '';
    }
}

export class Zaskrtavatkova<D> extends Vec<D, boolean> {
    nazev = $state() as Get<D, TranslationReference>;
    onError = $state() as Get<D, TranslationReference>;
    zobrazit = $state() as Get<D, boolean>;
    showText = $state() as Get<D, boolean>;
    enabled = $state() as Get<D, boolean>;
    value = $state() as boolean;
    required = $state() as Get<D, boolean>;

    zpravaJeChybna = $state((a) => !this.value && this.required(a)) as Get<D, boolean>;

    constructor(args: {
        nazev: GetOrVal<D>;
        onError?: GetOrVal<D>;
        required?: GetOrVal<D, boolean>;
        zobrazit?: GetOrVal<D, boolean>;
        showInXML?: GetOrVal<D, boolean>;
        enabled?: GetOrVal<D, boolean>;
        zaskrtnuto?: boolean;
    }) {
        super();

        this.nazev = toGet(args.nazev);
        this.onError = toGet(args.onError ?? t('requiredField'));
        this.required = toGet(args.required ?? true);
        this.zobrazit = toGet(args.zobrazit ?? true);
        this.showText = toGet(args.showInXML ?? ((data) => this.zobrazit(data)));
        this.enabled = toGet(args.enabled ?? true);
        this.value = args.zaskrtnuto ?? false;
    }
}
