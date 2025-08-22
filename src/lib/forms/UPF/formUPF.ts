import {
    CheckboxWidget,
    ChooserWidget,
    CounterWidget,
    InputWidget,
    TextWidget,
    TitleWidget,
} from '../Widget.svelte.js';
import type { Form } from '$lib/forms/Form';

export type PanelOrientations = 'Z' | 'JZ' | 'J' | 'JV' | 'V';

export type PhotovoltaicFieldGroup = {
    label: TextWidget<FormUPF>,
    panelCount: InputWidget<FormUPF>,
    orientation: ChooserWidget<FormUPF, PanelOrientations>,
    slope: InputWidget<FormUPF>,
    location: ChooserWidget<FormUPF, 'onFamilyHouse' | 'onOtherBuilding' | 'onLand'>,
}

export interface FormUPF extends Form<FormUPF> {
    fields: {
        count: CounterWidget<FormUPF>,
    },
    filed1: PhotovoltaicFieldGroup,
    filed2: PhotovoltaicFieldGroup,
    filed3: PhotovoltaicFieldGroup,
    filed4: PhotovoltaicFieldGroup,
    connection: {
        title: TitleWidget<FormUPF>,
        type: ChooserWidget<FormUPF, 'withNetworkSupplyPossibility' | 'withoutOverflows' | 'islandSystem'>,
        reservedPower: InputWidget<FormUPF>,
        mainBreakerSize: InputWidget<FormUPF>,
        yearlyEnergyConsumption: InputWidget<FormUPF>,
        accumulationToWater: CheckboxWidget<FormUPF>,
        waterVolume: InputWidget<FormUPF>,
        otherSmartControl: InputWidget<FormUPF>,
        energySharing: CheckboxWidget<FormUPF>,
    },
    commissioning: {
        date: InputWidget<FormUPF>,
    },
}
