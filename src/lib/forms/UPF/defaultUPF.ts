import { CheckboxWidget, ChooserWidget, CounterWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormUPF, PhotovoltaicFieldGroup } from '$lib/forms/UPF/formUPF';
import { p } from '$lib/translations';

const photovoltaicField = (n: number): PhotovoltaicFieldGroup => {
    const show = (d: FormUPF) => d.fields.count.value >= n;

    return {
        label: new TextWidget({
            show, class: 'fs-5', text: (_, t) => t.refFromTemplate('fve.field', { n: `${n}` }),
        }),
        panelCount: new InputWidget({
            show, required: show, label: 'fve.panelCount', type: 'number',
        }),
        orientation: new ChooserWidget({
            show, required: show, label: 'fve.orientation', chosen: p('J'),
            options: p(['Z', 'JZ', 'J', 'JV', 'V']),
        }),
        slope: new InputWidget({
            show, required: show, label: 'fve.slope', type: 'number', suffix: 'units.degree',
        }),
        location: new ChooserWidget({
            show, required: show, label: 'fve.location',
            options: ['fve.onFamilyHouse', 'fve.onOtherBuilding', 'fve.onLand'],
        }),
    };
};

export default (): FormUPF => ({
    fields: {
        count: new CounterWidget({
            label: 'fve.fieldCount',
            chosen: 1, min: 1, max: 4,
        }),
    },
    filed1: photovoltaicField(1),
    filed2: photovoltaicField(2),
    filed3: photovoltaicField(3),
    filed4: photovoltaicField(4),
    connection: {
        title: new TitleWidget({ text: 'fve.connection' }),
        type: new ChooserWidget({
            label: 'fve.connectionType',
            options: ['fve.withNetworkSupplyPossibility', 'fve.withoutOverflows', 'fve.islandSystem'],
        }),
        reservedPower: new InputWidget({
            label: 'fve.reservedPower', suffix: 'units.kW', type: 'number',
        }),
        mainBreakerSize: new InputWidget({
            label: 'fve.mainBreakerSize', suffix: 'units.A', type: 'number',
        }),
        yearlyEnergyConsumption: new InputWidget({
            label: 'fve.yearlyEnergyConsumption', suffix: 'units.MWhPerYear', type: 'number',
        }),
        accumulationToWater: new CheckboxWidget({
            label: 'fve.accumulationToWater', required: false,
        }),
        waterVolume: new InputWidget({
            label: 'fve.waterVolume', type: 'number', suffix: 'units.l',
            show: d => d.connection.accumulationToWater.value,
            required: d => d.connection.accumulationToWater.value,
        }),
        otherSmartControl: new InputWidget({
            label: 'fve.otherSmartControl', required: false,
        }),
        energySharing: new CheckboxWidget({
            label: 'fve.energySharing', required: false,
        }),
    },
    commissioning: {
        date: new InputWidget({ label: 'fve.dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});