import { CheckboxWidget, ChooserWidget, CounterWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormUPF, PhotovoltaicFieldGroup } from '$lib/forms/UPF/formUPF';
import { p } from '$lib/translations';

const photovoltaicField = (n: number): PhotovoltaicFieldGroup => {
    const show = (d: FormUPF) => d.fields.count.value >= n;

    return {
        label: new TextWidget({ show, text: p(`Pole ${n}`), class: 'fs-5' }),
        panelCount: new InputWidget({
            show, required: show, label: p('Počet panelů'), type: 'number',
        }),
        orientation: new ChooserWidget({
            show, required: show, label: p('Orientace'), chosen: p('J'),
            options: p(['Z', 'JZ', 'J', 'JV', 'V']),
        }),
        slope: new InputWidget({
            show, required: show, label: p('Sklon'), type: 'number', suffix: 'units.degree',
        }),
        location: new ChooserWidget({
            show, required: show, label: p('Umístění'),
            options: ['fve.onFamilyHouse', 'fve.onOtherBuilding', 'fve.onLand'],
        }),
    };
};

export default (): FormUPF => ({
    fields: {
        count: new CounterWidget({
            label: p('Počet polí fotovoltaických panelů'),
            chosen: 1, min: 1, max: 4,
        }),
    },
    filed1: photovoltaicField(1),
    filed2: photovoltaicField(2),
    filed3: photovoltaicField(3),
    filed4: photovoltaicField(4),
    connection: {
        title: new TitleWidget({ text: p('Připojení') }),
        type: new ChooserWidget({
            label: p('Typ připojení'),
            options: ['fve.withNetworkSupplyPossibility', 'fve.withoutOverflows', 'fve.islandSystem'],
        }),
        reservedPower: new InputWidget({
            label: p('Rezervovaný výkon FVE'), suffix: 'units.kW', type: 'number',
        }),
        mainBreakerSize: new InputWidget({
            label: p('Velikost hlavního jističe objektu'), suffix: 'units.A', type: 'number',
        }),
        yearlyEnergyConsumption: new InputWidget({
            label: p('Průměrná roční spotřeba – původní před instalací FVE'), suffix: 'units.MWhPerYear', type: 'number',
        }),
        accumulationToWater: new CheckboxWidget({
            label: p('Akumulace do vody'), required: false,
        }),
        waterVolume: new InputWidget({
            label: p('Objem'), type: 'number', suffix: 'units.l',
            show: d => d.connection.accumulationToWater.value,
            required: d => d.connection.accumulationToWater.value,
        }),
        irCooperation: new CheckboxWidget({
            label: p('Spolupráce s IR'), required: false,
        }),
        otherSmartControl: new InputWidget({
            label: p('Jiné chytré řízení'), required: false,
        }),
        energySharing: new CheckboxWidget({
            label: p('Sdílení (komunitní energie)'), required: false,
        }),
    },
    commissioning: {
        date: new InputWidget({ label: 'dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});