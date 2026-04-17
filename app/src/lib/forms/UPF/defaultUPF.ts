import type { ContextUPF, FormUPF, PhotovoltaicFieldGroup } from '$lib/forms/UPF/formUPF';
import { newCheckboxWidget, newChooserWidget, newCounterWidget, newInputWidget, newTextWidget, newTitleWidget } from '$lib/forms/Widget';

const photovoltaicField = (n: number): PhotovoltaicFieldGroup => {
    const show = (c: ContextUPF) => c.v.fields.count >= n;

    return {
        label: newTextWidget({
            show, class: 'text-lg', text: t => t.fve.field(n),
        }),
        panelCount: newInputWidget({
            show, required: show, label: t => t.fve.panelCount, type: 'number',
        }),
        orientation: newChooserWidget({
            show, required: show, label: t => t.fve.orientation, chosen: 'J',
            options: ['Z', 'JZ', 'J', 'JV', 'V'],
        }),
        slope: newInputWidget({
            show, required: show, label: t => t.fve.slope, type: 'number', suffix: t => t.units.degree,
        }),
        location: newChooserWidget({
            show, required: show, label: t => t.fve.location, labels: t => t.fve,
            options: ['onFamilyHouse', 'onOtherBuilding', 'onLand'],
        }),
    };
};

export default (): FormUPF => ({
    fields: {
        title: newTitleWidget({ text: t => t.in.system, level: 2 }),
        count: newCounterWidget({
            label: t => t.fve.fieldCount,
            chosen: 1, min: 1, max: 4,
        }),
    },
    filed1: photovoltaicField(1),
    filed2: photovoltaicField(2),
    filed3: photovoltaicField(3),
    filed4: photovoltaicField(4),
    connection: {
        title: newTitleWidget({ text: t => t.fve.connection, level: 2 }),
        type: newChooserWidget({
            label: t => t.fve.connectionType, labels: t => t.fve,
            options: ['withNetworkSupplyPossibility', 'withoutOverflows', 'islandSystem'],
        }),
        reservedPower: newInputWidget({
            label: t => t.fve.reservedPower, suffix: t => t.units.kW, type: 'number',
        }),
        mainBreakerSize: newInputWidget({
            label: t => t.fve.mainBreakerSize, suffix: t => t.units.A, type: 'number',
        }),
        yearlyEnergyConsumption: newInputWidget({
            label: t => t.fve.yearlyEnergyConsumption, suffix: t => t.units.MWhPerYear, type: 'number',
        }),
        accumulationToWater: newCheckboxWidget({
            label: t => t.fve.accumulationToWater, required: false,
        }),
        waterVolume: newInputWidget({
            label: t => t.fve.waterVolume, type: 'number', suffix: t => t.units.l,
            show: c => c.v.connection.accumulationToWater,
            required: c => c.v.connection.accumulationToWater,
        }),
        otherSmartControl: newInputWidget({
            label: t => t.fve.otherSmartControl, required: false,
        }),
        energySharing: newCheckboxWidget({
            label: t => t.fve.energySharing, required: false,
        }),
    },
    commissioning: {
        date: newInputWidget({ label: t => t.fve.dateOfCommission, type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});