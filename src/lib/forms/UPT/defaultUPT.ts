import {
    newSwitchWidget,
    newTitleWidget,
    type GetBOrVal,
    type GetTOrVal, newCheckboxWidget, newChooserWidget,
    newInputWidget,
} from '$lib/forms/Widget';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import { defaultDK } from '$lib/forms/DK/formDK';
import type { IR } from '$lib/data';
import { dayISO } from '$lib/helpers/date';

const newSuitsWidget = <D>(args: {
    label: GetTOrVal<D>,
    onError?: GetTOrVal<D>,
    required?: GetBOrVal<D>,
    show?: GetBOrVal<D>,
    chosen?: boolean,
}) => newSwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: t => [t.tc.suitsNot, t.tc.suits] as const,
    hasPositivity: true,
});

export default (ir: IR): FormUPT => ({
    tc: {
        nadpisSystem: newTitleWidget({ text: t => t.in.system, level: 2 }),
        nadpis: newTitleWidget({ text: t => t.in.device.heatPump, level: 3 }),
        jisticTC: newSuitsWidget({ label: t => t.tc.characteristicsAndSizeOfHeatPumpBreaker }),
        jisticVJ: newSuitsWidget({
            show: c => c.IN.ir.typ.first!.includes('BOX'),
            label: t => t.tc.characteristicsAndSizeOfIndoorUnitBreaker,
        }),
        vzdalenostZdi: newSuitsWidget({ label: t => t.tc.distanceFromWall, show: c => c.IN.tc.typ == `airToWater` }),
        kondenzator: newCheckboxWidget({
            required: false,
            label: t => t.tc.isCompensatorInstalled,
            show: c => c.IN.tc.typ == `airToWater`,
        }),
        filtr: newCheckboxWidget({ required: false, label: t => t.tc.isCirculationPumpFilterInstalled }),
    },
    os: {
        nadpis: newTitleWidget({ text: t => t.tc.heatingSystem, level: 3 }),
        tvori: newChooserWidget({
            label: t => t.tc.heatingSystemConsistsOf, options: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ], labels: t => t.tc,
        }),
        popis: newInputWidget({
            label: t => t.tc.heatingSystemDescription,
            show: c => c.UP.os.tvori == 'otherHeatingSystem',
            required: c => c.UP.os.tvori == 'otherHeatingSystem',
        }),
        dzTop: newCheckboxWidget({ required: false, label: t => t.tc.isAdditionalHeatingSourceConnected }),
        typDzTop: newInputWidget({
            label: t => t.tc.typeAndPowerOfAdditionalHeatingSource,
            show: c => c.UP.os.dzTop,
            required: c => c.UP.os.dzTop,
        }),
        tcTv: newCheckboxWidget({ required: false, label: t => t.tc.doesHeatPumpPrepareHotWater }),
        zTv: newInputWidget(
            {
                label: (t, c) => c.UP.os.tcTv ? t.tc.additionalHotWaterSource : t.tc.mainHotWaterSource,
                required: c => !c.UP.os.tcTv,
            }),
        objemEnOs: newSuitsWidget({ label: t => t.tc.volumeOfExpansionTankOfHeatingSystem }),
        tlakEnOs: newInputWidget({ label: t => t.tc.pressureOfExpansionTankOfHeatingSystem }),
        tlakOs: newInputWidget({ label: t => t.tc.pressureOfHeatingSystem }),
        tlakEnTv: newInputWidget({ label: t => t.tc.pressureOfExpansionTankForWater }),
        bazenTc: newCheckboxWidget({ required: false, label: t => t.tc.isPoolHeatingManagedByHeatPump }),
    },
    reg: {
        nadpis: newTitleWidget({ text: t => t.tc.controlAndElectricalInstallation, level: 3 }),
        pripojeniKInternetu: newChooserWidget({
            label: t => t.tc.internetConnection, options: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ], labels: t => t.tc,
        }),
        pospojeni: newCheckboxWidget({ required: false, label: t => t.tc.isElectricalBondingComplete }),
        spotrebice: newCheckboxWidget({ required: false, label: t => t.tc.areElectricalDevicesTested }),
        zalZdroj: newCheckboxWidget({
            required: false,
            label: t => t.tc.isBackupPowerSourceInstalled,
            show: c => c.IN.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: newTitleWidget({
            text: t => t.tc.primaryCircuit,
            show: c => c.IN.tc.typ == 'groundToWater',
            level: 3,
        }),
        typ: newChooserWidget({
            label: t => t.tc.typeOfPrimaryCircuit,
            options: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ], labels: t => t.tc,
            show: c => c.IN.tc.typ == 'groundToWater',
            required: c => c.IN.tc.typ == 'groundToWater',
        }),
        popis: newInputWidget({
            label: (t, c) => ({
                groundBoreholes: t.tc.numberAndDepthOfBoreholes,
                surfaceCollector: t.tc.numberAndLengthOfCircuits,
                otherCollector: t.tc.collectorDescription,
            })[c.UP.primar.typ!],
            show: c => c.IN.tc.typ == 'groundToWater',
            required: c => c.IN.tc.typ == 'groundToWater' && c.UP.primar.typ != null,
        }),
        nemrz: newInputWidget({
            label: t => t.tc.typeOfAntifreezeMixture,
            show: c => c.IN.tc.typ == 'groundToWater',
            required: c => c.IN.tc.typ == 'groundToWater',
        }),
        nadoba: newChooserWidget({
            label: t => t.tc.onPrimaryCircuitInstalled,
            options: [`expansionTankInstalled`, `bufferTankInstalled`],
            show: c => c.IN.tc.typ == 'groundToWater',
            required: c => c.IN.tc.typ == 'groundToWater',
            labels: t => t.tc,
        }),
        kontrola: newCheckboxWidget({
            required: false,
            label: t => t.tc.wasPrimaryCircuitTested,
            show: c => c.IN.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: newTitleWidget({ text: t => t.tc.commissioningSteps, level: 2 }),
        tc: newCheckboxWidget({ required: false, label: t => t.tc.wasInstallationAccordingToManual }),
        reg: newCheckboxWidget({ required: false, label: t => t.tc.wasControllerSetToParameters }),
        vlastnik: newCheckboxWidget({ required: false, label: t => t.tc.wasOwnerFamiliarizedWithFunction }),
        typZaruky: newChooserWidget({
            label: t => t.tc.isExtendedWarrantyDesired, options: [`no`, `yes`], labels: t => t.tc,
        }),
        zaruka: newCheckboxWidget({
            required: false, label: t => t.tc.isInstallationInWarrantyConditions,
            show: c => c.UP.uvadeni.typZaruky == 'yes',
        }),
        date: newInputWidget({
            label: t => t.tc.dateOfCommission, type: 'date', hideInRawData: true,
            text: ir.UP.dateTC || dayISO(), onValueSet: (c, date) => {
                c.DK.commissionDate = date;
            },
        }),
        note: newInputWidget({ label: t => t.in.note, required: false }),
    },
    checkRecommendations: defaultDK('TČ', ir.UP.dateTC, ir.RK.DK.TC, true),
});