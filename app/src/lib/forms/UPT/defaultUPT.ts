import {
    type GetBOrVal,
    type GetTOrVal,
    newCheckboxWidget,
    newChooserWidget, newInlinePdfPreviewWidget,
    newInputWidget,
    newRadioWidget,
    newSwitchWidget,
    newTextWidget,
    newTitleWidget,
} from '$lib/forms/Widget';
import type { ContextUPT, FormUPT } from '$lib/forms/UPT/formUPT';
import { defaultDK } from '$lib/forms/DK/formDK';
import type { ExistingIR, IR } from '$lib/data';
import { dayISO } from '$lib/helpers/date';
import { type Form, type FormPlus, valuesToRawData } from '$lib/forms/Form';
import { isNewWarranties } from '$lib/helpers/prices';

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

const nw = (c: ContextUPT) => isNewWarranties(c.UP.tc.date);
const ow = (c: ContextUPT) => !isNewWarranties(c.UP.tc.date);
const agrees = (c: ContextUPT) => c.UP.reg.souhlasSPristupem;
const atw = (c: ContextUPT) => c.IN.tc.typ == 'airToWater';
const gtw = (c: ContextUPT) => c.IN.tc.typ == 'groundToWater';
const no10 = (c: ContextUPT) => c.UP.uvadeni.fullPaidWarranty == 'no' || c.UP.uvadeni.fullPaidWarranty == 'unsure';
const connected = (c: ContextUPT) => c.UP.reg.pripojeniKInternetu == 'connectedViaRegulusRoute' || c.UP.reg.pripojeniKInternetu == 'connectedWithPublicIpAddress';

export default (ir: IR): FormPlus<FormUPT> => ({
    tc: {
        date: newInputWidget<ContextUPT, true>({
            label: t => t.tc.dateOfCommission, type: 'date', hideInRawData: true,
            text: ir.UP.dateTC || dayISO(), onValueSet: (c, date) => {
                c.DK.commissionDate = date;
                c.UP.checkRecommendations.commissionDate = date;
            },
        }),
        nadpisSystem: newTitleWidget({ text: t => t.in.system, level: 2 }),
        nadpis: newTitleWidget({ text: t => t.in.device.heatPump, level: 3 }),
        jisticTC: newSuitsWidget({ label: t => t.tc.characteristicsAndSizeOfHeatPumpBreaker }),
        jisticVJ: newSuitsWidget({
            show: c => c.IN.ir.typ.first!.includes('BOX'),
            label: t => t.tc.characteristicsAndSizeOfIndoorUnitBreaker,
        }),
        vzdalenostZdi: newSuitsWidget({ label: t => t.tc.distanceFromWall, show: atw }),
        kondenzator: newCheckboxWidget({
            required: false, label: t => t.tc.isCompensatorInstalled, show: atw,
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
        tlakEnOs: newInputWidget({
            label: t => t.tc.pressureOfExpansionTankOfHeatingSystem, type: 'number', suffix: t => t.units.bar, compact: true,
        }),
        tlakOs: newInputWidget({
            label: t => t.tc.pressureOfHeatingSystem, type: 'number', suffix: t => t.units.bar, compact: true,
        }),
        tlakEnTv: newInputWidget({
            label: t => t.tc.pressureOfExpansionTankForWater, type: 'number', suffix: t => t.units.bar, compact: true,
        }),
        prutokTcTopeni: newInputWidget({ // only new
            label: t => t.tc.heatPumpFlowRateHeating, compact: true,
            type: 'number', suffix: t => t.units.lPerH, required: c => atw(c) && nw(c), show: c => atw(c) && nw(c),
        }),
        prutokTcTepleVody: newInputWidget({ // only new
            label: t => t.tc.heatPumpFlowRateHotWater, compact: true,
            type: 'number', suffix: t => t.units.lPerH, required: false, show: c => atw(c) && nw(c),
        }),
        prutokTcChlazeni: newInputWidget({ // only new
            label: t => t.tc.heatPumpFlowRateCooling, compact: true,
            type: 'number', suffix: t => t.units.lPerH, required: false, show: c => atw(c) && nw(c),
        }),
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
        ipAdresa: newInputWidget({
            label: t => t.tc.publicIpAddress, show: c => c.UP.reg.pripojeniKInternetu == 'connectedWithPublicIpAddress',
            regex: /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(([0-9a-fA-F]{4}:){7}[0-9a-fA-F]{4})$/, onError: t => t.wrong.ip,
        }),
        souhlasSPristupem: newCheckboxWidget({
            label: t => t.tc.remoteAccessAgreement, required: false, show: connected,
        }),
        _varovaniNesouhlasi: newTextWidget<ContextUPT>({
            text: t => t.tc.remoteAccessWarning, show: c => !agrees(c) && connected(c),
        }),
        pospojeni: newCheckboxWidget({ required: false, label: t => t.tc.isElectricalBondingComplete }),
        spotrebice: newCheckboxWidget({ required: false, label: t => t.tc.areElectricalDevicesTested }),
        zalZdroj: newCheckboxWidget({
            required: false, label: t => t.tc.isBackupPowerSourceInstalled, show: atw,
        }),
    },
    primar: {
        nadpis: newTitleWidget({
            text: t => t.tc.primaryCircuit, show: gtw, level: 3,
        }),
        typ: newChooserWidget({
            label: t => t.tc.typeOfPrimaryCircuit,
            options: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ], labels: t => t.tc, show: gtw, required: gtw,
        }),
        popis: newInputWidget({
            label: (t, c) => ({
                groundBoreholes: t.tc.numberAndDepthOfBoreholes,
                surfaceCollector: t.tc.numberAndLengthOfCircuits,
                otherCollector: t.tc.collectorDescription,
            })[c.UP.primar.typ!], show: gtw,
            required: c => gtw(c) && c.UP.primar.typ != null,
        }),
        nemrz: newInputWidget({
            label: t => t.tc.typeOfAntifreezeMixture, show: gtw, required: gtw,
        }),
        nadoba: newChooserWidget({
            label: t => t.tc.onPrimaryCircuitInstalled,
            options: [`expansionTankInstalled`, `bufferTankInstalled`],
            show: gtw, required: gtw, labels: t => t.tc,
        }),
        kontrola: newCheckboxWidget({
            required: false, label: t => t.tc.wasPrimaryCircuitTested, show: gtw,
        }),
    },
    uvadeni: {
        nadpis: newTitleWidget({ text: t => t.tc.commissioningSteps, level: 2 }),
        tc: newCheckboxWidget({ required: false, label: t => t.tc.wasInstallationAccordingToManual }),
        reg: newCheckboxWidget({ required: false, label: t => t.tc.wasControllerSetToParameters }),
        vlastnik: newCheckboxWidget({ required: false, label: t => t.tc.wasOwnerFamiliarizedWithFunction }),
        typZaruky: newRadioWidget({ // legacy
            label: t => t.tc.isExtendedWarrantyDesired, options: [`no`, `yes`], labels: t => t.tc,
            required: false, show: c => ow(c) && agrees(c),
        }),
        fullPaidWarranty: newRadioWidget({ // only new
            label: t => t.tc.isFullPaidWarrantyDesired, options: [`yes`, `unsure`, `no`], labels: t => t.tc,
            show: c => nw(c) && agrees(c),
            required: c => nw(c) && agrees(c),
        }),
        compressorWarranty: newRadioWidget({ // only new
            label: t => t.tc.isCompressorWarrantyDesired, options: [`yes`, `no`], labels: t => t.tc,
            show: no10, required: no10,
        }),
        zaruka: newCheckboxWidget({ // legacy
            required: false, label: t => t.tc.isInstallationInWarrantyConditions,
            show: c => c.UP.uvadeni.typZaruky == 'yes',
        }),
        note: newInputWidget({ label: t => t.in.note, required: false }),
        _title: newTitleWidget({
            text: t => t.pdf.documentPreview, showInXML: false, level: 2,
        }),
        preview: newInlinePdfPreviewWidget({
            pdfData: (_, c) => ({
                type: nw(c) ? 'UPT' : 'UPTL',
                data: {
                    ...c.ir as ExistingIR,
                    UP: {
                        ...c.ir.UP,
                        TC: valuesToRawData(c.form, c.UP),
                        dateTC: c.UP.tc.date,
                    },
                },
                form: (c.form as Form).omit('checkRecommendations') as FormUPT,
                values: c.UP,
                pages: [0],
            }),
        }),
    },
    checkRecommendations: defaultDK('TČ', ir.UP.dateTC, ir.RK.DK.TC, true),
});