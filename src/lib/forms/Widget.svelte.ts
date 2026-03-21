import type { Translations } from '../translations';
import type { ClassValue, FullAutoFill, HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
import type { Untranslatable } from '$lib/translations/untranslatables';
import { readable, type Readable } from 'svelte/store';
import type { DataOfPdf, Pdf as PdfType, PdfParameters } from '$lib/pdf/pdf';
import type { Form, Values } from '$lib/forms/Form';

export type GetB<C> = Get<C, boolean>;
export type GetBOrVal<C> = GetOrVal<C, boolean>;
export type GetTA<C> = GetT<C, string[]>;
export type GetTAOrVal<C> = GetTOrVal<C, string[]>;
export type GetTU<C> = GetT<C, string | undefined>;
export type GetTUOrVal<C> = GetTOrVal<C, string | undefined>;
export type GetTP<C> = GetT<C, Promise<string> | string>;
export type GetTPOrVal<C> = GetTOrVal<C, Promise<string> | string>;
export type GetTAR<C> = GetT<C, Readable<string[]>>;
export type GetTAROrVal<C> = GetTOrVal<C, Readable<string[]>>;
export type GetR<C, U> = Get<C, Readable<U>>;
export type GetROrVal<C, U> = GetOrVal<C, Readable<U>>;
export type GetTR<C, U> = GetT<C, Readable<U>>;
export type GetTROrVal<C, U> = GetTOrVal<C, Readable<U>>;

export type Get<C, U> = (context: C) => U;
export type GetT<C, U = string> = (t: Translations, context: C) => U;

export type GetOrVal<C, U> = Get<C, U> | U;
export type GetTOrVal<C, U = string> = GetT<C, U> | U;

const toGetA = <C, U>(getAOrValue: GetOrVal<C, U>) =>
    getAOrValue instanceof Function ? getAOrValue : () => getAOrValue;
const toGetT = <C, U>(getTOrValue: GetTOrVal<C, U>) =>
    getTOrValue instanceof Function ? getTOrValue : () => getTOrValue;

type Opts = {
    mask: string;
    definitions?: {
        [key: string]: RegExp;
    };
} | undefined;

export const STAR = '∗';

export const labelAndStar = <C, U>(
    widget: Required<C, U, boolean>,
    context: C,
    t: Translations,
    getLabel: GetT<C> = widget.label,
) => {
    const label = getLabel(t, context);
    return label == '' ? '' : label + (!widget.required(context) ? '' : ` ${STAR}`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class Widget<C = never, U = any, H extends boolean = boolean> {
    abstract label: GetT<C>;
    abstract onError: GetT<C>;
    displayErrorVeto = $state(false);
    abstract show: GetB<C>;
    abstract showTextValue: GetB<C>;
    abstract defaultValue: U;

    abstract onValueSet: (context: C, newValue: U) => void;

    abstract hideInRawData: H;

    abstract isError: (context: C, value: U) => boolean;
    showError: (context: C, value: U) => boolean = $state((c, v) => this.displayErrorVeto && this.isError(c, v));
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
export type InlinePdfPreviewData<C, P extends PdfType> = {
    type: P,
    data: DataOfPdf<P>,
    form: Form<C>,
    values: Values<Form<C>>,
} & PdfParameters<P>;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type Color = 'warning' | 'danger' | 'primary' | 'info' | 'secondary' | 'success'
export type BtnColor = Color | `outline-${Color}`

type HideArgs<H> = H extends false ? { hideInRawData?: H } : { hideInRawData: H };
type ShowArgs<C> = { show?: GetBOrVal<C>; showInXML?: GetBOrVal<C> };
type InfoArgs<C> = { text: GetTPOrVal<C>; class?: GetOrVal<C, ClassValue | undefined>; } & ShowArgs<C>;
type BtnArgs<C> =
    { text: GetTOrVal<C>; color: GetOrVal<C, BtnColor>; icon?: GetOrVal<C, string | undefined>; onClick: Get<C, void> }
    & ShowArgs<C>;
type TitleArgs = { level: HeadingLevel };
type PdfArgs<C, P extends PdfType> = { pdfData: GetT<C, InlinePdfPreviewData<C, P>> } & Omit<ShowArgs<C>, 'showInXML'>;
type ValueArgs<C, U, H> = {
    label: GetTOrVal<C>, onError?: GetTOrVal<C>; required?: GetBOrVal<C>; onValueSet?: (context: C, newValue: U) => void
} & HideArgs<H> & ShowArgs<C>;
type LabelsArgs<I extends string> = Exclude<I, Untranslatable> extends never ? { labels?: T<I>; } : { labels: T<I>; };
type FileArgs<C> = {
    multiple?: GetBOrVal<C>; max?: GetOrVal<C, number>; accept?: GetOrVal<C, string>;
};
type ChooserArgs<C, I extends K> = { options: GetOrVal<C, Arr<I>>; otherOptions?: GetOrVal<C, Arr<I>>; chosen?: I | null; };
type SecondChooserArgs<I extends K> = { options: Arr<I>; chosen?: I; text?: string; };
type DoubleChooserArgs<C, I1 extends K, I2 extends K> = {
    options1: GetOrVal<C, Arr<I1>>;
    options2: GetOrVal<C, Arr<I2>>;
    otherOptions1?: GetOrVal<C, Arr<I1>>;
    otherOptions2?: GetOrVal<C, Arr<I2>>;
    chosen?: Pair<I1, I2>;
};
type LockArgs<C> = { lock?: GetBOrVal<C>; };
type CompactArgs<C> = { compact?: GetBOrVal<C>; };
type DoubleLockArgs<C> = { lock1?: GetBOrVal<C>; lock2?: GetBOrVal<C>; };
type SearchArgs<C, T> = {
    getSearchItem: (item: T, t: Translations) => SearchItem;
    getXmlEntry?: () => string;
    inline?: GetBOrVal<C>;
    type?: GetOrVal<C, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<C, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<C, HTMLInputAttributes['autocapitalize']>;
    chosen?: null | T;
} & ({
    items: GetTROrVal<C, T[]>;
    search?: undefined;
} | {
    items?: undefined;
    search: (search: string) => Promise<T[] | null>,
});
type CounterArgs<C> = { chosen: number; min: GetOrVal<C, number>; max: GetOrVal<C, number>; validate?: (v: number, c: C) => boolean; };
type CountersArgs<C, I extends K> = { counts: Rec<I>; max: GetOrVal<C, number>; };
type CheckArgs = { checked?: boolean; };
type SingleCheckboxArgs<C> = { descriptionItems?: GetTAOrVal<C>; };
type SwitchArgs<C> = { hasPositivity?: GetBOrVal<C>; options: Sides };
type MultiChooserArgs<C, I extends K> = {
    options: GetOrVal<C, Arr<I>>;
    chosen?: Arr<I>;
    weights?: (c: C, i: I) => number;
    max?: GetOrVal<C, number>;
    inverseSelection?: boolean;
} & LabelsArgs<I>;
type Input1Args<C> = {
    regex?: GetOrVal<C, RegExp>;
    capitalize?: GetBOrVal<C>;
    type?: GetOrVal<C, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<C, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<C, HTMLInputAttributes['autocapitalize']>;
    placeholder?: GetTOrVal<C>;
};
type Input2Args<C> = {
    textArea?: GetBOrVal<C>;
    maskOptions?: GetOrVal<C, Opts>;
    autocomplete?: GetOrVal<C, FullAutoFill>;
};
type Input3Args<C> = {
    text?: string;
    suffix?: GetTUOrVal<C>;
};
type SuggestionsArgs<C> = {
    suggestions: GetTAROrVal<C>;
};

type Info<C, U> = Widget<C, U> & { text: GetTP<C>; class: Get<C, ClassValue | undefined>; };
type Btn<C, U> = Widget<C, U> & { text: GetT<C>; color: Get<C, BtnColor>; icon: Get<C, string | undefined>; onClick: Get<C, void> };
type Title<C> = Widget<C, undefined> & { level: HeadingLevel; };
type Pdf<C, P extends PdfType> = Widget<C, undefined> & { pdfData: GetT<C, InlinePdfPreviewData<C, P>> };
type Required<C, U, H extends boolean> = Widget<C, U, H> & { required: GetB<C>; };
type Labels<C, U, I extends string> = Widget<C, U> & { labels: T<I>; get: (t: Translations, v: I | null) => string; };
type File<C> = Widget<C, Files> & { multiple: GetB<C>; max: Get<C, number>; accept: Get<C, string>; };
type Lock<C, U> = Widget<C, U> & { lock: GetB<C>; };
type Compact<C, U> = Widget<C, U> & { compact: GetB<C>; };
type DoubleLock<C, U> = Widget<C, U> & { lock1: GetB<C>; lock2: GetB<C>; };
type Chooser<C, I extends K> = Widget<C, I | null> & { options: Get<C, Arr<I>>; otherOptions: Get<C, Arr<I>> };
type SecondChooser<C, I extends K> = Widget<C, SeI<I>> & { options: Arr<I> };
type DoubleChooser<C, I1 extends K, I2 extends K> = Widget<C, Pair<I1, I2>> & {
    options1: Get<C, Arr<I1>>;
    options2: Get<C, Arr<I2>>;
    otherOptions1: Get<C, Arr<I1>>;
    otherOptions2: Get<C, Arr<I2>>;
};
type Search<C, T> = Widget<C, T | null> & {
    getSearchItem: (item: T, t: Translations) => SearchItem;
    getXmlEntry: (v: T | null) => string;
    inline: GetB<C>;
    items: GetTR<C, T[]>;
    search?: (search: string) => Promise<T[] | null>;
    type: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<C, HTMLInputAttributes['autocapitalize']>;
};
type Counter<C> = Widget<C, number> & { min: Get<C, number>; max: Get<C, number>; validate: (v: number, c: C) => boolean; };
type Counters<C, I extends K> = Widget<C, Rec<I>> & { max: Get<C, number> };
type Switch<C> = Widget<C, boolean> & { options: Sides; hasPositivity: GetB<C>; };
type SingleCheckbox<C> = Widget<C, boolean> & { descriptionItems: GetTA<C>; };
type MultiChooser<C, I extends K> = Widget<C, Arr<I>> & {
    options: Get<C, Arr<I>>;
    max: Get<C, number>;
    inverseSelection: boolean;
    weights: (c: C, i: I) => number;
};
type Input1<C, U> = Widget<C, U> & {
    type: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<C, HTMLInputAttributes['autocapitalize']>;
    regex: Get<C, RegExp>;
    capitalize: GetB<C>;
    placeholder: GetT<C>;
};
type Input2<C, U> = Widget<C, U> & {
    textArea: GetB<C>;
    autocomplete: Get<C, FullAutoFill>;
    updateMaskValue: (text: string) => void;
    maskOptions: Get<C, Opts>;
};
type Input3<C> = Widget<C, string> & {
    suffix: GetTU<C>;
}
type Suggestions<C> = Widget<C, string> & {
    suggestions: GetTAR<C>;
};

const get = <I extends string>(l: Record<Exclude<I, Untranslatable>, string | undefined>, v: I | null): string =>
    v ? l[v] ?? v ?? '' : '';

const initInfo = function <C, U>(widget: Info<C, U>, args: InfoArgs<C>) {
    widget.text = toGetT(args.text);
    widget.show = toGetA(args.show ?? true);
    widget.class = toGetA(args.class);
    widget.showTextValue = toGetA(args.showInXML ?? (context => widget.show(context)));
};
const initBtn = function <C, U>(widget: Btn<C, U>, args: BtnArgs<C>) {
    widget.text = toGetT(args.text);
    widget.show = toGetA(args.show ?? true);
    widget.color = toGetA(args.color);
    widget.icon = toGetA(args.icon);
    widget.onClick = toGetA(args.onClick);
};
const initTitle = function <C, U>(widget: Title<C>, args: TitleArgs) {
    widget.level = args.level;
};
const initPdf = function <C, P extends PdfType>(widget: Pdf<C, P>, args: PdfArgs<C, P>) {
    widget.pdfData = args.pdfData;
    widget.show = toGetA(args.show ?? true);
};
const initValue = function <C, U, H extends boolean>(widget: Required<C, U, H>, args: ValueArgs<C, U, H>) {
    widget.label = toGetT(args.label);
    widget.show = toGetA(args.show ?? true);
    widget.showTextValue = toGetA(args.showInXML ?? (context => widget.show(context)));
    widget.hideInRawData = (args.hideInRawData ?? false) as H;
    widget.onError = toGetT(args.onError ?? (t => t.widget.requiredField));
    widget.required = toGetA(args.required ?? true);
    widget.onValueSet = args.onValueSet ?? (() => {
    });
};
const initFile = function <C>(widget: File<C>, args: FileArgs<C>, defaultAccept: string = '*') {
    widget.multiple = toGetA(args.multiple ?? false);
    widget.max = toGetA(args.max ?? Number.POSITIVE_INFINITY);
    widget.accept = toGetA(args.accept ?? defaultAccept);
};
const initChooser = function <C, I extends K>(widget: Chooser<C, I>, args: ChooserArgs<C, I>) {
    widget.options = toGetA(args.options);
    widget.otherOptions = toGetA(args.otherOptions ?? []);
    widget.defaultValue = args.chosen ?? null;
};
const initSecondChooser = function <C, I extends K>(widget: SecondChooser<C, I>, args: SecondChooserArgs<I>) {
    widget.options = args.options;
    widget.defaultValue = { chosen: args.chosen ?? args.options[0], text: args.text ?? '' };
};
const initDoubleChooser = function <C, I1 extends K, I2 extends K>(widget: DoubleChooser<C, I1, I2>, args: DoubleChooserArgs<C, I1, I2>) {
    widget.options1 = toGetA(args.options1);
    widget.options2 = toGetA(args.options2);
    widget.otherOptions1 = toGetA(args.otherOptions1 ?? []);
    widget.otherOptions2 = toGetA(args.otherOptions2 ?? []);
    widget.defaultValue = args.chosen ?? { first: null, second: null };
};
const initLock = function <C, U>(widget: Lock<C, U>, args: LockArgs<C>) {
    widget.lock = toGetA(args.lock ?? false);
};
const initLabels = function <C, U, I extends string>(widget: Labels<C, U, I>, args: LabelsArgs<I>) {
    widget.labels = args.labels ?? (() => ({}) as Record<I, string>);
    widget.get = (t, v) => get(widget.labels(t), v);
};
const initCompact = function <C, U>(widget: Compact<C, U>, args: CompactArgs<C>) {
    widget.compact = toGetA(args.compact ?? false);
};
const initDoubleLock = function <C, U>(widget: DoubleLock<C, U>, args: DoubleLockArgs<C>) {
    widget.lock1 = toGetA(args.lock1 ?? false);
    widget.lock2 = toGetA(args.lock2 ?? false);
};
const initSearch = function <C, T>(widget: Search<C, T>, args: SearchArgs<C, T>) {
    widget.defaultValue = args.chosen ?? null;
    widget.items = toGetT(args.items ?? readable([]));
    widget.search = args.search;
    widget.getSearchItem = args.getSearchItem;
    widget.getXmlEntry = args.getXmlEntry ?? (v => JSON.stringify(v));
    widget.type = toGetA(args.type ?? 'search');
    widget.enterkeyhint = toGetA(args.enterkeyhint);
    widget.inputmode = toGetA(args.inputmode);
    widget.autocapitalize = toGetA(args.autocapitalize);
    widget.inline = toGetA(args.inline ?? false);
};
const initCounter = function <C>(widget: Counter<C>, args: CounterArgs<C>) {
    widget.defaultValue = args.chosen;
    widget.min = toGetA(args.min);
    widget.max = toGetA(args.max);
    widget.validate = args.validate ?? (() => true);
};
const initCounters = function <C, I extends K>(widget: Counters<C, I>, args: CountersArgs<C, I>) {
    widget.defaultValue = args.counts;
    widget.max = toGetA(args.max);
};
const initSwitch = function <C>(widget: Switch<C>, args: SwitchArgs<C>) {
    widget.hasPositivity = toGetA(args.hasPositivity ?? false);
    widget.options = args.options;
};
const initCheck = function <C>(widget: Widget<C, boolean>, args: CheckArgs) {
    widget.defaultValue = args.checked ?? false;
};
const initSingleCheckbox = function <C>(widget: SingleCheckbox<C>, args: SingleCheckboxArgs<C>) {
    widget.descriptionItems = toGetT(args.descriptionItems ?? []);
};
const initMultiChooser = function <C, I extends K>(widget: MultiChooser<C, I>, args: MultiChooserArgs<C, I>) {
    widget.defaultValue = args.chosen ?? [];
    widget.max = toGetA(args.max ?? Number.MAX_VALUE);
    widget.options = toGetA(args.options);
    widget.inverseSelection = Boolean(args.inverseSelection);
    widget.weights = args.weights ?? (() => 1);
};
const initInput1 = function <C, U>(widget: Input1<C, U>, args: Input1Args<C>) {
    widget.regex = toGetA(args.regex ?? /.*/);
    widget.capitalize = toGetA(args.capitalize ?? false);
    widget.type = toGetA(args.type ?? 'text');
    widget.enterkeyhint = toGetA(args.enterkeyhint);
    widget.inputmode = toGetA(args.inputmode);
    widget.autocapitalize = toGetA(args.autocapitalize);
    widget.placeholder = toGetT(args.placeholder ?? '');
};
const initInput2 = function <C, U>(widget: Input2<C, U>, args: Input2Args<C>) {
    widget.textArea = toGetA(args.textArea ?? false);
    widget.maskOptions = toGetA(args.maskOptions ?? undefined);
    widget.autocomplete = toGetA(args.autocomplete ?? 'off');
};
const initInput3 = function <C>(widget: Input3<C>, args: Input3Args<C>) {
    widget.defaultValue = args.text ?? '';
    widget.suffix = toGetT(args.suffix);
};
const initSuggestions = function <C>(widget: Suggestions<C>, args: SuggestionsArgs<C>) {
    widget.suggestions = toGetT(args.suggestions);
};

export class TitleWidget<C> extends Widget<C, undefined, true> {
    text!: GetTP<C>;
    label = () => '' as const;
    onError = () => '' as const;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;
    class!: Get<C, ClassValue>;
    level!: HeadingLevel;

    constructor(args: InfoArgs<C> & TitleArgs) {
        super();
        initInfo(this, args);
        initTitle(this, args);
    }
}

export class TextWidget<C> extends Widget<C, undefined, true> {
    text!: GetTP<C>;
    label = () => '' as const;
    onError = () => '' as const;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;
    class!: Get<C, ClassValue>;

    constructor(args: InfoArgs<C>) {
        super();
        initInfo(this, args);
    }
}

export class InlinePdfPreviewWidget<C, P extends PdfType> extends Widget<C, undefined, true> {
    label = () => '' as const;
    onError = () => '' as const;
    show!: GetB<C>;
    showTextValue = () => false as const;
    defaultValue = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;
    pdfData!: GetT<C, InlinePdfPreviewData<C, P>>;

    constructor(args: PdfArgs<C, P>) {
        super();
        initPdf(this, args);
    }
}

export class ButtonWidget<C> extends Widget<C, undefined, true> {
    label = () => '' as const;
    onError = () => '' as const;
    show!: GetB<C>;
    showTextValue = () => false as const;
    defaultValue = undefined;
    onValueSet = () => {
    };
    hideInRawData = true as const;
    isError = () => false;

    text!: GetT<C>;
    color!: Get<C, BtnColor>;
    icon!: Get<C, string | undefined>;
    onClick!: Get<C, void>;

    constructor(args: BtnArgs<C>) {
        super();
        initBtn(this, args);
    }
}

export class ChooserWidget<C, I extends K, H extends boolean = false> extends Widget<C, I | null, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: I | null;
    onValueSet!: (context: C, newValue: I | null) => void;
    hideInRawData!: H;
    isError = (c: C, v: I | null) => v == null && this.required(c);
    required!: GetB<C>;
    lock!: GetB<C>;
    compact!: GetB<C>;
    options!: Get<C, Arr<I>>;
    otherOptions!: Get<C, Arr<I>>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<C, I | null, H> & ChooserArgs<C, I> & LockArgs<C> & CompactArgs<C> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
        initCompact(this, args);
        initLabels(this, args);
    }
}

export class CheckboxWithChooserWidget<C, I extends K, H extends boolean = false> extends Widget<C, SeCh<I>, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: SeCh<I>;
    onValueSet!: (context: C, newValue: SeCh<I>) => void;
    hideInRawData!: H;
    isError = (c: C, v: SeCh<I>) => (v.chosen == null || !v.checked) && this.required(c);
    required!: GetB<C>;
    options!: Get<C, Arr<I>>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<C, SeCh<I>, H> & ChooserArgs<C, I> & CheckArgs & LabelsArgs<I>) {
        super();
        initValue(this, args);
        this.options = toGetA(args.options);
        this.defaultValue = { chosen: args.chosen ?? null, checked: args.checked ?? false };
        initLabels(this, args);
    }
}

export class SearchWidget<C, T, H extends boolean = false> extends Widget<C, T | null, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: T | null;
    onValueSet!: (context: C, newValue: T | null) => void;
    hideInRawData!: H;
    isError = (c: C, v: T | null) => v == null && this.required(c);
    required!: GetB<C>;
    inline!: GetB<C>;
    getSearchItem!: (item: T, t: Translations) => SearchItem;
    getXmlEntry!: () => string;
    items!: GetTR<C, T[]>;
    search!: undefined | ((search: string) => Promise<T[] | null>);
    type!: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint!: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode!: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize!: Get<C, HTMLInputAttributes['autocapitalize']>;

    constructor(args: ValueArgs<C, T | null, H> & SearchArgs<C, T>) {
        super();
        initValue(this, args);
        initSearch(this, args);
    }
}

export class InputWithSuggestionsWidget<C, H extends boolean = false> extends Widget<C, string, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: string;
    onValueSet!: (context: C, newValue: string) => void;
    hideInRawData!: H;
    isError = (c: C, v: string) => v == null && this.required(c);
    required!: GetB<C>;
    suggestions!: GetTAR<C>;
    type!: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint!: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode!: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize!: Get<C, HTMLInputAttributes['autocapitalize']>;
    suffix!: GetTU<C>;
    regex!: Get<C, RegExp>;
    capitalize!: GetB<C>;
    placeholder!: GetT<C>;

    constructor(args: ValueArgs<C, string, H> & Input1Args<C> & Input3Args<C> & SuggestionsArgs<C>) {
        super();
        initValue(this, args);
        initInput1(this, args);
        initInput3(this, args);
        initSuggestions(this, args);
    }
}

export class DoubleChooserWidget<C, I1 extends K, I2 extends K, H extends boolean = false> extends Widget<C, Pair<I1, I2>, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: Pair<I1, I2>;
    onValueSet!: (context: C, newValue: Pair<I1, I2>) => void;
    hideInRawData!: H;
    isError = (c: C, v: Pair<I1, I2>) =>
        (v.first == null || (v.second == null && !!this.options2(c).length)) && this.required(c);
    required!: GetB<C>;
    lock1!: GetB<C>;
    lock2!: GetB<C>;
    options1!: Get<C, Arr<I1>>;
    options2!: Get<C, Arr<I2>>;
    otherOptions1!: Get<C, Arr<I1>>;
    otherOptions2!: Get<C, Arr<I2>>;
    labels!: T<I1 | I2>;
    get!: ((t: Translations, v: I1 | I2 | null) => string);

    constructor(args: ValueArgs<C, Pair<I1, I2>, H> & DoubleLockArgs<C> & DoubleChooserArgs<C, I1, I2> & LabelsArgs<I1 | I2>) {
        super();
        initValue(this, args);
        initDoubleChooser(this, args);
        initDoubleLock(this, args);
        initLabels(this, args);
    }
}

export class CounterWidget<C, H extends boolean = false> extends Widget<C, number, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: number;
    onValueSet!: (context: C, newValue: number) => void;
    required = () => false;
    hideInRawData!: H;
    isError = (c: C, v: number) => !this.validate(v, c);
    lock!: GetB<C>;
    min!: Get<C, number>;
    max!: Get<C, number>;
    validate!: (n: number, c: C) => boolean;

    constructor(args: ValueArgs<C, number, H> & LockArgs<C> & CounterArgs<C>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initCounter(this, args);
    }
}

export class CountersWidget<C, I extends K, H extends boolean = false> extends Widget<C, Rec<I>, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    required = () => false;
    showTextValue!: GetB<C>;
    defaultValue!: Rec<I>;
    onValueSet!: (context: C, newValue: Rec<I>) => void;
    hideInRawData!: H;
    isError = (_c: C, _v: Rec<I>) => false;
    max!: Get<C, number>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<C, Rec<I>, H> & CountersArgs<C, I> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initCounters(this, args);
        initLabels(this, args);
    }
}

export class RadioWidget<C, I extends K, H extends boolean = false> extends Widget<C, I | null, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: I | null;
    onValueSet!: (context: C, newValue: I | null) => void;
    hideInRawData!: H;
    isError = (c: C, v: I | null) => v == null && this.required(c);
    required!: GetB<C>;
    lock!: GetB<C>;
    options!: Get<C, Arr<I>>;
    otherOptions!: Get<C, Arr<I>>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);

    constructor(args: ValueArgs<C, I | null, H> & ChooserArgs<C, I> & LockArgs<C> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initChooser(this, args);
        initLock(this, args);
        initLabels(this, args);
    }
}

export class RadioWithInputWidget<C, I extends K, H extends boolean = false> extends Widget<C, RaI<I>, H> {
    label!: GetT<C>;
    otherLabel!: GetT<C>;
    onError!: GetT<C>;
    options!: Get<C, Arr<I>>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    hideInRawData!: H;
    defaultValue!: RaI<I>;
    onValueSet!: (context: C, newValue: RaI<I>) => void;
    isError = (c: C, v: RaI<I>) => (
        v.chosen == null && this.required(c)
    ) || (
        v.chosen == this.options(c).at(-1)! && (
            v.text == '' || !this.regex(c).test(v.text)
        )
    );
    required!: GetB<C>;
    lock!: GetB<C>;

    type!: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint!: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode!: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize!: Get<C, HTMLInputAttributes['autocapitalize']>;
    regex!: Get<C, RegExp>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);
    capitalize!: GetB<C>;
    placeholder!: GetT<C>;

    constructor(args: ValueArgs<C, RaI<I>, H> & LockArgs<C> & Input1Args<C> & Input3Args<C> & ChooserArgs<C, I> & LabelsArgs<I> & {
        otherLabel: GetTOrVal<C>
    }) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initLabels(this, args);
        this.otherLabel = toGetT(args.otherLabel);
        this.options = toGetA(args.options);
        this.defaultValue = { chosen: args.chosen ?? null, text: args.text ?? '' };
    }
}

export class SwitchWidget<C, H extends boolean = false> extends Widget<C, boolean, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: boolean;
    onValueSet!: (context: C, newValue: boolean) => void;
    hideInRawData!: H;
    isError = (c: C, v: boolean) => !v && this.required(c);
    required!: GetB<C>;
    options!: Sides;
    hasPositivity!: GetB<C>;

    constructor(args: ValueArgs<C, boolean, H> & CheckArgs & SwitchArgs<C>) {
        super();
        initValue(this, args);
        initCheck(this, args);
        initSwitch(this, args);
    }
}

export class MultiCheckboxWidget<C, I extends K, H extends boolean = false> extends Widget<C, Arr<I>, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: Arr<I>;
    onValueSet!: (context: C, newValue: Arr<I>) => void;
    hideInRawData!: H;
    isError = (c: C, v: Arr<I>) => v.length == 0 && this.required(c);
    required!: GetB<C>;
    lock!: GetB<C>;
    options!: Get<C, Arr<I>>;
    max!: Get<C, number>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);
    inverseSelection!: boolean;
    weights!: (c: C, i: I) => number;

    constructor(args: ValueArgs<C, Arr<I>, H> & MultiChooserArgs<C, I> & LockArgs<C> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initMultiChooser(this, args);
        initLock(this, args);
        initLabels(this, args);
    }
}

export class InputWidget<C, H extends boolean = false> extends Widget<C, string, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    hideInRawData!: H;
    defaultValue!: string;
    onValueSet!: (context: C, newValue: string) => void;
    isError = (c: C, v: string) =>
        (v == '' && this.required(c)) || (v != '' && !this.regex(c).test(v));
    required!: GetB<C>;
    lock!: GetB<C>;

    type!: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint!: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode!: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize!: Get<C, HTMLInputAttributes['autocapitalize']>;
    suffix!: GetTU<C>;
    autocomplete!: Get<C, FullAutoFill>;
    updateMaskValue = $state(() => {
    }) as (text: string) => void;
    maskOptions!: Get<C, Opts>;
    regex!: Get<C, RegExp>;
    capitalize!: GetB<C>;
    textArea!: GetB<C>;
    placeholder!: GetT<C>;

    constructor(args: ValueArgs<C, string, H> & LockArgs<C> & Input1Args<C> & Input2Args<C> & Input3Args<C>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        initInput3(this, args);
    }
}

export class ScannerWidget<C, H extends boolean = false> extends InputWidget<C, H> {

    processScannedText!: (text: string, context: C) => string;

    constructor(args: ValueArgs<C, string, H> & LockArgs<C> & Input1Args<C> & Input2Args<C> & Input3Args<C> & {
        processScannedText?: (text: string, context: C) => string
    }) {
        super(args);
        this.processScannedText = args.processScannedText ?? (t => t);
    }
}

export class FileWidget<C, H extends boolean = false> extends Widget<C, Files, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue = () => false;
    hideInRawData!: H;
    defaultValue: Files = [];
    onValueSet!: (context: C, newValue: Files) => void;
    isError = (c: C, v: Files) => (v.length == 0) && this.required(c);
    required!: GetB<C>;
    lock!: GetB<C>;
    accept!: Get<C, string>;
    multiple!: GetB<C>;
    max!: Get<C, number>;

    constructor(args: ValueArgs<C, Files, H> & FileArgs<C> & LockArgs<C>) {
        super();
        initValue(this, args);
        initFile(this, args);
        initLock(this, args);
    }
}

export class PhotoSelectorWidget<C, H extends boolean = false> extends Widget<C, Files, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue = () => false;
    hideInRawData!: H;
    defaultValue: Files = [];
    onValueSet!: (context: C, newValue: Files) => void;
    isError = (c: C, v: Files) => (v.length == 0) && this.required(c);
    required!: GetB<C>;
    lock!: GetB<C>;
    accept!: Get<C, string>;
    multiple!: GetB<C>;
    max!: Get<C, number>;

    constructor(args: ValueArgs<C, Files, H> & FileArgs<C> & LockArgs<C>) {
        super();
        initValue(this, args);
        initFile(this, args, 'image/*');
        initLock(this, args);
    }
}

export class InputWithChooserWidget<C, I extends K, H extends boolean = false> extends Widget<C, SeI<I>, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    options!: Arr<I>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    hideInRawData!: H;
    defaultValue!: SeI<I>;
    onValueSet!: (context: C, newValue: SeI<I>) => void;
    isError = (c: C, v: SeI<I>) =>
        (v.text == '' && this.required(c)) || (v.text != '' && !this.regex(c).test(v.text));
    required!: GetB<C>;
    lock!: GetB<C>;

    type!: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint!: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode!: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize!: Get<C, HTMLInputAttributes['autocapitalize']>;
    autocomplete!: Get<C, FullAutoFill>;
    updateMaskValue = $state(() => {
    }) as (text: string) => void;
    maskOptions!: Get<C, Opts>;
    regex!: Get<C, RegExp>;
    capitalize!: GetB<C>;
    textArea!: GetB<C>;
    labels!: T<I>;
    get!: ((t: Translations, v: I | null) => string);
    placeholder!: GetT<C>;

    constructor(args: ValueArgs<C, SeI<I>, H> & LockArgs<C> & Input1Args<C> & Input2Args<C> & Input3Args<C> & SecondChooserArgs<I> & LabelsArgs<I>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        initSecondChooser(this, args);
        initLabels(this, args);
    }
}

export class CheckboxWithInputWidget<C, H extends boolean = false> extends Widget<C, ChI, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    hideInRawData!: H;
    defaultValue!: ChI;
    onValueSet!: (context: C, newValue: ChI) => void;
    isError = (c: C, v: ChI) =>
        (v.text == '' && this.required(c)) ||
        (!v.checked && this.required(c)) ||
        (v.text != '' && !this.regex(c).test(v.text));
    required!: GetB<C>;
    lock!: GetB<C>;

    type!: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint!: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode!: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize!: Get<C, HTMLInputAttributes['autocapitalize']>;
    autocomplete!: Get<C, FullAutoFill>;
    updateMaskValue = $state(() => {
    }) as (text: string) => void;
    maskOptions!: Get<C, Opts>;
    regex!: Get<C, RegExp>;
    capitalize!: GetB<C>;
    textArea!: GetB<C>;
    placeholder!: GetT<C>;

    constructor(args: ValueArgs<C, ChI, H> & LockArgs<C> & Input1Args<C> & Input2Args<C> & Input3Args<C> & CheckArgs) {
        super();
        initValue(this, args);
        initLock(this, args);
        initInput1(this, args);
        initInput2(this, args);
        this.defaultValue = { checked: args.checked ?? false, text: args.text ?? '' };
    }
}

export class CheckboxWidget<C, H extends boolean = false> extends Widget<C, boolean, H> {
    label!: GetT<C>;
    onError!: GetT<C>;
    show!: GetB<C>;
    showTextValue!: GetB<C>;
    defaultValue!: boolean;
    onValueSet!: (context: C, newValue: boolean) => void;
    hideInRawData!: H;
    required!: GetB<C>;
    isError = (c: C, v: boolean) => !v && this.required(c);
    lock!: GetB<C>;
    descriptionItems!: GetTA<C>;

    constructor(args: ValueArgs<C, boolean, H> & LockArgs<C> & CheckArgs & SingleCheckboxArgs<C>) {
        super();
        initValue(this, args);
        initLock(this, args);
        initCheck(this, args);
        initSingleCheckbox(this, args);
    }
}

export class HiddenValueWidget<C, T, H extends boolean = false> extends Widget<C, T, H> {
    label = () => '';
    onError = () => '';
    show = () => false;
    showTextValue = () => false;
    defaultValue!: T;
    onValueSet = () => {
    };
    hideInRawData!: H;
    isError = () => false;

    constructor(value: T, hideInRawData: H) {
        super();
        this.defaultValue = value;
        this.hideInRawData = hideInRawData;
    }
}