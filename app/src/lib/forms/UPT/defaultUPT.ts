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
    options: [`tc.suitsNot`, `tc.suits`] as const,
    hasPositivity: true,
});

export default (): FormUPT => ({
    tc: {
        nadpis: new TitleWidget({ text: `in.heatPump` }),
        jisticTC: newSuitsWidget({ label: `tc.characteristicsAndSizeOfHeatPumpBreaker` }),
        jisticVJ: newSuitsWidget({
            show: d => d.evidence.ir.typ.first!.includes('BOX'),
            label: `tc.characteristicsAndSizeOfIndoorUnitBreaker`,
        }),
        vzdalenostZdi: newSuitsWidget({ label: `tc.distanceFromWall`, show: d => d.evidence.tc.typ == `airToWater` }),
        kondenzator: new CheckboxWidget({
            required: false,
            label: `tc.isCompensatorInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new CheckboxWidget({ required: false, label: `tc.isCirculationPumpFilterInstalled` }),
    },
    nadrze: {
        nadpis: new TitleWidget({ text: `tc.tanks` }),
        akumulacka: new InputWidget({ label: `tc.typeOfAccumulationTank`, required: false }),
        zasobnik: new InputWidget({ label: `tc.typeOfStorageTank`, required: false }),
    },
    os: {
        nadpis: new TitleWidget({ text: `tc.heatingSystem` }),
        tvori: new ChooserWidget({
            label: `tc.heatingSystemConsistsOf`, options: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ],
        }),
        popis: new InputWidget({
            label: `tc.heatingSystemDescription`,
            show: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
            required: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
        }),
        dzTop: new CheckboxWidget({ required: false, label: `tc.isAdditionalHeatingSourceConnected` }),
        typDzTop: new InputWidget({
            label: `tc.typeAndPowerOfAdditionalHeatingSource`,
            show: d => d.uvedeni.os.dzTop.value,
            required: d => d.uvedeni.os.dzTop.value,
        }),
        tcTv: new CheckboxWidget({ required: false, label: `tc.doesHeatPumpPrepareHotWater` }),
        zTv: new InputWidget(
            {
                label: d => d.uvedeni.os.tcTv.value ? `tc.additionalHotWaterSource` : `tc.mainHotWaterSource`,
                required: d => !d.uvedeni.os.tcTv.value,
            }),
        objemEnOs: newSuitsWidget({ label: `tc.volumeOfExpansionTankOfHeatingSystem` }),
        tlakEnOs: new InputWidget({ label: `tc.pressureOfExpansionTankOfHeatingSystem` }),
        tlakOs: new InputWidget({ label: `tc.pressureOfHeatingSystem` }),
        tlakEnTv: new InputWidget({ label: `tc.pressureOfExpansionTankForWater` }),
        bazenTc: new CheckboxWidget({ required: false, label: `tc.isPoolHeatingManagedByHeatPump` }),
    },
    reg: {
        nadpis: new TitleWidget({ text: `tc.controlAndElectricalInstallation` }),
        pripojeniKInternetu: new ChooserWidget({
            label: `tc.internetConnection`, options: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ],
        }),
        pospojeni: new CheckboxWidget({ required: false, label: `tc.isElectricalBondingComplete` }),
        spotrebice: new CheckboxWidget({ required: false, label: `tc.areElectricalDevicesTested` }),
        zalZdroj: new CheckboxWidget({
            required: false,
            label: `tc.isBackupPowerSourceInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new TitleWidget({
            text: `tc.primaryCircuit`,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
        typ: new ChooserWidget({
            label: `tc.typeOfPrimaryCircuit`,
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
                        return `tc.numberAndDepthOfBoreholes`;
                    case (`surfaceCollector`):
                        return `tc.numberAndLengthOfCircuits`;
                    default:
                        return `tc.collectorDescription`;
                }
            },
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new InputWidget({
            label: `tc.typeOfAntifreezeMixture`,
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new ChooserWidget({
            label: `tc.onPrimaryCircuitInstalled`,
            options: [`expansionTankInstalled`, `bufferTankInstalled`],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        kontrola: new CheckboxWidget({
            required: false,
            label: `tc.wasPrimaryCircuitTested`,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: `tc.commissioningSteps` }),
        tc: new CheckboxWidget({ required: false, label: `tc.wasInstallationAccordingToManual` }),
        reg: new CheckboxWidget({ required: false, label: `tc.wasControllerSetToParameters` }),
        vlastnik: new CheckboxWidget({ required: false, label: `tc.wasOwnerFamiliarizedWithFunction` }),
        typZaruky: new ChooserWidget({
            label: `tc.isExtendedWarrantyDesired`, options: [`no`, `yes`],
        }),
        zaruka: new CheckboxWidget({
            required: false, label: `tc.isInstallationInWarrantyConditions`,
            show: d => d.uvedeni.uvadeni.typZaruky.value == 'yes',
        }),
        date: new InputWidget({ label: 'tc.dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});