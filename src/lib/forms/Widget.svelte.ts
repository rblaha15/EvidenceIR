import type { Translations } from '../translations';
import type { ClassValue, FullAutoFill, HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
import type { Untranslatable } from '$lib/translations/untranslatables';
import type { Readable } from 'svelte/store';
import type { DataOfPdf, Pdf as PdfType, PdfParameters } from '$lib/pdf/pdf';
import type { Form } from '$lib/forms/Form';

export type GetB<D> = Get<D, boolean>;
export type GetBOrVal<D> = GetOrVal<D, boolean>;
export type GetTA<D> = GetT<D, string[]>;
export type GetTAOrVal<D> = GetTOrVal<D, string[]>;
export type GetTU<D> = GetT<D, string | undefined>;
export type GetTUOrVal<D> = GetTOrVal<D, string | undefined>;
export type GetTP<D> = GetT<D, Promise<string> | string>;
export type GetTPOrVal<D> = GetTOrVal<D, Promise<string> | string>;
export type GetTAR<D> = GetT<D, Readable<string[]>>;
export type GetTAROrVal<D> = GetTOrVal<D, Readable<string[]>>;
export type GetR<D, U> = Get<D, Readable<U>>;
export type GetROrVal<D, U> = GetOrVal<D, Readable<U>>;
export type GetTR<D, U> = GetT<D, Readable<U>>;
export type GetTROrVal<D, U> = GetTOrVal<D, Readable<U>>;

export type Get<D, U> = (data: D) => U;
export type GetT<D, U = string> = (t: Translations, data: D) => U;

export type GetOrVal<D, U> = Get<D, U> | U;
export type GetTOrVal<D, U = string> = GetT<D, U> | U;

const toGetA = <D, U>(getAOrValue: GetOrVal<D, U>) =>
    getAOrValue instanceof Function ? getAOrValue : () => getAOrValue;
const toGetT = <D, U>(getTOrValue: GetTOrVal<D, U>) =>
    getTOrValue instanceof Function ? getTOrValue : () => getTOrValue;

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
    t: Translations,
    getLabel: GetT<D> = widget.label,
) => {
    const label = getLabel(t, data);
    return label == '' ? '' : label + (!widget.required(data) ? '' : ` ${STAR}`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class Widget<D = never, U = any, H extends boolean = boolean> {
    abstract label: GetT<D>;
    abstract onError: GetT<D>;
    displayErrorVeto = $state(false);
    abstract show: GetB<D>;
    abstract showTextValue: GetB<D>;
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
            get value() {
                return get();
            },
            set value(value: U) {
                set(value);
            },
        };
    };

    abstract hideInRawData: H;

    abstract isError: GetB<D>;
    showError: GetB<D> = $state((data) => this.displayErrorVeto && this.isError(data));
}

type K = string;
type T<I extends K> = (t: Translations) => Record<Exclude<I, Untranslatable>, string>;

export type SearchItemPiece = {
    readonly text: string,
    readonly width?: number,
    readonly icon?: string,
    readonly color?: Color,
    readonly iconColor?: Color,
};
export type SearchItem = {
    readonly pieces: SearchItemPiece[],
    readonly href?: string,
    readonly disabled?: boolean,
    readonly otherSearchParts?: string[],
};
export type Pair<I1 extends K, I2 extends K> = { readonly first: I1 | null; readonly second: I2 | null; };
type Sides = (t: Translations) => ([string, string]);
export type Arr<I extends K> = readonly I[];
export type Rec<I extends K> = Record<I, number>;
export type ChI = { readonly checked: boolean; readonly text: string; };
export type SeI<I extends K> = { readonly chosen: I; readonly text: string; };
export type RaI<I extends K> = { readonly chosen: I | null; readonly text: string; };
export type SeCh<I extends K> = { readonly chosen: I | null; readonly checked: boolean; };
export type Files = readonly { fileName: string, uuid: string }[];
export type InlinePdfPreviewData<D, P extends PdfType> = {
    type: P,
    data: DataOfPdf<P>,
    form: Form<D>,
} & PdfParameters<P>;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type Color = 'warning' | 'danger' | 'primary' | 'info' | 'secondary' | 'success'
export type BtnColor = Color | `outline-${Color}`

type HideArgs<H> = H extends false ? { hideInRawData?: H } : { hideInRawData: H };
type ShowArgs<D> = { show?: GetBOrVal<D>; showInXML?: GetBOrVal<D> };
type InfoArgs<D> = { text: GetTPOrVal<D>; class?: GetOrVal<D, ClassValue | undefined>; } & ShowArgs<D>;
type BtnArgs<D> =
    { text: GetTOrVal<D>; color: GetOrVal<D, BtnColor>; icon?: GetOrVal<D, string | undefined>; onClick: Get<D, void> }
    & ShowArgs<D>;
type TitleArgs = { level: HeadingLevel };
type PdfArgs<D, P extends PdfType> = { pdfData: GetT<D, InlinePdfPreviewData<D, P>> } & Omit<ShowArgs<D>, 'showInXML'>;
type ValueArgs<D, U, H> = {
    label: GetTOrVal<D>, onError?: GetTOrVal<D>; required?: GetBOrVal<D>; onValueSet?: (data: D, newValue: U) => void
} & HideArgs<H> & ShowArgs<D>;
type LabelsArgs<I extends string> = Exclude<I, Untranslatable> extends never ? { labels?: T<I>; } : { labels: T<I>; };
type FileArgs<D> = {
    multiple?: GetBOrVal<D>; max?: GetOrVal<D, number>; accept?: GetOrVal<D, string>;
};
type ChooserArgs<D, I extends K> = { options: GetOrVal<D, Arr<I>>; otherOptions?: GetOrVal<D, Arr<I>>; chosen?: I | null; };
type SecondChooserArgs<I extends K> = { options: Arr<I>; chosen?: I; text?: string; };
type DoubleChooserArgs<D, I1 extends K, I2 extends K> = {
    options1: GetOrVal<D, Arr<I1>>;
    options2: GetOrVal<D, Arr<I2>>;
    otherOptions1?: GetOrVal<D, Arr<I1>>;
    otherOptions2?: GetOrVal<D, Arr<I2>>;
    chosen?: Pair<I1, I2>;
};
type LockArgs<D> = { lock?: GetBOrVal<D>; };
type CompactArgs<D> = { compact?: GetBOrVal<D>; };
type DoubleLockArgs<D> = { lock1?: GetBOrVal<D>; lock2?: GetBOrVal<D>; };
type SearchArgs<D, T> = {
    getSearchItem: (item: T, t: Translations) => SearchItem;
    getXmlEntry?: () => string;
    inline?: GetBOrVal<D>;
    items: GetTROrVal<D, T[]>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<D, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<D, HTMLInputAttributes['autocapitalize']>;
    chosen?: null | T;
};
type CounterArgs<D> = { chosen: number; min: GetOrVal<D, number>; max: GetOrVal<D, number>; validate?: (v: number, d: D) => boolean; };
type CountersArgs<D, I extends K> = { counts: Rec<I>; max: GetOrVal<D, number>; };
type CheckArgs = { checked?: boolean; };
type SingleCheckboxArgs<D> = { descriptionItems?: GetTAOrVal<D>; };
type SwitchArgs<D> = { hasPositivity?: GetBOrVal<D>; options: Sides };
type MultiChooserArgs<D, I extends K> = {
    options: GetOrVal<D, Arr<I>>;
    chosen?: Arr<I>;
    weights?: (d: D, i: I) => number;
    max?: GetOrVal<D, number>;
    inverseSelection?: boolean;
} & LabelsArgs<I>;
type Input1Args<D> = {
    regex?: GetOrVal<D, RegExp>;
    capitalize?: GetBOrVal<D>;
    type?: GetOrVal<D, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<D, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<D, HTMLInputAttributes['autocapitalize']>;
    placeholder?: GetTOrVal<D>;
};
type Input2Args<D> = {
    textArea?: GetBOrVal<D>;
    maskOptions?: GetOrVal<D, Opts>;
    autocomplete?: GetOrVal<D, FullAutoFill>;
};
type Input3Args<D> = {
    text?: string;
    suffix?: GetTUOrVal<D>;
};
type SuggestionsArgs<D> = {
    suggestions: GetTAROrVal<D>;
};

type Info<D, U> = Widget<D, U> & { text: GetTP<D>; class: Get<D, ClassValue | undefined>; };
type Btn<D, U> = Widget<D, U> & { text: GetT<D>; color: Get<D, BtnColor>; icon: Get<D, string | undefined>; onClick: Get<D, void> };
type Title<D> = Widget<D, undefined> & { level: HeadingLevel; };
type Pdf<D, P extends PdfType> = Widget<D, undefined> & { pdfData: GetT<D, InlinePdfPreviewData<D, P>> };
type Required<D, U, H extends boolean> = Widget<D, U, H> & { required: GetB<D>; };
type Labels<D, U, I extends string> = Widget<D, U> & { labels: T<I>; get: (t: Translations, v: I | null) => string; };
type File<D> = Widget<D, Files> & { multiple: GetB<D>; max: Get<D, number>; accept: Get<D, string>; };
type Lock<D, U> = Widget<D, U> & { lock: GetB<D>; };
type Compact<D, U> = Widget<D, U> & { compact: GetB<D>; };
type DoubleLock<D, U> = Widget<D, U> & { lock1: GetB<D>; lock2: GetB<D>; };
type Chooser<D, I extends K> = Widget<D, I | null> & { options: Get<D, Arr<I>>; otherOptions: Get<D, Arr<I>> };
type SecondChooser<D, I extends K> = Widget<D, SeI<I>> & { options: Arr<I> };
type DoubleChooser<D, I1 extends K, I2 extends K> = Widget<D, Pair<I1, I2>> & {
    options1: Get<D, Arr<I1>>;
    options2: Get<D, Arr<I2>>;
    otherOptions1: Get<D, Arr<I1>>;
    otherOptions2: Get<D, Arr<I2>>;
};
type Search<D, T> = Widget<D, T | null> & {
    getSearchItem: (item: T, t: Translations) => SearchItem;
    getXmlEntry: () => string;
    inline: GetB<D>;
    items: GetTR<D, T[]>;
    type: Get<D, HTMLInputTypeAttribute>;
    enterkeyhint: Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<D, HTMLInputAttributes['autocapitalize']>;
};
type Counter<D> = Widget<D, number> & { min: Get<D, number>; max: Get<D, number>; validate: (v: number, d: D) => boolean; };
type Counters<D, I extends K> = Widget<D, Rec<I>> & { max: Get<D, number> };
type Switch<D> = Widget<D, boolean> & { options: Sides; hasPositivity: GetB<D>; };
type SingleCheckbox<D> = Widget<D, boolean> & { descriptionItems: GetTA<D>; };
type MultiChooser<D, I extends K> = Widget<D, Arr<I>> & {
    options: Get<D, Arr<I>>;
    max: Get<D, number>;
    inverseSelection: boolean;
    weights: (d: D, i: I) => number;
};
type Input1<D, U> = Widget<D, U> & {
    type: Get<D, HTMLInputTypeAttribute>;
    enterkeyhint: Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<D, HTMLInputAttributes['autocapitalize']>;
    regex: Get<D, RegExp>;
    capitalize: GetB<D>;
    placeholder: GetT<D>;
};
type Input2<D, U> = Widget<D, U> & {
    textArea: GetB<D>;
    autocomplete: Get<D, FullAutoFill>;
    updateMaskValue: (text: string) => void;
    maskOptions: Get<D, Opts>;
};
type Input3<D> = Widget<D, string> & {
    suffix: GetTU<D>;
}
type Suggestions<D> = Widget<D, string> & {
    suggestions: GetTAR<D>;
};

const get = <I extends string>(l: Record<Exclude<I, Untranslatable>, string | undefined>, v: I | null): string =>
    v ? l[v] ?? v ?? '' : '';

const initInfo = function <D, U>(widget: Info<D, U>, args: InfoArgs<D>) {
    widget.text = toGetT(args.text);
    widget.show = toGetA(args.show ?? true);
    widget.class = toGetA(args.class);
    widget.showTextValue = toGetA(args.showInXML ?? (data => widget.show(data)));
};
const initBtn = function <D, U>(widget: Btn<D, U>, args: BtnArgs<D>) {
    widget.text = toGetT(args.text);
    widget.show = toGetA(args.show ?? true);
    widget.color = toGetA(args.color);
    widget.icon = toGetA(args.icon);
    widget.onClick = toGetA(args.onClick);
};
const initTitle = function <D, U>(widget: Title<D>, args: TitleArgs) {
    widget.level = args.level;
};
const initPdf = function <D, P extends PdfType>(widget: Pdf<D, P>, args: PdfArgs<D, P>) {
    widget.pdfData = args.pdfData;
    widget.show = toGetA(args.show ?? true);
};
const initValue = function <D, U, H extends boolean>(widget: Required<D, U, H>, args: ValueArgs<D, U, H>) {
    widget.label = toGetT(args.label);
    widget.show = toGetA(args.show ?? true);
    widget.showTextValue = toGetA(args.showInXML ?? (data => widget.show(data)));
    widget.hideInRawData = (args.hideInRawData ?? false) as H;
    widget.onError = toGetT(args.onError ?? (t => t.widget.requiredField));
    widget.required = toGetA(args.required ?? true);
    widget.onValueSet = args.onValueSet ?? (() => {
    });
};
const initFile = function <D>(widget: File<D>, args: FileArgs<D>, defaultAccept: string = '*') {
    widget.multiple = toGetA(args.multiple ?? false);
    widget.max = toGetA(args.max ?? Number.POSITIVE_INFINITY);
    widget.accept = toGetA(args.accept ?? defaultAccept);
};
const initChooser = function <D, I extends K>(widget: Chooser<D, I>, args: ChooserArgs<D, I>) {
    widget.options = toGetA(args.options);
    widget.otherOptions = toGetA(args.otherOptions ?? []);
    widget._value = args.chosen ?? null;
};
const initSecondChooser = function <D, I extends K>(widget: SecondChooser<D, I>, args: SecondChooserArgs<I>) {
    widget.options = args.options;
    widget._value = { chosen: args.chosen ?? args.options[0], text: args.text ?? '' };
};
const initDoubleChooser = function <D, I1 extends K, I2 extends K>(widget: DoubleChooser<D, I1, I2>, args: DoubleChooserArgs<D, I1, I2>) {
    widget.options1 = toGetA(args.options1);
    widget.options2 = toGetA(args.options2);
    widget.otherOptions1 = toGetA(args.otherOptions1 ?? []);
    widget.otherOptions2 = toGetA(args.otherOptions2 ?? []);
    widget._value = args.chosen ?? { first: null, second: null };
};
const initLock = function <D, U>(widget: Lock<D, U>, args: LockArgs<D>) {
    widget.lock = toGetA(args.lock ?? false);
};
const initLabels = function <D, U, I extends string>(widget: Labels<D, U, I>, args: LabelsArgs<I>) {
    widget.labels = args.labels ?? (() => ({}) as Record<I, string>);
    widget.get = (t, v) => get(widget.labels(t), v);
};
const initCompact = function <D, U>(widget: Compact<D, U>, args: CompactArgs<D>) {
    widget.compact = toGetA(args.compact ?? false);
};
const initDoubleLock = function <D, U>(widget: DoubleLock<D, U>, args: DoubleLockArgs<D>) {
    widget.lock1 = toGetA(args.lock1 ?? false);
    widget.lock2 = toGetA(args.lock2 ?? false);
};
const initSearch = function <D, T>(widget: Search<D, T>, args: SearchArgs<D, T>) {
    widget._value = args.chosen ?? null;
    widget.items = toGetT(args.items);
    widget.getSearchItem = args.getSearchItem;
    widget.getXmlEntry = args.getXmlEntry ?? (() => JSON.stringify(widget.value));
    widget.type = toGetA(args.type ?? 'search');
    widget.enterkeyhint = toGetA(args.enterkeyhint);
    widget.inputmode = toGetA(args.inputmode);
    widget.autocapitalize = toGetA(args.autocapitalize);
    widget.inline = toGetA(args.inline ?? false);
};
const initCounter = function <D>(widget: Counter<D>, args: CounterArgs<D>) {
    widget._value = args.chosen;
    widget.min = toGetA(args.min);
    widget.max = toGetA(args.max);
    widget.validate = args.validate ?? (() => true);
};
const initCounters = function <D, I extends K>(widget: Counters<D, I>, args: CountersArgs<D, I>) {
    widget._value = args.counts;
    widget.max = toGetA(args.max);
};
const initSwitch = function <D>(widget: Switch<D>, args: SwitchArgs<D>) {
    widget.hasPositivity = toGetA(args.hasPositivity ?? false);
    widget.options = args.options;
};
const initCheck = function <D>(widget: Widget<D, boolean>, args: CheckArgs) {
    widget._value = args.checked ?? false;
};
const initSingleCheckbox = function <D>(widget: SingleCheckbox<D>, args: SingleCheckboxArgs<D>) {
    widget.descriptionItems = toGetT(args.descriptionItems ?? []);
};
const initMultiChooser = function <D, I extends K>(widget: MultiChooser<D, I>, args: MultiChooserArgs<D, I>) {
    widget._value = args.chosen ?? [];
    widget.max = toGetA(args.max ?? Number.MAX_VALUE);
    widget.options = toGetA(args.options);
    widget.inverseSelection = Boolean(args.inverseSelection);
    widget.weights = args.weights ?? (() => 1);
};
const initInput1 = function <D, U>(widget: Input1<D, U>, args: Input1Args<D>) {
    widget.regex = toGetA(args.regex ?? /.*/);
    widget.capitalize = toGetA(args.capitalize ?? false);
    widget.type = toGetA(args.type ?? 'text');
    widget.enterkeyhint = toGetA(args.enterkeyhint);
    widget.inputmode = toGetA(args.inputmode);
    widget.autocapitalize = toGetA(args.autocapitalize);
    widget.placeholder = toGetT(args.placeholder ?? '');
};
const initInput2 = function <D, U>(widget: Input2<D, U>, args: Input2Args<D>) {
    widget.textArea = toGetA(args.textArea ?? false);
    widget.maskOptions = toGetA(args.maskOptions ?? undefined);
    widget.autocomplete = toGetA(args.autocomplete ?? 'off');
};
const initInput3 = function <D>(widget: Input3<D>, args: Input3Args<D>) {
    widget._value = args.text ?? '';
    widget.suffix = toGetT(args.suffix);
};
const initSuggestions = function <D>(widget: Suggestions<D>, args: SuggestionsArgs<D>) {
    widget.suggestions = toGetT(args.suggestions);
};

export class TitleWidget<D> extends Widget<D, undefined, true> {
    text = ($state() as GetTP<D>);
    label = () => '' as const;
    onError = () => '' as const;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;
    class = $state() as Get<D, ClassValue>;
    level = $state() as HeadingLevel;

    constructor(args: InfoArgs<D> & TitleArgs) {
        super();
        initInfo(this, args);
        initTitle(this, args);
    }
}

export class TextWidget<D> extends Widget<D, undefined, true> {
    text = ($state() as GetTP<D>);
    label = () => '' as const;
    onError = () => '' as const;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;
    class = $state() as Get<D, ClassValue>;

    constructor(args: InfoArgs<D>) {
        super();
        initInfo(this, args);
    }
}

export class InlinePdfPreviewWidget<D, P extends PdfType> extends Widget<D, undefined, true> {
    label = () => '' as const;
    onError = () => '' as const;
    show = $state() as GetB<D>;
    showTextValue = () => false as const;
    _value = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;
    pdfData = $state() as GetT<D, InlinePdfPreviewData<D, P>>;

    constructor(args: PdfArgs<D, P>) {
        super();
        initPdf(this, args);
    }
}

export class ButtonWidget<D> extends Widget<D, undefined, true> {
    label = () => '' as const;
    onError = () => '' as const;
    show = $state() as GetB<D>;
    showTextValue = () => false as const;
    _value = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;

    text = $state() as GetT<D>;
    color = $state() as Get<D, BtnColor>;
    icon = $state() as Get<D, string | undefined>;
    onClick = $state() as Get<D, void>;

    constructor(args: BtnArgs<D>) {
        super();
        initBtn(this, args);
    }
}

export class ChooserWidget<D, I extends K, H extends boolean = false> extends Widget<D, I | null, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as I | null;
    onValueSet = $state() as (data: D, newValue: I | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;
    compact = $state() as GetB<D>;
    options = $state() as Get<D, Arr<I>>;
    otherOptions = $state() as Get<D, Arr<I>>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<D, I | null, H> & ChooserArgs<D, I> & LockArgs<D> & CompactArgs<D> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
        initCompact(this, args);
        initLabels(this, args);
    }
}

export class CheckboxWithChooserWidget<D, I extends K, H extends boolean = false> extends Widget<D, SeCh<I>, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as SeCh<I>;
    onValueSet = $state() as (data: D, newValue: SeCh<I>) => void;
    hideInRawData = $state() as H;
    isError = $state(a => (this.value.chosen == null || !this.value.checked) && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    options = $state() as Get<D, Arr<I>>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<D, SeCh<I>, H> & ChooserArgs<D, I> & CheckArgs & LabelsArgs<I>) {
        super();
        initValue(this, args);
        this.options = toGetA(args.options);
        this._value = { chosen: args.chosen ?? null, checked: args.checked ?? false };
        initLabels(this, args);
    }
}

export class SearchWidget<D, T, H extends boolean = false> extends Widget<D, T | null, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as T | null;
    onValueSet = $state() as (data: D, newValue: T | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    inline = $state() as GetB<D>;
    getSearchItem = $state() as (item: T, t: Translations) => SearchItem;
    getXmlEntry = $state() as () => string;
    items = $state() as GetTR<D, T[]>;
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
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as string;
    onValueSet = $state() as (data: D, newValue: string) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    suggestions = $state() as GetTAR<D>;
    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    suffix = $state() as GetTU<D>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as GetB<D>;
    placeholder = $state() as GetT<D>;

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

export class DoubleChooserWidget<D, I1 extends K, I2 extends K, H extends boolean = false> extends Widget<D, Pair<I1, I2>, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as Pair<I1, I2>;
    onValueSet = $state() as (data: D, newValue: Pair<I1, I2>) => void;
    hideInRawData = $state() as H;
    isError = $state(
        a => (this.value.first == null || (this.value.second == null && this.options2(a).length)) && this.required(a),
    ) as GetB<D>;
    required = $state() as GetB<D>;
    lock1 = $state() as GetB<D>;
    lock2 = $state() as GetB<D>;
    options1 = $state() as Get<D, Arr<I1>>;
    options2 = $state() as Get<D, Arr<I2>>;
    otherOptions1 = $state() as Get<D, Arr<I1>>;
    otherOptions2 = $state() as Get<D, Arr<I2>>;
    labels = $state() as T<I1 | I2>;
    get = $state() as ((t: Translations, v: I1 | I2 | null) => string);

    constructor(args: ValueArgs<D, Pair<I1, I2>, H> & DoubleLockArgs<D> & DoubleChooserArgs<D, I1, I2> & LabelsArgs<I1 | I2>) {
        super();
        initValue(this, args);
        initDoubleChooser(this, args);
        initDoubleLock(this, args);
        initLabels(this, args);
    }
}

export class CounterWidget<D, H extends boolean = false> extends Widget<D, number, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as number;
    onValueSet = $state() as (data: D, newValue: number) => void;
    required = () => false;
    hideInRawData = $state() as H;
    isError = $state(d => !this.validate(this._value, d)) as GetB<D>;
    lock = $state() as GetB<D>;
    min = $state() as Get<D, number>;
    max = $state() as Get<D, number>;
    validate = $state() as (n: number, d: D) => boolean;

    constructor(args: ValueArgs<D, number, H> & LockArgs<D> & CounterArgs<D>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initCounter(this, args);
    }
}

export class CountersWidget<D, I extends K, H extends boolean = false> extends Widget<D, Rec<I>, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    required = () => false;
    showTextValue = $state() as GetB<D>;
    _value = $state() as Rec<I>;
    onValueSet = $state() as (data: D, newValue: Rec<I>) => void;
    hideInRawData = $state() as H;
    isError = $state(() => false) as GetB<D>;
    max = $state() as Get<D, number>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<D, Rec<I>, H> & CountersArgs<D, I> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initCounters(this, args);
        initLabels(this, args);
    }
}

export class RadioWidget<D, I extends K, H extends boolean = false> extends Widget<D, I | null, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as I | null;
    onValueSet = $state() as (data: D, newValue: I | null) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value == null && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;
    options = $state() as Get<D, Arr<I>>;
    otherOptions = $state() as Get<D, Arr<I>>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<D, I | null, H> & ChooserArgs<D, I> & LockArgs<D> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
        initLabels(this, args);
    }
}

export class RadioWithInputWidget<D, I extends K, H extends boolean = false> extends Widget<D, RaI<I>, H> {
    label = $state() as GetT<D>;
    otherLabel = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    options = $state() as Get<D, Arr<I>>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    hideInRawData = $state() as H;
    _value = $state() as RaI<I>;
    onValueSet = $state() as (data: D, newValue: RaI<I>) => void;
    isError = $state(a => (
        this.value.chosen == null && this.required(a)
    ) || (
        this.value.chosen == this.options(a).at(-1)! && (
            this.value.text == '' || !this.regex(a).test(this.value.text)
        )
    )) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    regex = $state() as Get<D, RegExp>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);
    capitalize = $state() as GetB<D>;
    placeholder = $state() as GetT<D>;

    constructor(args: ValueArgs<D, RaI<I>, H> & LockArgs<D> & Input1Args<D> & Input3Args<D> & ChooserArgs<D, I> & LabelsArgs<I> & {
        otherLabel: GetTOrVal<D>
    }) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initLabels(this, args);
        this.otherLabel = toGetT(args.otherLabel);
        this.options = toGetA(args.options);
        this._value = { chosen: args.chosen ?? null, text: args.text ?? '' };
    }
}

export class SwitchWidget<D, H extends boolean = false> extends Widget<D, boolean, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as boolean;
    onValueSet = $state() as (data: D, newValue: boolean) => void;
    hideInRawData = $state() as H;
    isError = $state(a => !this.value && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    options = $state() as Sides;
    hasPositivity = $state() as GetB<D>;

    constructor(args: ValueArgs<D, boolean, H> & CheckArgs & SwitchArgs<D>) {
        super();
        initValue(this, args);
        initCheck(this, args);
        initSwitch(this, args);
    }
}

export class MultiCheckboxWidget<D, I extends K, H extends boolean = false> extends Widget<D, Arr<I>, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as Arr<I>;
    onValueSet = $state() as (data: D, newValue: Arr<I>) => void;
    hideInRawData = $state() as H;
    isError = $state(a => this.value.length == 0 && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;
    options = $state() as Get<D, Arr<I>>;
    max = $state() as Get<D, number>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);
    inverseSelection = $state() as boolean;
    weights = $state() as (d: D, i: I) => number;

    constructor(args: ValueArgs<D, Arr<I>, H> & MultiChooserArgs<D, I> & LockArgs<D> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initMultiChooser(this, args);
        initLock(this, args);
        initLabels(this, args);
    }
}

export class InputWidget<D, H extends boolean = false> extends Widget<D, string, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    hideInRawData = $state() as H;
    _value = $state() as string;
    onValueSet = $state() as (data: D, newValue: string) => void;
    isError = $state(
        a => (this.value == '' && this.required(a)) || (this.value != '' && !this.regex(a).test(this.value)),
    ) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;

    setValue(data: D, value: string) {
        this._value = value;
        this.onValueSet(data, this._value);
        this.updateMaskValue(this._value);
    }

    type = $state() as Get<D, HTMLInputTypeAttribute>;
    enterkeyhint = $state() as Get<D, HTMLInputAttributes['enterkeyhint']>;
    inputmode = $state() as Get<D, HTMLInputAttributes['inputmode']>;
    autocapitalize = $state() as Get<D, HTMLInputAttributes['autocapitalize']>;
    suffix = $state() as GetTU<D>;
    autocomplete = $state() as Get<D, FullAutoFill>;
    updateMaskValue = $state(() => {
    }) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as GetB<D>;
    textArea = $state() as GetB<D>;
    placeholder = $state() as GetT<D>;

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
        this.processScannedText = args.processScannedText ?? (t => t);
    }
}

export class FileWidget<D, H extends boolean = false> extends Widget<D, Files, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = () => false;
    hideInRawData = $state() as H;
    _value = $state<Files>([]);
    onValueSet = $state() as (data: D, newValue: Files) => void;
    isError = $state(a => (this.value.length == 0) && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;
    accept = $state() as Get<D, string>;
    multiple = $state() as GetB<D>;
    max = $state() as Get<D, number>;

    constructor(args: ValueArgs<D, Files, H> & FileArgs<D> & LockArgs<D>) {
        super();
        initValue(this, args);
        initFile(this, args);
        initLock(this, args);
    }
}

export class PhotoSelectorWidget<D, H extends boolean = false> extends Widget<D, Files, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = () => false;
    hideInRawData = $state() as H;
    _value = $state<Files>([]);
    onValueSet = $state() as (data: D, newValue: Files) => void;
    isError = $state(a => (this.value.length == 0) && this.required(a)) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;
    accept = $state() as Get<D, string>;
    multiple = $state() as GetB<D>;
    max = $state() as Get<D, number>;

    constructor(args: ValueArgs<D, Files, H> & FileArgs<D> & LockArgs<D>) {
        super();
        initValue(this, args);
        initFile(this, args, 'image/*');
        initLock(this, args);
    }
}

export class InputWithChooserWidget<D, I extends K, H extends boolean = false> extends Widget<D, SeI<I>, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    options = $state() as Arr<I>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    hideInRawData = $state() as H;
    _value = $state() as SeI<I>;
    onValueSet = $state() as (data: D, newValue: SeI<I>) => void;
    isError = $state(
        a => (this.value.text == '' && this.required(a)) || (this.value.text != '' && !this.regex(a).test(this.value.text)),
    ) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;

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
    updateMaskValue = $state(() => {
    }) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as GetB<D>;
    textArea = $state() as GetB<D>;
    labels = $state() as T<I>;
    get = $state() as ((t: Translations, v: I | null) => string);
    placeholder = $state() as GetT<D>;

    constructor(args: ValueArgs<D, SeI<I>, H> & LockArgs<D> & Input1Args<D> & Input2Args<D> & Input3Args<D> & SecondChooserArgs<I> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        initSecondChooser(this, args);
        initLabels(this, args);
    }
}

export class CheckboxWithInputWidget<D, H extends boolean = false> extends Widget<D, ChI, H> {
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    hideInRawData = $state() as H;
    _value = $state() as ChI;
    onValueSet = $state() as (data: D, newValue: ChI) => void;
    isError = $state(
        a => (this.value.text == '' && this.required(a)) ||
            (!this.value.checked && this.required(a)) ||
            (this.value.text != '' && !this.regex(a).test(this.value.text)),
    ) as GetB<D>;
    required = $state() as GetB<D>;
    lock = $state() as GetB<D>;

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
    updateMaskValue = $state(() => {
    }) as (text: string) => void;
    maskOptions = $state() as Get<D, Opts>;
    regex = $state() as Get<D, RegExp>;
    capitalize = $state() as GetB<D>;
    textArea = $state() as GetB<D>;
    placeholder = $state() as GetT<D>;

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
    label = $state() as GetT<D>;
    onError = $state() as GetT<D>;
    show = $state() as GetB<D>;
    showTextValue = $state() as GetB<D>;
    _value = $state() as boolean;
    onValueSet = $state() as (data: D, newValue: boolean) => void;
    hideInRawData = $state() as H;
    required = $state() as GetB<D>;
    isError = $state(a => !this.value && this.required(a)) as GetB<D>;
    lock = $state() as GetB<D>;
    descriptionItems = $state() as GetTA<D>;

    constructor(args: ValueArgs<D, boolean, H> & LockArgs<D> & CheckArgs & SingleCheckboxArgs<D>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initCheck(this, args);
        initSingleCheckbox(this, args);
    }
}

export class HiddenValueWidget<D, T> extends Widget<D, T, false> {
    label = () => '';
    onError = () => '';
    show = () => false;
    showTextValue = () => false;
    _value = $state() as T;
    onValueSet = () => {};
    hideInRawData = false as const;
    isError = () => false;
    constructor(value?: T) {
        super();
        if (value)
            this._value = value;
    }
}