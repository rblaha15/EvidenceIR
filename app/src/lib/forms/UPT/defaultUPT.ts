import { CheckboxWidget, ChooserWidget, type GetOrVal, InputWidget, SwitchWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormUPT } from '$lib/forms/UPT/formUPT';

const newSuitsWidget = <D>(args: {
    label: GetOrVal<D>,
    onError?: GetOrVal<D>,
    required?: GetOrVal<D, boolean>,
    show?: GetOrVal<D, boolean>,
    chosen?: boolean,
}) => new SwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: [`suitsNot`, `suits`] as const,
    hasPositivity: true,
});

export default (): FormUPT => ({
    tc: {
        nadpis: new TitleWidget({ text: `heatPump` }),
        jisticTC: newSuitsWidget({ label: `characteristicsAndSizeOfHeatPumpBreaker` }),
        jisticVJ: newSuitsWidget({
            show: d => d.evidence.ir.typ.first!.includes('BOX'),
            label: `characteristicsAndSizeOfIndoorUnitBreaker`,
        }),
        vzdalenostZdi: newSuitsWidget({ label: `distanceFromWall`, show: d => d.evidence.tc.typ == `airToWater` }),
        kondenzator: new CheckboxWidget({
            required: false,
            label: `isCompensatorInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new CheckboxWidget({ required: false, label: `isCirculationPumpFilterInstalled` }),
    },
    nadrze: {
        nadpis: new TitleWidget({ text: `tanks` }),
        akumulacka: new InputWidget({ label: `typeOfAccumulationTank`, required: false }),
        zasobnik: new InputWidget({ label: `typeOfStorageTank`, required: false }),
    },
    os: {
        nadpis: new TitleWidget({ text: `heatingSystem` }),
        tvori: new ChooserWidget({
            label: `heatingSystemConsistsOf`, options: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ],
        }),
        popis: new InputWidget({
            label: `heatingSystemDescription`,
            show: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
            required: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
        }),
        dzTop: new CheckboxWidget({ required: false, label: `isAdditionalHeatingSourceConnected` }),
        typDzTop: new InputWidget({
            label: `typeAndPowerOfAdditionalHeatingSource`,
            show: d => d.uvedeni.os.dzTop.value,
            required: d => d.uvedeni.os.dzTop.value,
        }),
        tcTv: new CheckboxWidget({ required: false, label: `doesHeatPumpPrepareHotWater` }),
        zTv: new InputWidget(
            {
                label: d => d.uvedeni.os.tcTv.value ? `additionalHotWaterSource` : `mainHotWaterSource`,
                required: d => !d.uvedeni.os.tcTv.value,
            }),
        objemEnOs: newSuitsWidget({ label: `volumeOfExpansionTank` }),
        bazenTc: new CheckboxWidget({ required: false, label: `isPoolHeatingManagedByHeatPump` }),
    },
    reg: {
        nadpis: new TitleWidget({ text: `controlAndElectricalInstallation` }),
        pripojeniKInternetu: new ChooserWidget({
            label: `internetConnection`, options: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ],
        }),
        pospojeni: new CheckboxWidget({ required: false, label: `isElectricalBondingComplete` }),
        spotrebice: new CheckboxWidget({ required: false, label: `areElectricalDevicesTested` }),
        zalZdroj: new CheckboxWidget({
            required: false,
            label: `isBackupPowerSourceInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new TitleWidget({
            text: `primaryCircuit`,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
        typ: new ChooserWidget({
            label: `typeOfPrimaryCircuit`,
            options: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        popis: new InputWidget({
            label: d => {
                switch (d.uvedeni.primar.typ.value) {
                    case (`groundBoreholes`):
                        return `numberAndDepthOfBoreholes`;
                    case (`surfaceCollector`):
                        return `numberAndLengthOfCircuits`;
                    default:
                        return `collectorDescription`;
                }
            },
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new InputWidget({
            label: `typeOfAntifreezeMixture`,
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new ChooserWidget({
            label: `onPrimaryCircuitInstalled`,
            options: [`expansionTankInstalled`, `bufferTankInstalled`],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        kontrola: new CheckboxWidget({
            required: false,
            label: `wasPrimaryCircuitTested`,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: `commissioningSteps` }),
        tc: new CheckboxWidget({ required: false, label: `wasInstallationAccordingToManual` }),
        reg: new CheckboxWidget({ required: false, label: `wasControllerSetToParameters` }),
        vlastnik: new CheckboxWidget({ required: false, label: `wasOwnerFamiliarizedWithFunction` }),
        typZaruky: new ChooserWidget({
            label: `isExtendedWarrantyDesired`, options: [`no`, `yes`],
        }),
        zaruka: new CheckboxWidget({
            required: false, label: `isInstallationInWarrantyConditions`,
            show: d => d.uvedeni.uvadeni.typZaruky.value == 'yes',
        }),
        date: new InputWidget({ label: 'dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});