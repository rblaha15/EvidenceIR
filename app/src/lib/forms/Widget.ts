import type { Translations } from '../translations';
import type { ClassValue, FullAutoFill, HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
import type { Untranslatable } from '$lib/translations/untranslatables';
import { readable, type Readable } from 'svelte/store';
import type { DataOfPdf, Pdf as PdfType, PdfParameters } from '$lib/pdf/pdf';
import type { Form, Values } from '$lib/forms/Form';
import type { Component } from "svelte";
import type { LucideProps } from "@lucide/svelte";
import type { ButtonSize, ButtonVariant } from "$lib/components/ui/button";
import type { MaskOptions } from "$lib/components/ui/input-group";

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

export const STAR = '∗';

export const labelAndStar = <C, U>(
    widget: Required<C, U, WidgetType, boolean>,
    context: C,
    t: Translations,
    getLabel: GetT<C> = widget.label,
) => {
    const label = getLabel(t, context);
    return label == '' ? '' : label + (!widget.required(context) ? '' : ` ${STAR}`);
};

const required = <C>(args: RequiredArgs<C>, context: C) =>
    toGetA(args.required ?? true)(context);

type TypeMap<C = never, H extends boolean = boolean> = {
    title: TitleWidget<C>,
    text: TextWidget<C>,
    inlinePdfPreview: InlinePdfPreviewWidget<C, any>,
    button: ButtonWidget<C>,
    chooser: ChooserWidget<C, any, H>,
    checkboxWithChooser: CheckboxWithChooserWidget<C, any, H>,
    search: SearchWidget<C, any, H>,
    doubleChooser: DoubleChooserWidget<C, any, any, H>,
    counter: CounterWidget<C, H>,
    counters: CountersWidget<C, any, H>,
    radio: RadioWidget<C, any, H>,
    radioWithInput: RadioWithInputWidget<C, any, H>,
    switch: SwitchWidget<C, H>,
    multiCheckbox: MultiCheckboxWidget<C, any, H>,
    input: InputWidget<C, H>,
    scanner: ScannerWidget<C, H>,
    file: FileWidget<C, H>,
    photoSelector: PhotoSelectorWidget<C, H>,
    inputWithChooser: InputWithChooserWidget<C, any, H>,
    checkboxWithInput: CheckboxWithInputWidget<C, H>,
    checkbox: CheckboxWidget<C, H>,
    hiddenValue: HiddenValueWidget<C, any, H>,
};
export type WidgetType = keyof TypeMap;
export type Widget<C = never, T extends WidgetType = WidgetType, H extends boolean = boolean> = TypeMap<C, H>[T]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseWidget<C = never, U = any, T extends WidgetType = any, H extends boolean = boolean> {
    widgetType: T;
    label: GetT<C>;
    onError: GetT<C>;
    show: GetB<C>;
    showTextValue: GetB<C>;
    defaultValue: U;
    onValueSet: (context: C, newValue: U) => void;
    hideInRawData: H;
    isError: (context: C, value: U) => boolean;
}

type K = string;
type T<I extends K> = (t: Translations) => Record<Exclude<I, Untranslatable>, string>;

export type SearchItemPiece = {
    readonly text: string,
    readonly width?: number,
    readonly icon?: Component<LucideProps>,
    readonly class?: ClassValue,
    readonly destructive?: boolean,
    readonly warning?: boolean,
    readonly notForSearchText?: boolean;
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
export type SeCh<I extends K> = { readonly chosen: I; readonly checked: boolean; };
export type Files = readonly { fileName: string, uuid: string }[];
export type InlinePdfPreviewData<C, P extends PdfType> = {
    type: P,
    data: DataOfPdf<P>,
    form: Form<C>,
    values: Values<Form<C>>,
    pages?: number[],
} & PdfParameters<P>;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type Color = 'warning' | 'danger' | 'primary' | 'info' | 'secondary' | 'success'

type HideArgs<H> = H extends false ? { hideInRawData?: H } : { hideInRawData: H };
type ShowArgs<C> = { show?: GetBOrVal<C>; showInXML?: GetBOrVal<C> };
type InfoArgs<C> = { text: GetTPOrVal<C>; class?: GetOrVal<C, ClassValue | undefined>; } & ShowArgs<C>;
type BtnArgs<C> = {
    text: GetTOrVal<C>;
    variant: GetOrVal<C, ButtonVariant>;
    size?: GetOrVal<C, ButtonSize>;
    icon?: GetOrVal<C, Component<LucideProps> | undefined>;
    onClick: Get<C, void>,
} & ShowArgs<C>;
type TitleArgs = { level: HeadingLevel };
type PdfArgs<C, P extends PdfType> = { pdfData: GetT<C, InlinePdfPreviewData<C, P>> } & Omit<ShowArgs<C>, 'showInXML'>;
type RequiredArgs<C> = { required?: GetBOrVal<C> };
type ValueArgs<C, U, H> = {
    label: GetTOrVal<C>, onError?: GetTOrVal<C>; onValueSet?: (context: C, newValue: U) => void
} & HideArgs<H> & ShowArgs<C> & RequiredArgs<C>;
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
type OtherLabelArgs<C> = { otherLabel: GetTOrVal<C>; };
type CompactArgs<C> = { compact?: GetBOrVal<C>; };
type DoubleLockArgs<C> = { lock1?: GetBOrVal<C>; lock2?: GetBOrVal<C>; };
type SearchArgs<C, T> = {
    getSearchItem: (item: T, t: Translations, c: C) => SearchItem;
    getXmlEntry?: (v: T | null) => string;
    inline?: GetBOrVal<C>;
    type?: GetOrVal<C, HTMLInputTypeAttribute>;
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
} & LabelsArgs<I>;
type BaseInputArgs<C> = {
    regex?: GetOrVal<C, RegExp>;
    type?: GetOrVal<C, HTMLInputTypeAttribute>;
    enterkeyhint?: GetOrVal<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode?: GetOrVal<C, HTMLInputAttributes['inputmode']>;
    autocapitalize?: GetOrVal<C, HTMLInputAttributes['autocapitalize']>;
};
type AdvancedInputArgs<C> = {
    textArea?: GetBOrVal<C>;
    compact?: GetBOrVal<C>;
    maskOptions?: GetOrVal<C, MaskOptions | undefined>;
    autocomplete?: GetOrVal<C, FullAutoFill>;
    capitalize?: GetBOrVal<C>;
    placeholder?: GetTOrVal<C>;
    suffix?: GetTUOrVal<C>;
    suggestions?: GetTAROrVal<C>;
};
type OnlyInputArgs = {
    text?: string;
};

type Info<C> = { text: GetTP<C>; class: Get<C, ClassValue | undefined>; };
type Btn<C> = {
    text: GetT<C>;
    variant: Get<C, ButtonVariant>;
    size: Get<C, ButtonSize>;
    icon: Get<C, Component<LucideProps> | undefined>;
    onClick: Get<C, void>
};
type Title = { level: HeadingLevel; };
type Pdf<C, P extends PdfType> = { pdfData: GetT<C, InlinePdfPreviewData<C, P>> };
export type Required<C, U, T extends WidgetType, H extends boolean> = BaseWidget<C, U, T, H> & { required: GetB<C>; };
export type Labels<I extends string> = { labels: T<I>; get: (t: Translations, v: I | null) => string; };
type File<C> = { multiple: GetB<C>; max: Get<C, number>; accept: Get<C, string>; };
export type Lock<C> = { lock: GetB<C>; };
type OtherLabel<C> = { otherLabel: GetT<C>; };
type Compact<C> = { compact: GetB<C>; };
type DoubleLock<C> = { lock1: GetB<C>; lock2: GetB<C>; };
type Chooser<C, I extends K> = { options: Get<C, Arr<I>>; otherOptions: Get<C, Arr<I>> };
type SecondChooser<I extends K> = { options: Arr<I> };
type DoubleChooser<C, I1 extends K, I2 extends K> = {
    options1: Get<C, Arr<I1>>;
    options2: Get<C, Arr<I2>>;
    otherOptions1: Get<C, Arr<I1>>;
    otherOptions2: Get<C, Arr<I2>>;
};
type Search<C, T> = {
    getSearchItem: (item: T, t: Translations, c: C) => SearchItem;
    getXmlEntry: (v: T | null) => string;
    inline: GetB<C>;
    items: GetTR<C, T[]>;
    search?: (search: string) => Promise<T[] | null>;
    type: Get<C, HTMLInputTypeAttribute>;
};
type Counter<C> = { min: Get<C, number>; max: Get<C, number>; validate: (v: number, c: C) => boolean; };
type Counters<C> = { max: Get<C, number> };
type Switch<C> = { options: Sides; hasPositivity: GetB<C>; };
type SingleCheckbox<C> = { descriptionItems: GetTA<C>; };
type MultiChooser<C, I extends K> = {
    options: Get<C, Arr<I>>;
    max: Get<C, number>;
    weights: (c: C, i: I) => number;
};
export type BaseInput<C> = {
    type: Get<C, HTMLInputTypeAttribute>;
    enterkeyhint: Get<C, HTMLInputAttributes['enterkeyhint']>;
    inputmode: Get<C, HTMLInputAttributes['inputmode']>;
    autocapitalize: Get<C, HTMLInputAttributes['autocapitalize']>;
    regex: Get<C, RegExp>;
};
export type AdvancedInput<C> = {
    textArea: GetB<C>;
    compact: GetB<C>;
    autocomplete: Get<C, FullAutoFill>;
    maskOptions: Get<C, MaskOptions | undefined>;
    capitalize: GetB<C>;
    placeholder: GetT<C>;
    suffix: GetTU<C>;
    suggestions: GetTAR<C>;
};

const get = <I extends string>(l: Record<Exclude<I, Untranslatable>, string | undefined> | undefined, v: I | null): string =>
    v ? l?.[v] ?? v ?? '' : '';

const initInfo = <C>(args: InfoArgs<C>) => ({
    text: toGetT(args.text),
    show: toGetA(args.show ?? true),
    class: toGetA(args.class),
    showTextValue: toGetA(args.showInXML ?? args.show ?? true),
});
const initBtn = <C>(args: BtnArgs<C>) => ({
    text: toGetT(args.text),
    show: toGetA(args.show ?? true),
    variant: toGetA(args.variant),
    size: toGetA(args.size ?? 'default'),
    icon: toGetA(args.icon),
    onClick: toGetA(args.onClick),
});
const initTitle = (args: TitleArgs) => ({
    level: args.level,
});
const initPdf = <C, P extends PdfType>(args: PdfArgs<C, P>) => ({
    pdfData: args.pdfData,
    show: toGetA(args.show ?? true),
});
const initValue = <C, U, H extends boolean>(args: ValueArgs<C, U, H>) => ({
    label: toGetT(args.label),
    show: toGetA(args.show ?? true),
    showTextValue: toGetA(args.showInXML ?? args.show ?? true),
    hideInRawData: (args.hideInRawData ?? false) as H,
    onError: toGetT(args.onError ?? (t => t.widget.requiredField)),
    required: toGetA(args.required ?? true),
    onValueSet: args.onValueSet ?? (() => null),
});
const initFile = <C>(args: FileArgs<C>, defaultAccept: string = '*') => ({
    multiple: toGetA(args.multiple ?? false),
    max: toGetA(args.max ?? Number.POSITIVE_INFINITY),
    accept: toGetA(args.accept ?? defaultAccept),
});
const initChooser = <C, I extends K>(args: ChooserArgs<C, I>) => ({
    options: toGetA(args.options),
    otherOptions: toGetA(args.otherOptions ?? []),
    defaultValue: args.chosen ?? null,
});
const initSecondChooser = <I extends K>(args: SecondChooserArgs<I>) => ({
    options: args.options,
    defaultValue: { chosen: args.chosen ?? args.options[0], text: args.text ?? '' },
});
const initDoubleChooser = <C, I1 extends K, I2 extends K>(args: DoubleChooserArgs<C, I1, I2>) => ({
    options1: toGetA(args.options1),
    options2: toGetA(args.options2),
    otherOptions1: toGetA(args.otherOptions1 ?? []),
    otherOptions2: toGetA(args.otherOptions2 ?? []),
    defaultValue: args.chosen ?? { first: null, second: null },
});
const initLock = <C>(args: LockArgs<C>) => ({
    lock: toGetA(args.lock ?? false),
});
const initOtherLabel = <C>(args: OtherLabelArgs<C>) => ({
    otherLabel: toGetT(args.otherLabel),
});
const initLabels = <I extends string>(args: LabelsArgs<I>) => ({
    labels: args.labels ?? (() => ({}) as Record<I, string>),
    get: (t: Translations, v: I | null) => get(args.labels?.(t), v),
});
const initCompact = <C>(args: CompactArgs<C>) => ({
    compact: toGetA(args.compact ?? false),
});
const initDoubleLock = <C>(args: DoubleLockArgs<C>) => ({
    lock1: toGetA(args.lock1 ?? false),
    lock2: toGetA(args.lock2 ?? false),
});
const initSearch = <C, T>(args: SearchArgs<C, T>) => ({
    defaultValue: args.chosen ?? null,
    items: toGetT(args.items ?? readable([])),
    search: args.search,
    getSearchItem: args.getSearchItem,
    getXmlEntry: args.getXmlEntry ?? ((v: T | null) => JSON.stringify(v)),
    type: toGetA(args.type ?? 'search'),
    inline: toGetA(args.inline ?? false),
});
const initCounter = <C>(args: CounterArgs<C>) => ({
    defaultValue: args.chosen,
    min: toGetA(args.min),
    max: toGetA(args.max),
    validate: args.validate ?? (() => true),
});
const initCounters = <C, I extends K>(args: CountersArgs<C, I>) => ({
    defaultValue: args.counts,
    max: toGetA(args.max),
});
const initSwitch = <C>(args: SwitchArgs<C>) => ({
    hasPositivity: toGetA(args.hasPositivity ?? false),
    options: args.options,
});
const initCheck = (args: CheckArgs) => ({
    defaultValue: args.checked ?? false,
});
const initSingleCheckbox = <C>(args: SingleCheckboxArgs<C>) => ({
    descriptionItems: toGetT(args.descriptionItems ?? []),
});
const initMultiChooser = <C, I extends K>(args: MultiChooserArgs<C, I>) => ({
    defaultValue: args.chosen ?? [],
    max: toGetA(args.max ?? Number.MAX_VALUE),
    options: toGetA(args.options),
    weights: args.weights ?? (() => 1),
});
const initBaseInput = <C>(args: BaseInputArgs<C>) => ({
    regex: toGetA(args.regex ?? /.*/),
    type: toGetA(args.type ?? 'text'),
    enterkeyhint: toGetA(args.enterkeyhint),
    inputmode: toGetA(args.inputmode),
    autocapitalize: toGetA(args.autocapitalize),
});
const initAdvancedInput = <C>(args: AdvancedInputArgs<C>) => ({
    textArea: toGetA(args.textArea ?? false),
    compact: toGetA(args.compact ?? false),
    maskOptions: toGetA(args.maskOptions ?? undefined),
    autocomplete: toGetA(args.autocomplete ?? 'off'),
    capitalize: toGetA(args.capitalize ?? false),
    placeholder: toGetT(args.placeholder ?? ''),
    suffix: toGetT(args.suffix),
    suggestions: toGetT(args.suggestions ?? readable([])),
});
const initOnlyInput = (args: OnlyInputArgs) => ({
    defaultValue: args.text ?? '',
});

export interface TitleWidget<C> extends BaseWidget<C, undefined, 'title', true>, Info<C>, Title {
}

export const newTitleWidget = <C>(
    args: InfoArgs<C> & TitleArgs,
): TitleWidget<C> => ({
    widgetType: 'title' as const,
    label: () => '' as const,
    onError: () => '' as const,
    defaultValue: undefined,
    onValueSet: () => null,
    hideInRawData: true as const,
    isError: () => false,
    ...initInfo(args),
    ...initTitle(args),
});

export interface TextWidget<C> extends BaseWidget<C, undefined, 'text', true>, Info<C> {
}

export const newTextWidget = <C>(
    args: InfoArgs<C>,
): TextWidget<C> => ({
    widgetType: 'text' as const,
    label: () => '' as const,
    onError: () => '' as const,
    defaultValue: undefined,
    onValueSet: () => null,
    hideInRawData: true as const,
    isError: () => false,
    ...initInfo(args),
});

export interface InlinePdfPreviewWidget<C, P extends PdfType> extends BaseWidget<C, undefined, 'inlinePdfPreview', true>, Pdf<C, P> {
}

export const newInlinePdfPreviewWidget = <C, P extends PdfType>(
    args: PdfArgs<C, P>,
): InlinePdfPreviewWidget<C, P> => ({
    widgetType: 'inlinePdfPreview' as const,
    label: () => '' as const,
    onError: () => '' as const,
    showTextValue: () => false as const,
    defaultValue: undefined,
    onValueSet: () => null,
    hideInRawData: true as const,
    isError: () => false,
    ...initPdf(args),
});

export interface ButtonWidget<C> extends BaseWidget<C, undefined, 'button', true>, Btn<C> {
}

export const newButtonWidget = <C>(
    args: BtnArgs<C>,
): ButtonWidget<C> => ({
    widgetType: 'button' as const,
    label: () => '' as const,
    onError: () => '' as const,
    showTextValue: () => false as const,
    defaultValue: undefined,
    onValueSet: () => null,
    hideInRawData: true as const,
    isError: () => false,
    ...initBtn(args),
});

export interface ChooserWidget<C, I extends K, H extends boolean = false> extends Required<C, I | null, 'chooser', H>, Chooser<C, I>, Lock<C>, Compact<C>, Labels<I> {
}

export const newChooserWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, I | null, H> & ChooserArgs<C, I> & LockArgs<C> & CompactArgs<C> & LabelsArgs<I>,
): ChooserWidget<C, I, H> => ({
    widgetType: 'chooser' as const,
    isError: (c: C, v: I | null) => v == null && required(args, c),
    ...initValue<C, I | null, H>(args),
    ...initChooser(args),
    ...initLock(args),
    ...initCompact(args),
    ...initLabels(args),
});

export interface CheckboxWithChooserWidget<C, I extends K, H extends boolean = false> extends Required<C, SeCh<I>, 'checkboxWithChooser', H>, Labels<I> {
    options: Get<C, Arr<I>>;
}

export const newCheckboxWithChooserWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, SeCh<I>, H> & ChooserArgs<C, I> & CheckArgs & LabelsArgs<I> & {
        chosen: I;
    },
): CheckboxWithChooserWidget<C, I, H> => ({
    widgetType: 'checkboxWithChooser' as const,
    isError: (c: C, v: SeCh<I>) => (v.chosen == null || !v.checked) && required(args, c),
    ...initValue<C, SeCh<I>, H>(args),
    options: toGetA(args.options),
    defaultValue: { chosen: args.chosen, checked: args.checked ?? false },
    ...initLabels(args),
});

export interface SearchWidget<C, T, H extends boolean = false> extends Required<C, T | null, 'search', H>, Search<C, T> {
}

export const newSearchWidget = <C, T, H extends boolean = false>(
    args: ValueArgs<C, T | null, H> & SearchArgs<C, T>,
): SearchWidget<C, T, H> => ({
    widgetType: 'search' as const,
    isError: (c: C, v: T | null) => v == null && required(args, c),
    ...initValue<C, T | null, H>(args),
    ...initSearch(args),
});

export interface DoubleChooserWidget<C, I1 extends K, I2 extends K, H extends boolean = false> extends Required<C, Pair<I1, I2>, 'doubleChooser', H>, DoubleChooser<C, I1, I2>, DoubleLock<C>, Labels<I1 | I2> {
}

export const newDoubleChooserWidget = <C, I1 extends K, I2 extends K, H extends boolean = false>(
    args: ValueArgs<C, Pair<I1, I2>, H> & DoubleLockArgs<C> & DoubleChooserArgs<C, I1, I2> & LabelsArgs<I1 | I2>,
): DoubleChooserWidget<C, I1, I2, H> => ({
    widgetType: 'doubleChooser' as const,
    isError: (c: C, v: Pair<I1, I2>) => (v.first == null || (v.second == null && !!toGetA(args.options2)(c).length)) && required(args, c),
    ...initValue<C, Pair<I1, I2>, H>(args),
    ...initDoubleChooser(args),
    ...initDoubleLock(args),
    ...initLabels(args),
});

export interface CounterWidget<C, H extends boolean = false> extends Required<C, number, 'counter', H>, Lock<C>, Counter<C> {
}

export const newCounterWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, number, H> & LockArgs<C> & CounterArgs<C>,
): CounterWidget<C, H> => ({
    widgetType: 'counter' as const,
    isError: (c: C, v: number) => !(args.validate ?? (() => true))(v, c),
    ...initValue<C, number, H>(args),
    ...initLock(args),
    ...initCounter(args),
    required: () => false,
});

export interface CountersWidget<C, I extends K, H extends boolean = false> extends Required<C, Rec<I>, 'counters', H>, Counters<C>, Labels<I> {
}

export const newCountersWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, Rec<I>, H> & CountersArgs<C, I> & LabelsArgs<I>,
): CountersWidget<C, I, H> => ({
    widgetType: 'counters' as const,
    isError: (_c: C, _v: Rec<I>) => false,
    ...initValue<C, Rec<I>, H>(args),
    ...initCounters(args),
    ...initLabels(args),
    required: () => false,
});

export interface RadioWidget<C, I extends K, H extends boolean = false> extends Required<C, I | null, 'radio', H>, Chooser<C, I>, Lock<C>, Labels<I> {
}

export const newRadioWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, I | null, H> & ChooserArgs<C, I> & LockArgs<C> & LabelsArgs<I>,
): RadioWidget<C, I, H> => ({
    widgetType: 'radio' as const,
    isError: (c: C, v: I | null) => v == null && required(args, c),
    ...initValue<C, I | null, H>(args),
    ...initChooser(args),
    ...initLock(args),
    ...initLabels(args),
});

export interface RadioWithInputWidget<C, I extends K, H extends boolean = false> extends Required<C, RaI<I>, 'radioWithInput', H>, Lock<C>, BaseInput<C>, Labels<I>, OtherLabel<C> {
    options: Get<C, Arr<I>>;
}

export const newRadioWithInputWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, RaI<I>, H> & LockArgs<C> & BaseInputArgs<C> & OnlyInputArgs & ChooserArgs<C, I> & LabelsArgs<I> & OtherLabelArgs<C>,
): RadioWithInputWidget<C, I, H> => ({
    widgetType: 'radioWithInput' as const,
    isError: (c: C, v: RaI<I>) => (v.chosen == null && required(args, c)) || (v.chosen == toGetA(args.options)(c).at(-1)! && (v.text == '' || !!args.regex && !toGetA(args.regex)(c).test(v.text))),
    ...initValue<C, RaI<I>, H>(args),
    ...initLock(args),
    ...initBaseInput(args),
    ...initLabels(args),
    ...initOtherLabel(args),
    options: toGetA(args.options),
    defaultValue: { chosen: args.chosen ?? null, text: args.text ?? '' },
});

export interface SwitchWidget<C, H extends boolean = false> extends Required<C, boolean, 'switch', H>, Switch<C> {
}

export const newSwitchWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, boolean, H> & CheckArgs & SwitchArgs<C>,
): SwitchWidget<C, H> => ({
    widgetType: 'switch' as const,
    isError: (c: C, v: boolean) => !v && required(args, c),
    ...initValue<C, boolean, H>(args),
    ...initCheck(args),
    ...initSwitch(args),
});

export interface MultiCheckboxWidget<C, I extends K, H extends boolean = false> extends Required<C, Arr<I>, 'multiCheckbox', H>, MultiChooser<C, I>, Lock<C>, Labels<I> {
}

export const newMultiCheckboxWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, Arr<I>, H> & MultiChooserArgs<C, I> & LockArgs<C> & LabelsArgs<I>,
): MultiCheckboxWidget<C, I, H> => ({
    widgetType: 'multiCheckbox' as const,
    isError: (c: C, v: Arr<I>) => v.length == 0 && required(args, c),
    ...initValue<C, Arr<I>, H>(args),
    ...initMultiChooser(args),
    ...initLock(args),
    ...initLabels(args),
});

export interface InputWidget<C, H extends boolean = false> extends Required<C, string, 'input', H>, Lock<C>, BaseInput<C>, AdvancedInput<C> {
}

export const newInputWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, string, H> & LockArgs<C> & BaseInputArgs<C> & AdvancedInputArgs<C> & OnlyInputArgs,
): InputWidget<C, H> => ({
    widgetType: 'input' as const,
    isError: (c: C, v: string) =>
        (v == '' && required(args, c)) ||
        (v != '' && !!args.regex && !toGetA(args.regex)(c).test(v)),
    ...initValue<C, string, H>(args),
    ...initLock(args),
    ...initBaseInput(args),
    ...initAdvancedInput(args),
    ...initOnlyInput(args),
});

export interface ScannerWidget<C, H extends boolean = false> extends Required<C, string, 'scanner', H>, Lock<C>, BaseInput<C>, AdvancedInput<C> {
    processScannedText: (text: string, context: C) => string;
}

export const newScannerWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, string, H> & LockArgs<C> & BaseInputArgs<C> & AdvancedInputArgs<C> & OnlyInputArgs & {
        processScannedText?: (text: string, context: C) => string
    },
): ScannerWidget<C, H> => ({
    widgetType: 'scanner' as const,
    isError: (c: C, v: string) => (v == '' && required(args, c)) || (v != '' && !!args.regex && !toGetA(args.regex)(c).test(v)),
    ...initValue<C, string, H>(args),
    ...initLock(args),
    ...initBaseInput(args),
    ...initAdvancedInput(args),
    ...initOnlyInput(args),
    processScannedText: args.processScannedText ?? (t => t),
});

export interface FileWidget<C, H extends boolean = false> extends Required<C, Files, 'file', H>, File<C>, Lock<C> {
}

export const newFileWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, Files, H> & FileArgs<C> & LockArgs<C>,
): FileWidget<C, H> => ({
    widgetType: 'file' as const,
    defaultValue: [],
    isError: (c: C, v: Files) => (v.length == 0) && required(args, c),
    ...initValue<C, Files, H>(args),
    ...initFile(args),
    ...initLock(args),
    showTextValue: () => false,
});

export interface PhotoSelectorWidget<C, H extends boolean = false> extends Required<C, Files, 'photoSelector', H>, File<C>, Lock<C> {
}

export const newPhotoSelectorWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, Files, H> & FileArgs<C> & LockArgs<C>,
): PhotoSelectorWidget<C, H> => ({
    widgetType: 'photoSelector' as const,
    defaultValue: [],
    isError: (c: C, v: Files) => (v.length == 0) && required(args, c),
    ...initValue<C, Files, H>(args),
    ...initFile(args, 'image/*'),
    ...initLock(args),
    showTextValue: () => false,
});

export interface InputWithChooserWidget<C, I extends K, H extends boolean = false> extends Required<C, SeI<I>, 'inputWithChooser', H>, Lock<C>, BaseInput<C>, AdvancedInput<C>, SecondChooser<I>, Labels<I> {
}

export const newInputWithChooserWidget = <C, I extends K, H extends boolean = false>(
    args: ValueArgs<C, SeI<I>, H> & LockArgs<C> & BaseInputArgs<C> & AdvancedInputArgs<C> & OnlyInputArgs & SecondChooserArgs<I> & LabelsArgs<I>,
): InputWithChooserWidget<C, I, H> => ({
    widgetType: 'inputWithChooser' as const,
    isError: (c: C, v: SeI<I>) => (v.text == '' && required(args, c)) || (v.text != '' && !!args.regex && !toGetA(args.regex)(c).test(v.text)),
    ...initValue<C, SeI<I>, H>(args),
    ...initLock(args),
    ...initBaseInput(args),
    ...initAdvancedInput(args),
    ...initSecondChooser(args),
    ...initLabels(args),
});

export interface CheckboxWithInputWidget<C, H extends boolean = false> extends Required<C, ChI, 'checkboxWithInput', H>, Lock<C>, BaseInput<C>, AdvancedInput<C>, OtherLabel<C> {
}

export const newCheckboxWithInputWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, ChI, H> & LockArgs<C> & BaseInputArgs<C> & AdvancedInputArgs<C> & OnlyInputArgs & CheckArgs & OtherLabelArgs<C>,
): CheckboxWithInputWidget<C, H> => ({
    widgetType: 'checkboxWithInput' as const,
    isError: (c: C, v: ChI) => (v.text == '' && required(args, c)) || (!v.checked && required(args, c)) || (v.text != '' && !!args.regex && !toGetA(args.regex)(c).test(v.text)),
    ...initValue<C, ChI, H>(args),
    ...initLock(args),
    ...initBaseInput(args),
    ...initAdvancedInput(args),
    ...initOtherLabel(args),
    defaultValue: { checked: args.checked ?? false, text: args.text ?? '' },
});

export interface CheckboxWidget<C, H extends boolean = false> extends Required<C, boolean, 'checkbox', H>, Lock<C>, SingleCheckbox<C> {
}

export const newCheckboxWidget = <C, H extends boolean = false>(
    args: ValueArgs<C, boolean, H> & LockArgs<C> & CheckArgs & SingleCheckboxArgs<C>,
): CheckboxWidget<C, H> => ({
    widgetType: 'checkbox' as const,
    isError: (c: C, v: boolean) => !v && required(args, c),
    ...initValue<C, boolean, H>(args),
    ...initLock(args),
    ...initCheck(args),
    ...initSingleCheckbox(args),
});

export interface HiddenValueWidget<C, T, H extends boolean = false> extends BaseWidget<C, T, 'hiddenValue', H> {
}

export const newHiddenValueWidget = <C, T, H extends boolean = false>(
    value: T, hideInRawData: H,
): HiddenValueWidget<C, T, H> => ({
    widgetType: 'hiddenValue' as const,
    label: () => '',
    onError: () => '',
    show: () => false,
    showTextValue: () => false,
    onValueSet: () => null,
    isError: () => false,
    defaultValue: value,
    hideInRawData: hideInRawData,
});