import type { TranslationReference as TR, Translations } from './translations';
import type { FullAutoFill, HTMLInputTypeAttribute } from 'svelte/elements';

export type Get<D, U = TR> = TR extends U
    ? (data: D, t: Translations) => U : (data: D) => U;
export type GetOrVal<D, U = TR> = Get<D, U> | U;
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

export const p = createTemplate(
    (plainString: string) => `PLAIN_${plainString}` as `PLAIN_${typeof plainString}`
);

export const nazevSHvezdou = <D, U>(
    vec: Required<D, U, boolean>,
    data: D,
    t: Translations
) => {
    const nazev = t.get(vec.label(data, t));
    return nazev == '' ? '' : nazev + (!vec.required(data) ? '' : ' ∗');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class Widget<D = never, U = any, H extends boolean = boolean> {
    abstract label: Get<D>;
    abstract onError: Get<D>;
    displayErrorVeto = $state(false);
    abstract show: Get<D, boolean>;
    abstract showTextValue: Get<D, boolean>;
    abstract _value: U;
    get value() {
        return this._value;
    }

    setValue(data: D, value: U) {
        this._value = value;
        this.onValueSet(data, value);
    }

    mutateValue(data: D, value: (value: U) => U) {
        this._value = value(this._value);
        this.onValueSet(data, this._value);
    }

    abstract onValueSet: (data: D, newValue: U) => void;

    bindableValue(data: D) {
        const get = () => this.value;
        const set = (value: U) => this.setValue(data, value);
        return {
            get value() { return get(); },
            set value(value: U) { set(value); },
        };
    };

    abstract hideInRawData: H;

    abstract isError: Get<D, boolean>;
    showError: Get<D, boolean> = $state((data) => this.displayErrorVeto && this.isError(data));
}

export type SearchItemPiece = { readonly text: TR, readonly width?: number };
export type SearchItem = { readonly pieces: SearchItemPiece[], readonly href?: string };
export type Pair = { readonly first: TR | null; readonly second: TR | null; };
type Sides = readonly [TR, TR];
export type Arr = readonly TR[];

type HideArgs<H> = H extends false ? { hideInRawData?: H } : { hideInRawData: H };
type ShowArgs<D> = { show?: GetOrVal<D, boolean>; showInXML?: GetOrVal<D, boolean> };
type InfoArgs<D> = { text: GetOrVal<D, TR | Promise<TR>> } & ShowArgs<D>;
type ValueArgs<D, U, H> = {
    label: GetOrVal<D>, onError?: GetOrVal<D>; required?: GetOrVal<D, boolean>; onValueSet?: (data: D, newValue: U) => void
} & HideArgs<H> & ShowArgs<D>;
type ChooserArgs<D> = { options: GetOrVal<D, Arr>; chosen?: TR | null; };
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
    textArea?: GetOrVal<D, boolean>;
    maskOptions?: GetOrVal<D, Opts>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    autocomplete?: GetOrVal<D, FullAutoFill>;
    text?: string;
};

type Info<D, U> = Widget<D, U> & { text: Get<D, TR | Promise<TR>>; };
type Required<D, U, H extends boolean> = Widget<D, U, H> & { required: Get<D, boolean>; };
type Lock<D, U> = Widget<D, U> & { lock: Get<D, boolean>; };
type DoubleLock<D, U> = Widget<D, U> & { lock1: Get<D, boolean>; lock2: Get<D, boolean>; };
type Chooser<D> = Widget<D, TR | null> & { options: Get<D, Arr>; };
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
    textArea: Get<D, boolean>;
};

const initInfo = function <D, U>(widget: Info<D, U>, args: InfoArgs<D>) {
    widget.text = toGet(args.text);
    widget.show = toGet(args.show ?? true);
    widget.showTextValue = toGet(args.showInXML ?? (data => widget.show(data)));
};
const initValue = function <D, U, H extends boolean>(widget: Required<D, U, H>, args: ValueArgs<D, U, H>) {
    widget.label = toGet(args.label);
    widget.show = toGet(args.show ?? true);
    widget.showTextValue = toGet(args.showInXML ?? (data => widget.show(data)));
    widget.hideInRawData = (args.hideInRawData ?? false) as H;
    widget.onError = toGet(args.onError ?? 'requiredField');
    widget.required = toGet(args.required ?? true);
    widget.onValueSet = args.onValueSet ?? (() => {});
};
const initChooser = function <D>(widget: Chooser<D>, args: ChooserArgs<D>) {
    widget.options = toGet(args.options);
    widget._value = args.chosen ?? null;
};
const initDoubleChooser = function <D>(widget: DoubleChooser<D>, args: DoubleChooserArgs<D>) {
    widget.options1 = toGet(args.options1);
    widget.options2 = toGet(args.options2);
    widget._value = args.chosen ?? { first: null, second: null };
};
const initLock = function <D, U>(widget: Lock<D, U>, args: LockArgs<D>) {
    widget.lock = toGet(args.lock ?? false);
};
const initDoubleLock = function <D, U>(widget: DoubleLock<D, U>, args: DoubleLockArgs<D>) {
    widget.lock1 = toGet(args.lock1 ?? false);
    widget.lock2 = toGet(args.lock2 ?? false);
};
const initSearch = function <D, T>(widget: Search<D, T>, args: SearchArgs<D, T>) {
    widget._value = args.chosen ?? null;
    widget.items = toGet(args.items);
    widget.getSearchItem = toGet(args.getSearchItem);
    widget.getXmlEntry = args.getXmlEntry ?? (() => JSON.stringify(widget.value));
    widget.type = toGet(args.type ?? 'search');
};
const initCounter = function <D>(widget: Counter<D>, args: CounterArgs<D>) {
    widget._value = args.chosen;
    widget.min = toGet(args.min);
    widget.max = toGet(args.max);
};
const initSwitch = function <D>(widget: Switch<D>, args: SwitchArgs<D>) {
    widget.hasPositivity = toGet(args.hasPositivity ?? false);
    widget.options = args.options;
};
const initCheck = function <D>(widget: Widget<D, boolean>, args: CheckArgs) {
    widget._value = args.checked ?? false;
};
const initMultiChooser = function <D>(widget: MultiChooser<D>, args: MultiChooserArgs<D>) {
    widget._value = args.chosen ?? [];
    widget.max = toGet(args.max ?? Number.MAX_VALUE);
    widget.options = toGet(args.options);
};
const initInput = function <D>(widget: Input<D>, args: InputArgs<D>) {
    widget.regex = toGet(args.regex ?? /.*/);
    widget.capitalize = toGet(args.capitalize ?? false);
    widget.textArea = toGet(args.textArea ?? false);
    widget.maskOptions = toGet(args.maskOptions ?? undefined);
    widget.type = toGet(args.type ?? 'text');
    widget.autocomplete = toGet(args.autocomplete ?? 'off');
    widget._value = args.text ?? '';
};

export class TitleWidget<D> extends Widget<D, undefined, true> {
    text = ($state() as Get<D, TR | Promise<TR>>);
    label = () => '' as const;
    onError = () => '' as const;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = undefined;
    onValueSet = () => {};
    hideInRawData = true as const;
    isError = () => false;

    constructor(args: InfoArgs<D>) {
        super();
        initInfo(this, args);
    }
}

export class TextWidget<D> extends Widget<D, undefined, true> {
    text = ($state() as Get<D, TR | Promise<TR>>);
    label = () => '' as const;
    onError = () => '' as const;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = undefined;
    onValueSet = () => {};
    hideInRawData = true as const;
    isError = () => false;

    constructor(args: InfoArgs<D>) {
        super();
        initInfo(this, args);
    }
}

export class ChooserWidget<D, H extends boolean = false> extends Widget<D, TR | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as TR | null;
    onValueSet = $state() as (data: D, newValue: TR | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr>;

    constructor(args: ValueArgs<D, TR | null, H> & ChooserArgs<D> & LockArgs<D>) {
        super();
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
    _value = $state() as T | null;
    onValueSet = $state() as (data: D, newValue: T | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    getSearchItem = $state() as (item: T) => SearchItem;
    getXmlEntry = $state() as () => string;
    items = $state() as Get<D, T[]>;
    type = $state() as Get<D, HTMLInputTypeAttribute>;

    constructor(args: ValueArgs<D, T | null, H> & SearchArgs<D, T>) {
        super();
        initValue(this, args);
        initSearch(this, args);
    }
}

export class DoubleChooserWidget<D, H extends boolean = false> extends Widget<D, Pair, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as Pair;
    onValueSet = $state() as (data: D, newValue: Pair) => void;
    hideInRawData = $state() as H;
    isError = $state(
        a => (this.value.first == null || this.value.second == null) && this.required(a)
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock1 = $state() as Get<D, boolean>;
    lock2 = $state() as Get<D, boolean>;
    options1 = $state() as Get<D, Arr>;
    options2 = $state() as Get<D, Arr>;

    constructor(args: ValueArgs<D, Pair, H> & DoubleLockArgs<D> & DoubleChooserArgs<D>) {
        super();
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
    _value = $state() as number;
    onValueSet = $state() as (data: D, newValue: number) => void;
    required = () => false;
    hideInRawData = $state() as H;
    isError = $state(() => false) as Get<D, boolean>;
    min = $state() as Get<D, number>;
    max = $state() as Get<D, number>;

    constructor(args: ValueArgs<D, number, H> & CounterArgs<D>) {
        super();
        initValue(this, args);
        initCounter(this, args);
    }
}

export class RadioWidget<D, H extends boolean = false> extends Widget<D, TR | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as TR | null;
    onValueSet = $state() as (data: D, newValue: TR | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr>;

    constructor(args: ValueArgs<D, TR | null, H> & ChooserArgs<D> & LockArgs<D>) {
        super();
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
    _value = $state() as boolean;
    onValueSet = $state() as (data: D, newValue: boolean) => void;
    hideInRawData = $state() as H;
    isError = $state(a => !this.value && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    options = $state() as Sides;
    hasPositivity = $state() as Get<D, boolean>;

    constructor(args: ValueArgs<D, boolean, H> & CheckArgs & SwitchArgs<D>) {
        super();
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
    _value = $state() as Arr;
    onValueSet = $state() as (data: D, newValue: Arr) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value.length == 0 && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr>;
    max = $state() as Get<D, number>;

    constructor(args: ValueArgs<D, Arr, H> & MultiChooserArgs<D>) {
        super();
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
    _value = $state() as string;
    onValueSet = $state() as (data: D, newValue: string) => void;
    isError = $state(
        a => (this.value == '' && this.required(a)) || (this.value != '' && !this.regex(a).test(this.value))
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;

    setValue(data: D, value: string) {
        this._value = value;
        this.onValueSet(data, value);
        this.updateMaskValue(value);
    }

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    updateMaskValue = $state(() => {}) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as Get<D, boolean>;
    textArea = $state() as Get<D, boolean>;

    constructor(args: ValueArgs<D, string, H> & LockArgs<D> & InputArgs<D>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput(this, args);
    }
}
export class ScannerWidget<D> extends InputWidget<D> {}

export class CheckboxWidget<D, H extends boolean = false> extends Widget<D, boolean, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as boolean;
    onValueSet = $state() as (data: D, newValue: boolean) => void;
    hideInRawData = $state() as H;
    required = $state() as Get<D, boolean>;
    isError = $state(a => !this.value && this.required(a)) as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;

    constructor(args: ValueArgs<D, boolean, H> & LockArgs<D> & CheckArgs) {
        super();
        initValue(this, args);
        initLock(this, args);
        initCheck(this, args);
    }
}
