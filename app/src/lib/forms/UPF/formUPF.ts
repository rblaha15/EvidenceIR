import type { CompaniesForm } from '$lib/forms/IN/formIN';
import type {
    CheckboxWidget,
    ChooserWidget,
    CounterWidget,
    InputWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget';
import type { Form, Values } from '$lib/forms/Form';

export type PanelOrientations = 'Z' | 'JZ' | 'J' | 'JV' | 'V';

export type PhotovoltaicFieldGroup = {
    label: TextWidget<ContextUPF>,
    panelCount: InputWidget<ContextUPF>,
    orientation: ChooserWidget<ContextUPF, PanelOrientations>,
    slope: InputWidget<ContextUPF>,
    location: ChooserWidget<ContextUPF, 'onFamilyHouse' | 'onOtherBuilding' | 'onLand'>,
}

export interface ContextUPF {
    f: FormUPF,
    v: Values<FormUPF>,
}

export interface FormUPF extends CompaniesForm<ContextUPF>, Form<ContextUPF> {
    fields: {
        title: TitleWidget<ContextUPF>,
        count: CounterWidget<ContextUPF>,
    },
    filed1: PhotovoltaicFieldGroup,
    filed2: PhotovoltaicFieldGroup,
    filed3: PhotovoltaicFieldGroup,
    filed4: PhotovoltaicFieldGroup,
    connection: {
        title: TitleWidget<ContextUPF>,
        type: ChooserWidget<ContextUPF, 'withNetworkSupplyPossibility' | 'withoutOverflows' | 'islandSystem'>,
        reservedPower: InputWidget<ContextUPF>,
        mainBreakerSize: InputWidget<ContextUPF>,
        yearlyEnergyConsumption: InputWidget<ContextUPF>,
        accumulationToWater: CheckboxWidget<ContextUPF>,
        waterVolume: InputWidget<ContextUPF>,
        otherSmartControl: InputWidget<ContextUPF>,
        energySharing: CheckboxWidget<ContextUPF>,
        contractNumber: InputWidget<ContextUPF>,
        consumingEAN: InputWidget<ContextUPF>,
        producingEAN: InputWidget<ContextUPF>,
    },
    commissioning: {
        date: InputWidget<ContextUPF>,
    },
}
