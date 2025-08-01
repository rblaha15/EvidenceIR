import type { Form, Raw } from '$lib/forms/Form';
import type { ChooserWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { OptionsInputsB, OptionsInputsC, OptionsOutputsB, OptionsOutputsF } from '$lib/forms/FT/portsOptions';
import type { P } from '$lib/translations';
import type { FormIN } from '$lib/forms/IN/formIN';

export type DataFT = Raw<FormIN>;

type WidgetInputC = ChooserWidget<DataFT, P<OptionsInputsC>>;
type WidgetInputB = ChooserWidget<DataFT, P<OptionsInputsB>>;
type WidgetOutputF = ChooserWidget<DataFT, P<OptionsOutputsF>>;
type WidgetOutputB = ChooserWidget<DataFT, P<OptionsOutputsB>>;

export interface FormFT extends Form<DataFT> {
    inputsC: {
        title: TitleWidget<DataFT>,
        C2: WidgetInputC,
        C3: WidgetInputC,
        C4: WidgetInputC,
        C5: WidgetInputC,
        C6: WidgetInputC,
        C7: WidgetInputC,
        C8: WidgetInputC,
        C9: WidgetInputC,
        labelUNI: TextWidget<DataFT>,
        UNI_1: WidgetInputC,
        UNI_2: WidgetInputC,
        UNI2_label: TextWidget<DataFT>,
        UNI2_1: WidgetInputC,
        UNI2_2: WidgetInputC,
    },
    inputsB: {
        title: TitleWidget<DataFT>,
        B8: WidgetInputB,
        B9: WidgetInputB,
    },
    outputsF: {
        title: TitleWidget<DataFT>,
        F2: WidgetOutputF,
        F3: WidgetOutputF,
        F4: WidgetOutputF,
        F5: WidgetOutputF,
        F6: WidgetOutputF,
        labelUNI: TextWidget<DataFT>,
        UNI_DO1: WidgetOutputF,
        UNI_DO2: WidgetOutputF,
        UNI2_label: TextWidget<DataFT>,
        UNI2_DO1: WidgetOutputF,
        UNI2_DO2: WidgetOutputF,
    },
    outputsB: {
        title: TitleWidget<DataFT>,
        B2: WidgetOutputB,
        B3: WidgetOutputB,
        labelUNI: TextWidget<DataFT>,
        UNI_AO1: WidgetOutputB,
        UNI2_label: TextWidget<DataFT>,
        UNI2_AO1: WidgetOutputB,
    },
    info: {
        setBy: InputWidget<DataFT>,
        date: InputWidget<DataFT>,
    },
}