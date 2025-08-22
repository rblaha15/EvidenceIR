import { CheckboxWidget, ChooserWidget, CounterWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormUPF, PhotovoltaicFieldGroup } from '$lib/forms/UPF/formUPF';

const photovoltaicField = (n: number): PhotovoltaicFieldGroup => {
    const show = (d: FormUPF) => d.fields.count.value >= n;

    return {
        label: new TextWidget({
            show, class: 'fs-5', text: t => t.fve.field({ n: `${n}` }),
        }),
        panelCount: new InputWidget({
            show, required: show, label: t => t.fve.panelCount, type: 'number',
        }),
        orientation: new ChooserWidget({
            show, required: show, label: t => t.fve.orientation, chosen: 'J',
            options: ['Z', 'JZ', 'J', 'JV', 'V'],
        }),
        slope: new InputWidget({
            show, required: show, label: t => t.fve.slope, type: 'number', suffix: t => t.units.degree,
        }),
        location: new ChooserWidget({
            show, required: show, label: t => t.fve.location, labels: t => t.fve,
            options: ['onFamilyHouse', 'onOtherBuilding', 'onLand'],
        }),
    };
};

export default (): FormUPF => ({
    fields: {
        count: new CounterWidget({
            label: t => t.fve.fieldCount,
            chosen: 1, min: 1, max: 4,
        }),
    },
    filed1: photovoltaicField(1),
    filed2: photovoltaicField(2),
    filed3: photovoltaicField(3),
    filed4: photovoltaicField(4),
    connection: {
        title: new TitleWidget({ text: t => t.fve.connection }),
        type: new ChooserWidget({
            label: t => t.fve.connectionType, labels: t => t.fve,
            options: ['withNetworkSupplyPossibility', 'withoutOverflows', 'islandSystem'],
        }),
        reservedPower: new InputWidget({
            label: t => t.fve.reservedPower, suffix: t => t.units.kW, type: 'number',
        }),
        mainBreakerSize: new InputWidget({
            label: t => t.fve.mainBreakerSize, suffix: t => t.units.A, type: 'number',
        }),
        yearlyEnergyConsumption: new InputWidget({
            label: t => t.fve.yearlyEnergyConsumption, suffix: t => t.units.MWhPerYear, type: 'number',
        }),
        accumulationToWater: new CheckboxWidget({
            label: t => t.fve.accumulationToWater, required: false,
        }),
        waterVolume: new InputWidget({
            label: t => t.fve.waterVolume, type: 'number', suffix: t => t.units.l,
            show: d => d.connection.accumulationToWater.value,
            required: d => d.connection.accumulationToWater.value,
        }),
        otherSmartControl: new InputWidget({
            label: t => t.fve.otherSmartControl, required: false,
        }),
        energySharing: new CheckboxWidget({
            label: t => t.fve.energySharing, required: false,
        }),
    },
    commissioning: {
        date: new InputWidget({ label: t => t.fve.dateOfCommission, type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});