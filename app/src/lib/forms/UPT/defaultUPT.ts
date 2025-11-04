import {
    CheckboxWidget,
    ChooserWidget, type GetBOrVal,
    type GetTOrVal,
    InputWidget,
    SwitchWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { defaultDK } from '$lib/forms/DK/formDK';

const newSuitsWidget = <D>(args: {
    label: GetTOrVal<D>,
    onError?: GetTOrVal<D>,
    required?: GetBOrVal<D>,
    show?: GetBOrVal<D>,
    chosen?: boolean,
}) => new SwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: t => [t.tc.suitsNot, t.tc.suits] as const,
    hasPositivity: true,
});

export default (): FormUPT => ({
    tc: {
        nadpisSystem: new TitleWidget({ text: t => t.in.system, level: 2 }),
        nadpis: new TitleWidget({ text: t => t.in.device.heatPump, level: 3 }),
        jisticTC: newSuitsWidget({ label: t => t.tc.characteristicsAndSizeOfHeatPumpBreaker }),
        jisticVJ: newSuitsWidget({
            show: d => d.evidence.ir.typ.first!.includes('BOX'),
            label: t => t.tc.characteristicsAndSizeOfIndoorUnitBreaker,
        }),
        vzdalenostZdi: newSuitsWidget({ label: t => t.tc.distanceFromWall, show: d => d.evidence.tc.typ == `airToWater` }),
        kondenzator: new CheckboxWidget({
            required: false,
            label: t => t.tc.isCompensatorInstalled,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new CheckboxWidget({ required: false, label: t => t.tc.isCirculationPumpFilterInstalled }),
    },
    nadrze: {
        nadpis: new TitleWidget({ text: t => t.tc.tanks, level: 3 }),
        akumulacka: new InputWidget({ label: t => t.tc.typeOfAccumulationTank, required: false }),
        zasobnik: new InputWidget({ label: t => t.tc.typeOfStorageTank, required: false }),
    },
    os: {
        nadpis: new TitleWidget({ text: t => t.tc.heatingSystem, level: 3 }),
        tvori: new ChooserWidget({
            label: t => t.tc.heatingSystemConsistsOf, options: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ], labels: t => t.tc,
        }),
        popis: new InputWidget({
            label: t => t.tc.heatingSystemDescription,
            show: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
            required: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
        }),
        dzTop: new CheckboxWidget({ required: false, label: t => t.tc.isAdditionalHeatingSourceConnected }),
        typDzTop: new InputWidget({
            label: t => t.tc.typeAndPowerOfAdditionalHeatingSource,
            show: d => d.uvedeni.os.dzTop.value,
            required: d => d.uvedeni.os.dzTop.value,
        }),
        tcTv: new CheckboxWidget({ required: false, label: t => t.tc.doesHeatPumpPrepareHotWater }),
        zTv: new InputWidget(
            {
                label: (t, d) => d.uvedeni.os.tcTv.value ? t.tc.additionalHotWaterSource : t.tc.mainHotWaterSource,
                required: d => !d.uvedeni.os.tcTv.value,
            }),
        objemEnOs: newSuitsWidget({ label: t => t.tc.volumeOfExpansionTankOfHeatingSystem }),
        tlakEnOs: new InputWidget({ label: t => t.tc.pressureOfExpansionTankOfHeatingSystem }),
        tlakOs: new InputWidget({ label: t => t.tc.pressureOfHeatingSystem }),
        tlakEnTv: new InputWidget({ label: t => t.tc.pressureOfExpansionTankForWater }),
        bazenTc: new CheckboxWidget({ required: false, label: t => t.tc.isPoolHeatingManagedByHeatPump }),
    },
    reg: {
        nadpis: new TitleWidget({ text: t => t.tc.controlAndElectricalInstallation, level: 3 }),
        pripojeniKInternetu: new ChooserWidget({
            label: t => t.tc.internetConnection, options: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ], labels: t => t.tc,
        }),
        pospojeni: new CheckboxWidget({ required: false, label: t => t.tc.isElectricalBondingComplete }),
        spotrebice: new CheckboxWidget({ required: false, label: t => t.tc.areElectricalDevicesTested }),
        zalZdroj: new CheckboxWidget({
            required: false,
            label: t => t.tc.isBackupPowerSourceInstalled,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new TitleWidget({
            text: t => t.tc.primaryCircuit,
            show: d => d.evidence.tc.typ == 'groundToWater',
            level: 3,
        }),
        typ: new ChooserWidget({
            label: t => t.tc.typeOfPrimaryCircuit,
            options: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ], labels: t => t.tc,
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        popis: new InputWidget({
            label: (t, d) => ({
                groundBoreholes: t.tc.numberAndDepthOfBoreholes,
                surfaceCollector: t.tc.numberAndLengthOfCircuits,
                otherCollector: t.tc.collectorDescription,
            })[d.uvedeni.primar.typ.value!],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new InputWidget({
            label: t => t.tc.typeOfAntifreezeMixture,
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new ChooserWidget({
            label: t => t.tc.onPrimaryCircuitInstalled,
            options: [`expansionTankInstalled`, `bufferTankInstalled`],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
            labels: t => t.tc,
        }),
        kontrola: new CheckboxWidget({
            required: false,
            label: t => t.tc.wasPrimaryCircuitTested,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: t => t.tc.commissioningSteps, level: 2 }),
        tc: new CheckboxWidget({ required: false, label: t => t.tc.wasInstallationAccordingToManual }),
        reg: new CheckboxWidget({ required: false, label: t => t.tc.wasControllerSetToParameters }),
        vlastnik: new CheckboxWidget({ required: false, label: t => t.tc.wasOwnerFamiliarizedWithFunction }),
        typZaruky: new ChooserWidget({
            label: t => t.tc.isExtendedWarrantyDesired, options: [`no`, `yes`], labels: t => t.tc,
        }),
        zaruka: new CheckboxWidget({
            required: false, label: t => t.tc.isInstallationInWarrantyConditions,
            show: d => d.uvedeni.uvadeni.typZaruky.value == 'yes',
        }),
        date: new InputWidget({ label: t => t.tc.dateOfCommission, type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
    checkRecommendations: defaultDK('TC'),
});