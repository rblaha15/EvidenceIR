import type { TranslationReference as TR, Translations } from './translations';
import type { ClassValue, FullAutoFill, HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';

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

export const STAR = '∗';

export const labelAndStar = <D, U>(
    widget: Required<D, U, boolean>,
    data: D,
    t: Translations
) => {
    const label = t.get(widget.label(data, t));
    return label == '' ? '' : label + (!widget.required(data) ? '' : ` ${STAR}`);
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
export type SearchItem = { readonly pieces: SearchItemPiece[], readonly href?: string, disabled?: boolean };
export type Pair<I1 extends TR, I2 extends TR> = { readonly first: I1 | null; readonly second: I2 | null; };
type Sides = readonly [TR, TR];
export type Arr<I extends TR> = readonly I[];
export type ChI = { readonly checked: boolean; readonly text: string; };
export type SeI<I extends TR> = { readonly chosen: I; readonly text: string; };
export type SeCh<I extends TR> = { readonly chosen: I | null; readonly checked: boolean; };
export type Files = readonly string[];

type HideArgs<H> = H extends false ? { hideInRawData?: H } : { hideInRawData: H };
type ShowArgs<D> = { show?: GetOrVal<D, boolean>; showInXML?: GetOrVal<D, boolean> };
type InfoArgs<D> = { text: GetOrVal<D, TR | Promise<TR>>; class?: GetOrVal<D, ClassValue | undefined>; } & ShowArgs<D>;
type ValueArgs<D, U, H> = {
    label: GetOrVal<D>, onError?: GetOrVal<D>; required?: GetOrVal<D, boolean>; onValueSet?: (data: D, newValue: U) => void
} & HideArgs<H> & ShowArgs<D>;
type FileArgs<D> = {
    multiple?: GetOrVal<D, boolean>; max?: GetOrVal<D, number>;
};
type ChooserArgs<D, I extends TR> = { options: GetOrVal<D, Arr<I>>; chosen?: I | null; };
type SecondChooserArgs<I extends TR> = { options: Arr<I>; chosen?: I; text?: string; };
type DoubleChooserArgs<D, I1 extends TR, I2 extends TR> = { options1: GetOrVal<D, Arr<I1>>; options2: GetOrVal<D, Arr<I2>>; chosen?: Pair<I1, I2>; };
type LockArgs<D> = { lock?: GetOrVal<D, boolean>; };
type DoubleLockArgs<D> = { lock1?: GetOrVal<D, boolean>; lock2?: GetOrVal<D, boolean>; };
type SearchArgs<D, T> = {
    getSearchItem: (item: T) => SearchItem;
    getXmlEntry?: () => string;
    items: GetOrVal<D, T[]>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<D, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<D, HTMLInputAttributes['autocapitalize']>;
    chosen?: null | T;
};
type CounterArgs<D> = { chosen: number; min: GetOrVal<D, number>; max: GetOrVal<D, number>; };
type CountersArgs<D> = { counts: number[]; max: GetOrVal<D, number>; options: GetOrVal<D, Arr<TR>> };
type CheckArgs = { checked?: boolean; };
type SwitchArgs<D> = { hasPositivity?: GetOrVal<D, boolean>; options: Sides };
type MultiChooserArgs<D, I extends TR> = { options: GetOrVal<D, Arr<I>>; chosen?: Arr<I>; max?: GetOrVal<D, number> };
type Input1Args<D> = {
    regex?: GetOrVal<D, RegExp>;
    capitalize?: GetOrVal<D, boolean>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<D, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<D, HTMLInputAttributes['autocapitalize']>;
};
type Input2Args<D> = {
    textArea?: GetOrVal<D, boolean>;
    maskOptions?: GetOrVal<D, Opts>;
    autocomplete?: GetOrVal<D, FullAutoFill>;
};
type Input3Args<D> = {
    text?: string;
    suffix?: GetOrVal<D, TR | undefined>;
};
type SuggestionsArgs<D> = {
    suggestions: GetOrVal<D, Arr<TR>>;
};

type Info<D, U> = Widget<D, U> & { text: Get<D, TR | Promise<TR>>; class: Get<D, ClassValue | undefined>; };
type Required<D, U, H extends boolean> = Widget<D, U, H> & { required: Get<D, boolean>; };
type File<D> = Widget<D, Files> & { multiple: Get<D, boolean>; max: Get<D, number>; };
type Lock<D, U> = Widget<D, U> & { lock: Get<D, boolean>; };
type DoubleLock<D, U> = Widget<D, U> & { lock1: Get<D, boolean>; lock2: Get<D, boolean>; };
type Chooser<D, I extends TR> = Widget<D, I | null> & { options: Get<D, Arr<I>>; };
type SecondChooser<D, I extends TR> = Widget<D, SeI<I>> & { options: Arr<I>; };
type DoubleChooser<D, I1 extends TR, I2 extends TR> = Widget<D, Pair<I1, I2>> & { options1: Get<D, Arr<I1>>; options2: Get<D, Arr<I2>>; };
type Search<D, T> = Widget<D, T | null> & {
    getSearchItem: (item: T) => SearchItem;
    getXmlEntry: () => string;
    items: Get<D, T[]>;
    type: Get<D, HTMLInputTypeAttribute>;
    enterkeyhint: Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<D, HTMLInputAttributes['autocapitalize']>;
};
type Counter<D> = Widget<D, number> & { min: Get<D, number>; max: Get<D, number>; };
type Counters<D> = Widget<D, number[]> & { max: Get<D, number>; options: Get<D, Arr<TR>> };
type Switch<D> = Widget<D, boolean> & { options: Sides; hasPositivity: Get<D, boolean>; };
type MultiChooser<D, I extends TR> = Widget<D, Arr<I>> & { options: Get<D, Arr<I>>; max: Get<D, number>; };
type Input1<D, U> = Widget<D, U> & {
    type: Get<D, HTMLInputTypeAttribute>;
    enterkeyhint: Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<D, HTMLInputAttributes['autocapitalize']>;
    regex: Get<D, RegExp>;
    capitalize: Get<D, boolean>;
};
type Input2<D, U> = Widget<D, U> & {
    textArea: Get<D, boolean>;
    autocomplete: Get<D, FullAutoFill>;
    updateMaskValue: (text: string) => void;
    maskOptions: Get<D, Opts>;
};
type Input3<D> = Widget<D, string> & {
    suffix: Get<D, TR | undefined>;
}
type Suggestions<D> = Widget<D, string> & {
    suggestions: GetOrVal<D, Arr<TR>>;
};

const initInfo = function <D, U>(widget: Info<D, U>, args: InfoArgs<D>) {
    widget.text = toGet(args.text);
    widget.show = toGet(args.show ?? true);
    widget.class = toGet(args.class);
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
const initFile = function <D>(widget: File<D>, args: FileArgs<D>) {
    widget.multiple = toGet(args.multiple ?? false);
    widget.max = toGet(args.max ?? Number.POSITIVE_INFINITY);
};
const initChooser = function <D, I extends TR>(widget: Chooser<D, I>, args: ChooserArgs<D, I>) {
    widget.options = toGet(args.options);
    widget._value = args.chosen ?? null;
};
const initSecondChooser = function <D, I extends TR>(widget: SecondChooser<D, I>, args: SecondChooserArgs<I>) {
    widget.options = args.options;
    widget._value = { chosen: args.chosen ?? args.options[0], text: args.text ?? '' };
};
const initDoubleChooser = function <D, I1 extends TR, I2 extends TR>(widget: DoubleChooser<D, I1, I2>, args: DoubleChooserArgs<D, I1, I2>) {
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
    widget.enterkeyhint = toGet(args.enterkeyhint);
    widget.inputmode = toGet(args.inputmode);
    widget.autocapitalize = toGet(args.autocapitalize);
};
const initCounter = function <D>(widget: Counter<D>, args: CounterArgs<D>) {
    widget._value = args.chosen;
    widget.min = toGet(args.min);
    widget.max = toGet(args.max);
};
const initCounters = function <D>(widget: Counters<D>, args: CountersArgs<D>) {
    widget._value = args.counts;
    widget.max = toGet(args.max);
    widget.options = toGet(args.options);
};
const initSwitch = function <D>(widget: Switch<D>, args: SwitchArgs<D>) {
    widget.hasPositivity = toGet(args.hasPositivity ?? false);
    widget.options = args.options;
};
const initCheck = function <D>(widget: Widget<D, boolean>, args: CheckArgs) {
    widget._value = args.checked ?? false;
};
const initMultiChooser = function <D, I extends TR>(widget: MultiChooser<D, I>, args: MultiChooserArgs<D, I>) {
    widget._value = args.chosen ?? [];
    widget.max = toGet(args.max ?? Number.MAX_VALUE);
    widget.options = toGet(args.options);
};
const initInput1 = function <D, U>(widget: Input1<D, U>, args: Input1Args<D>) {
    widget.regex = toGet(args.regex ?? /.*/);
    widget.capitalize = toGet(args.capitalize ?? false);
    widget.type = toGet(args.type ?? 'text');
    widget.enterkeyhint = toGet(args.enterkeyhint);
    widget.inputmode = toGet(args.inputmode);
    widget.autocapitalize = toGet(args.autocapitalize);
};
const initInput2 = function <D, U>(widget: Input2<D, U>, args: Input2Args<D>) {
    widget.textArea = toGet(args.textArea ?? false);
    widget.maskOptions = toGet(args.maskOptions ?? undefined);
    widget.autocomplete = toGet(args.autocomplete ?? 'off');
};
const initInput3 = function <D>(widget: Input3<D>, args: Input3Args<D>) {
    widget._value = args.text ?? '';
    widget.suffix = toGet(args.suffix);
};
const initSuggestions = function <D>(widget: Suggestions<D>, args: SuggestionsArgs<D>) {
    widget.suggestions = toGet(args.suggestions);
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
    class = $state() as Get<D, ClassValue>;

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
    class = $state() as Get<D, ClassValue>;

    constructor(args: InfoArgs<D>) {
        super();
        initInfo(this, args);
    }
}

export class ChooserWidget<D, I extends TR, H extends boolean = false> extends Widget<D, I | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as I | null;
    onValueSet = $state() as (data: D, newValue: I | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr<I>>;

    constructor(args: ValueArgs<D, I | null, H> & ChooserArgs<D, I> & LockArgs<D>) {
        super();
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
    }
}

export class CheckboxWithChooserWidget<D, I extends TR, H extends boolean = false> extends Widget<D, SeCh<I>, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as SeCh<I>;
    onValueSet = $state() as (data: D, newValue: SeCh<I>) => void;
    hideInRawData = $state() as H;
    isError = $state(a => (this.value.chosen == null || !this.value.checked) && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr<I>>;

    constructor(args: ValueArgs<D, SeCh<I>, H> & ChooserArgs<D, I> & CheckArgs) {
        super();
        initValue(this, args);
        this.options = toGet(args.options);
        this._value = { chosen: args.chosen ?? null, checked: args.checked ?? false };
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
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;

    constructor(args: ValueArgs<D, T | null, H> & SearchArgs<D, T>) {
        super();
        initValue(this, args);
        initSearch(this, args);
    }
}

export class InputWithSuggestionsWidget<D, H extends boolean = false> extends Widget<D, string, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as string;
    onValueSet = $state() as (data: D, newValue: string) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    suggestions = $state() as Get<D, Arr<TR>>;
    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    suffix = $state() as Get<D, TR | undefined>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as Get<D, boolean>;

    setValue(data: D, value: string) {
        this._value = value;
        this.onValueSet(data, this._value);
    }

    constructor(args: ValueArgs<D, string, H> & Input1Args<D> & Input3Args<D> & SuggestionsArgs<D>) {
        super();
        initValue(this, args);
        initInput1(this, args);
        initInput3(this, args);
        initSuggestions(this, args);
    }
}

export class DoubleChooserWidget<D, I1 extends TR, I2 extends TR, H extends boolean = false> extends Widget<D, Pair<I1, I2>, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as Pair<I1, I2>;
    onValueSet = $state() as (data: D, newValue: Pair<I1, I2>) => void;
    hideInRawData = $state() as H;
    isError = $state(
        a => (this.value.first == null || this.value.second == null) && this.required(a)
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock1 = $state() as Get<D, boolean>;
    lock2 = $state() as Get<D, boolean>;
    options1 = $state() as Get<D, Arr<I1>>;
    options2 = $state() as Get<D, Arr<I2>>;

    constructor(args: ValueArgs<D, Pair<I1, I2>, H> & DoubleLockArgs<D> & DoubleChooserArgs<D, I1, I2>) {
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

export class CountersWidget<D, H extends boolean = false> extends Widget<D, number[], H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    required = () => false;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as number[];
    onValueSet = $state() as (data: D, newValue: number[]) => void;
    hideInRawData = $state() as H;
    isError = $state(() => false) as Get<D, boolean>;
    max = $state() as Get<D, number>;
    options = $state() as Get<D, Arr<TR>>;

    constructor(args: ValueArgs<D, number[], H> & CountersArgs<D>) {
        super();
        initValue(this, args);
        initCounters(this, args);
    }
}

export class RadioWidget<D, I extends TR, H extends boolean = false> extends Widget<D, I | null, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as I | null;
    onValueSet = $state() as (data: D, newValue: I | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr<I>>;

    constructor(args: ValueArgs<D, I | null, H> & ChooserArgs<D, I> & LockArgs<D>) {
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

export class MultiCheckboxWidget<D, I extends TR, H extends boolean = false> extends Widget<D, Arr<I>, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    _value = $state() as Arr<I>;
    onValueSet = $state() as (data: D, newValue: Arr<I>) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value.length == 0 && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    options = $state() as Get<D, Arr<I>>;
    max = $state() as Get<D, number>;

    constructor(args: ValueArgs<D, Arr<I>, H> & MultiChooserArgs<D, I>) {
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
        this.onValueSet(data, this._value);
        this.updateMaskValue(this._value);
    }

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    suffix = $state() as Get<D, TR | undefined>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    updateMaskValue = $state(() => {}) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as Get<D, boolean>;
    textArea = $state() as Get<D, boolean>;

    constructor(args: ValueArgs<D, string, H> & LockArgs<D> & Input1Args<D> & Input2Args<D> & Input3Args<D>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        initInput3(this, args);
    }
}

export class ScannerWidget<D, H extends boolean = false> extends InputWidget<D, H> {

    processScannedText = $state() as (text: string, data: D) => string;

    constructor(args: ValueArgs<D, string, H> & LockArgs<D> & Input1Args<D> & Input2Args<D> & Input3Args<D> & {
        processScannedText?: (text: string, data: D) => string
    }) {
        super(args);
        this.processScannedText = args.processScannedText ?? (t => t)
    }
}

export class PhotoSelectorWidget<D, H extends boolean = false> extends Widget<D, Files, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = () => false;
    hideInRawData = $state() as H;
    _value = $state<Files>([]);
    onValueSet = $state() as (data: D, newValue: Files) => void;
    isError = $state(a => (this.value.length == 0) && this.required(a)) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;
    multiple = $state() as Get<D, boolean>;
    max = $state() as Get<D, number>;

    constructor(args: ValueArgs<D, Files, H> & FileArgs<D> & LockArgs<D>) {
        super();
        initValue(this, args);
        initFile(this, args);
        initLock(this, args);
    }
}

export class InputWithChooserWidget<D, I extends TR, H extends boolean = false> extends Widget<D, SeI<I>, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    options = $state() as Arr<I>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    hideInRawData = $state() as H;
    _value = $state() as SeI<I>;
    onValueSet = $state() as (data: D, newValue: SeI<I>) => void;
    isError = $state(
        a => (this.value.text == '' && this.required(a)) || (this.value.text != '' && !this.regex(a).test(this.value.text))
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;

    setValue(data: D, value: SeI<I>) {
        this._value = value;
        this.onValueSet(data, this._value);
        this.updateMaskValue(this._value.text);
    }

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    updateMaskValue = $state(() => {}) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as Get<D, boolean>;
    textArea = $state() as Get<D, boolean>;

    constructor(args: ValueArgs<D, SeI<I>, H> & LockArgs<D> & Input1Args<D> & Input2Args<D> & Input3Args<D> & SecondChooserArgs<I>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        initSecondChooser(this, args);
    }
}

export class CheckboxWithInputWidget<D, H extends boolean = false> extends Widget<D, ChI, H> {
    label = $state() as Get<D>;
    onError = $state() as Get<D>;
    show = $state() as Get<D, boolean>;
    showTextValue = $state() as Get<D, boolean>;
    hideInRawData = $state() as H;
    _value = $state() as ChI;
    onValueSet = $state() as (data: D, newValue: ChI) => void;
    isError = $state(
        a => (this.value.text == '' && this.required(a)) ||
            (!this.value.checked && this.required(a)) ||
            (this.value.text != '' && !this.regex(a).test(this.value.text))
    ) as Get<D, boolean>;
    required = $state() as Get<D, boolean>;
    lock = $state() as Get<D, boolean>;

    setValue(data: D, value: ChI) {
        this._value = value;
        this.onValueSet(data, this._value);
        this.updateMaskValue(this._value.text);
    }

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    updateMaskValue = $state(() => {}) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as Get<D, boolean>;
    textArea = $state() as Get<D, boolean>;

    constructor(args: ValueArgs<D, ChI, H> & LockArgs<D> & Input1Args<D> & Input2Args<D> & Input3Args<D> & CheckArgs) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        this._value = { checked: args.checked ?? false, text: args.text ?? '' };
    }
}

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
