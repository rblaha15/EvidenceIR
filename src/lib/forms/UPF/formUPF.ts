import {
    CheckboxWidget,
    ChooserWidget,
    CounterWidget,
    InputWidget,
    SearchWidget,
    SwitchWidget,
    TextWidget,
    TitleWidget,
} from '../Widget.svelte.js';
import type { Form, Raw } from '$lib/forms/Form';
import type { FormIN } from '../IN/formIN';
import type { SparePartWidgetGroup } from '$lib/forms/SP/formSP.svelte';
import type { SparePart } from '$lib/client/realtime';
import type { P } from '$lib/translations';
import type { DataUPT } from '$lib/forms/UPT/formUPT';

export type PhotovoltaicFieldGroup = {
    label: TextWidget<FormUPF>,
    panelCount: InputWidget<FormUPF>,
    orientation: ChooserWidget<FormUPF, P<'Z' | 'JZ' | 'J' | 'JV' | 'V'>>,
    slope: InputWidget<FormUPF>,
    location: ChooserWidget<FormUPF, 'fve.onFamilyHouse' | 'fve.onOtherBuilding' | 'fve.onLand'>,
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
        type: ChooserWidget<FormUPF, 'fve.withNetworkSupplyPossibility' | 'fve.withoutOverflows' | 'fve.islandSystem'>,
        reservedPower: InputWidget<FormUPF>,
        mainBreakerSize: InputWidget<FormUPF>,
        yearlyEnergyConsumption: InputWidget<FormUPF>,
        accumulationToWater: CheckboxWidget<FormUPF>,
        waterVolume: InputWidget<FormUPF>,
        irCooperation: CheckboxWidget<FormUPF>,
        otherSmartControl: InputWidget<FormUPF>,
        energySharing: CheckboxWidget<FormUPF>,
    },
    commissioning: {
        date: InputWidget<FormUPF>,
    },
}
