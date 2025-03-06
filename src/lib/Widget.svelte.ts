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

export const nazevSHvezdou = <D>(
    vec: Widget<D, unknown> & { required: Get<D, boolean> },
    data: D,
    t: Translations
) => {
    const nazev = t.get(vec.label(data));
    return nazev == '' ? '' : nazev + (!vec.required(data) ? '' : ' *');
};

export abstract class Widget<D, U, H extends boolean = boolean> {
    abstract label: Get<D>;
    abstract onError: Get<D>;
    displayErrorVeto = $state(false);
    abstract show: Get<D, boolean>;
    abstract showTextValue: Get<D, boolean>;
    abstract value: U;
    abstract hideInRawData: H;

    abstract isError: Get<D, boolean>;
    showError: Get<D, boolean> = $state((data) => this.displayErrorVeto && this.isError(data));
}

export type SearchItemPiece = { text: TranslationReference, width?: number };
export type SearchItem = { pieces: SearchItemPiece[], href?: string };
export type Pair = { first: TranslationReference | null; second: TranslationReference | null; };
type Sides = readonly [TranslationReference, TranslationReference];
export type Arr = TranslationReference[];

type HideArgs<H> = H extends false ? { hideInRawData?: H } : { hideInRawData: H };
type TextArgs<D> = { label: GetOrVal<D>; show?: GetOrVal<D, boolean>; showInXML?: GetOrVal<D, boolean> };
type ValueArgs<D, H> = { onError?: GetOrVal<D>; required?: GetOrVal<D, boolean> } & HideArgs<H>;
type ChooserArgs<D> = { options: GetOrVal<D, Arr>; chosen?: TranslationReference | null; };
type DoubleChooserArgs<D> = { options1: GetOrVal<D, Arr>; options2: GetOrVal<D, Arr>; chosen?: Pair; };
type LockArgs<D> = { lock?: GetOrVal<D, boolean>; };
type DoubleLockArgs<D> = { lock1?: GetOrVal<D, boolean>; lock2?: GetOrVal<D, boolean>; };
type SearchArgs<D, T> = {
    getSearchItem: (item: T) => SearchItem;
    getXmlEntry?: () => string;
    items: GetOrVal<D, T[]>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    chosen?: null | T;
};
type CounterArgs<D> = { chosen: number; min: GetOrVal<D, number>; max: GetOrVal<D, number>; };
type CheckArgs = { checked?: boolean; };
type SwitchArgs<D> = { hasPositivity?: GetOrVal<D, boolean>; options: Sides };
type MultiChooserArgs<D> = { options: GetOrVal<D, Arr>; chosen?: Arr; max?: GetOrVal<D, number> };
type InputArgs<D> = {
    regex?: GetOrVal<D, RegExp>;
    capitalize?: GetOrVal<D, boolean>;
    maskOptions?: GetOrVal<D, Opts>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    autocomplete?: GetOrVal<D, FullAutoFill>;
    text?: string;
};

type Required<D, H extends boolean> = Widget<D, unknown, H> & { required?: GetOrVal<D, boolean>; };
type Lock<D> = Widget<D, unknown> & { lock?: GetOrVal<D, boolean>; };
type DoubleLock<D> = Widget<D, unknown> & { lock1: Get<D, boolean>; lock2: Get<D, boolean>; };
type Chooser<D> = Widget<D, TranslationReference | null> & { options: Get<D, Arr>; };
type DoubleChooser<D> = Widget<D, Pair> & { options1: Get<D, Arr>; options2: Get<D, Arr>; };
type Search<D, T> = Widget<D, T | null> & {
    getSearchItem: (item: T) => SearchItem;
    getXmlEntry: () => string;
    items: Get<D, T[]>;
    type: Get<D, HTMLInputTypeAttribute>;
};
type Counter<D> = Widget<D, number> & { min: Get<D, number>; max: Get<D, number>; };
type Switch<D> = Widget<D, boolean> & { options: Sides; hasPositivity: Get<D, boolean>; };
type MultiChooser<D> = Widget<D, Arr> & { options: Get<D, Arr>; max: Get<D, number>; };
type Input<D> = Widget<D, string> & {
    type: Get<D, HTMLInputTypeAttribute>;
    autocomplete: Get<D, FullAutoFill>;
    updateMaskValue: (text: string) => void;
    maskOptions: Get<D, Opts>;
    regex: Get<D, RegExp>;
    capitalize: Get<D, boolean>;
};

const initText = function <D>(widget: Widget<D, unknown>, args: TextArgs<D>) {
    widget.label = toGet(args.label);
    widget.show = toGet(args.show ?? true);
    widget.showTextValue = toGet(args.showInXML ?? ((data) => widget.show(data)));
};
const initValue = function <D, H extends boolean>(widget: Required<D, H>, args: ValueArgs<D, H>) {
    widget.hideInRawData = (args.hideInRawData ?? false) as H;
    widget.onError = toGet(args.onError ?? 'requiredField');
    widget.required = toGet(args.required ?? true);
};
const initChooser = function <D>(widget: Chooser<D>, args: ChooserArgs<D>) {
    widget.options = toGet(args.options);
    widget.value = args.chosen ?? null;
};
const initDoubleChooser = function <D>(widget: DoubleChooser<D>, args: DoubleChooserArgs<D>) {
    widget.options1 = toGet(args.options1);
    widget.options2 = toGet(args.options2);
    widget.value = args.chosen ?? { first: null, second: null };
};
const initLock = function <D>(widget: Lock<D>, args: LockArgs<D>) {
    widget.lock = toGet(args.lock ?? false);
};
const initDoubleLock = function <D>(widget: DoubleLock<D>, args: DoubleLockArgs<D>) {
    widget.lock1 = toGet(args.lock1 ?? false);
    widget.lock2 = toGet(args.lock2 ?? false);
};
const initSearch = function <D, T>(widget: Search<D, T>, args: SearchArgs<D, T>) {
    widget.value = args.chosen ?? null;
    widget.items = toGet(args.items);
    widget.getSearchItem = toGet(args.getSearchItem);
    widget.getXmlEntry = args.getXmlEntry ?? (() => JSON.stringify(widget.value));
    widget.type = toGet(args.type ?? 'search');
};
const initCounter = function <D>(widget: Counter<D>, args: CounterArgs<D>) {
    widget.value = args.chosen;
    widget.min = toGet(args.min);
    widget.max = toGet(args.max);
};
const initSwitch = function <D>(widget: Switch<D>, args: SwitchArgs<D>) {
    widget.hasPositivity = toGet(args.hasPositivity ?? false);
    widget.options = args.options;
};
const initCheck = function <D>(widget: Widget<D, boolean>, args: CheckArgs) {
    widget.value = args.checked ?? false;
};
const initMultiChooser = function <D>(widget: MultiChooser<D>, args: MultiChooserArgs<D>) {
    widget.value = args.chosen ?? [];
    widget.max = toGet(args.max ?? Number.MAX_VALUE);
    widget.options = toGet(args.options);
};
const initInput = function <D>(widget: Input<D>, args: InputArgs<D>) {
    widget.regex = toGet(args.regex ?? /.*/);
    widget.capitalize = toGet(args.capitalize ?? false);
    widget.maskOptions = toGet(args.maskOptions ?? undefined);
    widget.type = toGet(args.type ?? 'text');
    widget.autocomplete = toGet(args.autocomplete ?? 'off');
    widget.value = args.text ?? '';
};

export class TitleWidget<D> extends Widget<D, undefined, true> {
    label = $state() as Get<D>;
    onError = () => '' as const;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = undefined;
    hideInRawData = true as const;
    isError = () => false;

    constructor(args: TextArgs<D>) {
        super();
        initText(this, args);
    }
}

export class TextWidget<D> extends Widget<D, undefined, true> {
    label = $state() as Get<D>;
    onError = () => '' as const;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = undefined;
    hideInRawData = true as const;
    isError = () => false;

    constructor(args: TextArgs<D>) {
        super();
        initText(this, args);
    }
}

export class ChooserWidget<D, H extends boolean = false> extends Widget<D, TranslationReference | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as TranslationReference | null;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & ChooserArgs<D> & LockArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
    }
}

export class SearchWidget<D, T, H extends boolean = false> extends Widget<D, T | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as T | null;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    getSearchItem = $state() as (item: T) => SearchItem;
    getXmlEntry = $state() as () => string;
    items = $state() as Get<D, T[]>;
    type = $state() as Get<D, HTMLInputTypeAttribute>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & SearchArgs<D, T>) {
        super();
        initText(this, args);
        initValue(this, args);
        initSearch(this, args);
    }
}

export class DoubleChooserWidget<D, H extends boolean = false> extends Widget<D, Pair, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as Pair;
    hideInRawData = $state() as H;
    isError = $state(
        a => (this.value.first == null || this.value.second == null) && this.required(a)
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock1 = $state() as Get<D, boolean>;
    lock2 = $state() as Get<D, boolean>;
    options1 = $state() as Get<D, Arr>;
    options2 = $state() as Get<D, Arr>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & DoubleLockArgs<D> & DoubleChooserArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initDoubleChooser(this, args);
        initDoubleLock(this, args);
    }
}

export class CounterWidget<D, H extends boolean = false> extends Widget<D, number, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as number;
    hideInRawData = $state() as H;
    isError = $state(() => false) as Get<D, boolean>;
    min = $state() as Get<D, number>;
    max = $state() as Get<D, number>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & CounterArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initCounter(this, args);
    }
}

export class RadioWidget<D, H extends boolean = false> extends Widget<D, TranslationReference | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as TranslationReference | null;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & ChooserArgs<D> & LockArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
    }
}

export class SwitchWidget<D, H extends boolean = false> extends Widget<D, boolean, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as boolean;
    hideInRawData = $state() as H;
    isError = $state(a => !this.value && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    options = $state() as Sides;
    hasPositivity = $state() as Get<D, boolean>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & CheckArgs & SwitchArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initCheck(this, args);
        initSwitch(this, args);
    }
}

export class MultiCheckboxWidget<D, H extends boolean = false> extends Widget<D, Arr, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as Arr;
    hideInRawData = $state() as H;
    isError = $state(a => this.value.length == 0 && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr>;
    max = $state() as Get<D, number>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & MultiChooserArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initMultiChooser(this, args);
    }
}

export class InputWidget<D, H extends boolean = false> extends Widget<D, string, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    hideInRawData = $state() as H;
    private valueField = $state() as string;
    isError = $state(
        a => (this.value == '' && this.required(a)) || (this.value != '' && !this.regex(a).test(this.value))
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;

    get value() {
        return this.valueField;
    }

    set value(value: string) {
        this.valueField = value;
        this.updateMaskValue(value);
    }

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    updateMaskValue = $state(() => {}) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as Get<D, boolean>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & LockArgs<D> & InputArgs<D>) {
        super();
        initText(this, args);
        initValue(this, args);
        initLock(this, args);
        initInput(this, args);
    }
}

export class CheckboxWidget<D, H extends boolean = false> extends Widget<D, boolean, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    value = $state() as boolean;
    hideInRawData = $state() as H;
    required = $state() as Get<D, boolean>;
    isError = $state(a => !this.value && this.required(a)) as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;

    constructor(args: TextArgs<D> & ValueArgs<D, H> & LockArgs<D> & CheckArgs) {
        super();
        initText(this, args);
        initValue(this, args);
        initLock(this, args);
        initCheck(this, args);
    }
}
