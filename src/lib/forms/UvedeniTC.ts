import { type GetOrVal, TitleWidget, InputWidget, SwitchWidget, ChooserWidget, CheckboxWidget } from '../Widget.svelte.js';
import { uvestTCDoProvozu } from '$lib/client/firestore';
import type { FormInfo } from './forms.svelte.js';
import type { Raw } from '$lib/forms/Form';
import type { Data } from './Data';

export type UDTC = {
    uvedeni: UvedeniTC,
    evidence: Raw<Data>,
}

export class Vyhovuje<D> extends SwitchWidget<D> {
    constructor(args: {
        label: GetOrVal<D>,
        onError?: GetOrVal<D>,
        required?: GetOrVal<D, boolean>,
        show?: GetOrVal<D, boolean>,
        chosen?: boolean,
    }) {
        super({
            chosen: args.chosen ?? false,
            required: args.required ?? false,
            ...args,
            options: [`suitsNot`, `suits`] as const,
            hasPositivity: true,
        });
    }
}

export type UvedeniTC = {
    tc: {
        nadpis: TitleWidget<UDTC>,
        jisticTC: Vyhovuje<UDTC>,
        jisticVJ: Vyhovuje<UDTC>,
        vzdalenostZdi: Vyhovuje<UDTC>,
        kondenzator: CheckboxWidget<UDTC>,
        filtr: CheckboxWidget<UDTC>,
    },
    nadrze: {
        nadpis: TitleWidget<UDTC>,
        akumulacka: InputWidget<UDTC>,
        zasobnik: InputWidget<UDTC>,
    },
    os: {
        nadpis: TitleWidget<UDTC>,
        tvori: ChooserWidget<UDTC>,
        popis: InputWidget<UDTC>,
        dzTop: CheckboxWidget<UDTC>,
        typDzTop: InputWidget<UDTC>,
        tcTv: CheckboxWidget<UDTC>,
        zTv: InputWidget<UDTC>,
        objemEnOs: Vyhovuje<UDTC>,
        bazenTc: CheckboxWidget<UDTC>,
    },
    reg: {
        nadpis: TitleWidget<UDTC>,
        pripojeniKInternetu: ChooserWidget<UDTC>,
        pospojeni: CheckboxWidget<UDTC>,
        spotrebice: CheckboxWidget<UDTC>,
        zalZdroj: CheckboxWidget<UDTC>,
    },
    primar: {
        nadpis: TitleWidget<UDTC>,
        typ: ChooserWidget<UDTC>,
        popis: InputWidget<UDTC>,
        nemrz: InputWidget<UDTC>
        nadoba: ChooserWidget<UDTC>,
        kontrola: CheckboxWidget<UDTC>,
    },
    uvadeni: {
        nadpis: TitleWidget<UDTC>,
        tc: CheckboxWidget<UDTC>,
        reg: CheckboxWidget<UDTC>,
        vlastnik: CheckboxWidget<UDTC>,
        typZaruky: ChooserWidget<UDTC>,
        zaruka: CheckboxWidget<UDTC>,
        date: InputWidget<UDTC>,
    },
}

export const defaultUvedeniTC = (): UvedeniTC => ({
    tc: {
        nadpis: new TitleWidget({ label: `heatPump` }),
        jisticTC: new Vyhovuje({ label: `characteristicsAndSizeOfHeatPumpBreaker` }),
        jisticVJ: new Vyhovuje({ show: d => d.evidence.ir.typ.first!.includes('BOX'), label: `characteristicsAndSizeOfIndoorUnitBreaker` }),
        vzdalenostZdi: new Vyhovuje({ label: `distanceFromWall`, show: d => d.evidence.tc.typ == `airToWater` }),
        kondenzator: new CheckboxWidget({
            required: false,
            label: `isCompensatorInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new CheckboxWidget({ required: false, label: `isCirculationPumpFilterInstalled` }),
    },
    nadrze: {
        nadpis: new TitleWidget({ label: `tanks` }),
        akumulacka: new InputWidget({ label: `typeOfAccumulationTank`, required: false }),
        zasobnik: new InputWidget({ label: `typeOfStorageTank`, required: false }),
    },
    os: {
        nadpis: new TitleWidget({ label: `heatingSystem` }),
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
            required: d => d.uvedeni.os.dzTop.value
        }),
        tcTv: new CheckboxWidget({ required: false, label: `doesHeatPumpPrepareHotWater` }),
        zTv: new InputWidget(
            { label: d => d.uvedeni.os.tcTv.value ? `additionalHotWaterSource` : `mainHotWaterSource`, required: d => !d.uvedeni.os.tcTv.value }),
        objemEnOs: new Vyhovuje({ label: `volumeOfExpansionTank` }),
        bazenTc: new CheckboxWidget({ required: false, label: `isPoolHeatingManagedByHeatPump` }),
    },
    reg: {
        nadpis: new TitleWidget({ label: `controlAndElectricalInstallation` }),
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
            label: `primaryCircuit`,
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
        nadpis: new TitleWidget({ label: `commissioningSteps` }),
        tc: new CheckboxWidget({ required: false, label: `wasInstallationAccordingToManual` }),
        reg: new CheckboxWidget({ required: false, label: `wasControllerSetToParameters` }),
        vlastnik: new CheckboxWidget({ required: false, label: `wasOwnerFamiliarizedWithFunction` }),
        typZaruky: new ChooserWidget({
            label: `isExtendedWarrantyDesired`, options: [`no`, `yes`]
        }),
        zaruka: new CheckboxWidget({
            required: false, label: `isInstallationInWarrantyConditions`,
            show: d => d.uvedeni.uvadeni.typZaruky.value == 'yes'
        }),
        date: new InputWidget({ label: 'dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});

export const heatPumpCommission: FormInfo<UDTC, UvedeniTC> = ({
    storeName: 'stored_heat_pump_commission',
    defaultData: defaultUvedeniTC,
    pdfLink: 'heatPumpCommissionProtocol',
    saveData: (irid, raw) => uvestTCDoProvozu(irid, raw),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: () => `commissioning`,
});