import { type GetOrVal, Nadpisova, Pisatkova, Prepinatkova, Vybiratkova, Zaskrtavatkova } from '../Vec.svelte.js';
import { uvestTCDoProvozu } from '$lib/client/firestore';
import type { FormInfo } from './forms.svelte.js';
import type { Raw } from '$lib/forms/Form';
import type { Data } from './Data';

export type UDTC = {
    uvedeni: UvedeniTC,
    evidence: Raw<Data>,
}

export class Vyhovuje<D> extends Prepinatkova<D> {
    constructor(args: {
        nazev: GetOrVal<D>,
        onError?: GetOrVal<D>,
        nutne?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
        vybrano?: boolean,
    }) {
        super({
            vybrano: args.vybrano ?? false,
            required: args.nutne ?? false,
            ...args,
            moznosti: [`suitsNot`, `suits`] as const,
            hasPositivity: true,
        });
    }
}

export type UvedeniTC = {
    tc: {
        nadpis: Nadpisova<UDTC>,
        jisticTC: Vyhovuje<UDTC>,
        jisticVJ: Vyhovuje<UDTC>,
        vzdalenostZdi: Vyhovuje<UDTC>,
        kondenzator: Zaskrtavatkova<UDTC>,
        filtr: Zaskrtavatkova<UDTC>,
    },
    nadrze: {
        nadpis: Nadpisova<UDTC>,
        akumulacka: Pisatkova<UDTC>,
        zasobnik: Pisatkova<UDTC>,
    },
    os: {
        nadpis: Nadpisova<UDTC>,
        tvori: Vybiratkova<UDTC>,
        popis: Pisatkova<UDTC>,
        dzTop: Zaskrtavatkova<UDTC>,
        typDzTop: Pisatkova<UDTC>,
        tcTv: Zaskrtavatkova<UDTC>,
        zTv: Pisatkova<UDTC>,
        objemEnOs: Vyhovuje<UDTC>,
        bazenTc: Zaskrtavatkova<UDTC>,
    },
    reg: {
        nadpis: Nadpisova<UDTC>,
        pripojeniKInternetu: Vybiratkova<UDTC>,
        pospojeni: Zaskrtavatkova<UDTC>,
        spotrebice: Zaskrtavatkova<UDTC>,
        zalZdroj: Zaskrtavatkova<UDTC>,
    },
    primar: {
        nadpis: Nadpisova<UDTC>,
        typ: Vybiratkova<UDTC>,
        popis: Pisatkova<UDTC>,
        nemrz: Pisatkova<UDTC>
        nadoba: Vybiratkova<UDTC>,
        kontrola: Zaskrtavatkova<UDTC>,
    },
    uvadeni: {
        nadpis: Nadpisova<UDTC>,
        tc: Zaskrtavatkova<UDTC>,
        reg: Zaskrtavatkova<UDTC>,
        vlastnik: Zaskrtavatkova<UDTC>,
        typZaruky: Vybiratkova<UDTC>,
        zaruka: Zaskrtavatkova<UDTC>,
        date: Pisatkova<UDTC>,
    },
}

export const defaultUvedeniTC = (): UvedeniTC => ({
    tc: {
        nadpis: new Nadpisova({ nazev: `heatPump` }),
        jisticTC: new Vyhovuje({ nazev: `characteristicsAndSizeOfHeatPumpBreaker` }),
        jisticVJ: new Vyhovuje({ zobrazit: d => d.evidence.ir.typ.first!.includes('BOX'), nazev: `characteristicsAndSizeOfIndoorUnitBreaker` }),
        vzdalenostZdi: new Vyhovuje({ nazev: `distanceFromWall`, zobrazit: d => d.evidence.tc.typ == `airToWater` }),
        kondenzator: new Zaskrtavatkova({
            required: false,
            nazev: `isCompensatorInstalled`,
            zobrazit: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new Zaskrtavatkova({ required: false, nazev: `isCirculationPumpFilterInstalled` }),
    },
    nadrze: {
        nadpis: new Nadpisova({ nazev: `tanks` }),
        akumulacka: new Pisatkova({ nazev: `typeOfAccumulationTank`, required: false }),
        zasobnik: new Pisatkova({ nazev: `typeOfStorageTank`, required: false }),
    },
    os: {
        nadpis: new Nadpisova({ nazev: `heatingSystem` }),
        tvori: new Vybiratkova({
            nazev: `heatingSystemConsistsOf`, moznosti: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ],
        }),
        popis: new Pisatkova({
            nazev: `heatingSystemDescription`,
            zobrazit: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
            required: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
        }),
        dzTop: new Zaskrtavatkova({ required: false, nazev: `isAdditionalHeatingSourceConnected` }),
        typDzTop: new Pisatkova({
            nazev: `typeAndPowerOfAdditionalHeatingSource`,
            zobrazit: d => d.uvedeni.os.dzTop.value,
            required: d => d.uvedeni.os.dzTop.value
        }),
        tcTv: new Zaskrtavatkova({ required: false, nazev: `doesHeatPumpPrepareHotWater` }),
        zTv: new Pisatkova(
            { nazev: d => d.uvedeni.os.tcTv.value ? `additionalHotWaterSource` : `mainHotWaterSource`, required: d => !d.uvedeni.os.tcTv.value }),
        objemEnOs: new Vyhovuje({ nazev: `volumeOfExpansionTank` }),
        bazenTc: new Zaskrtavatkova({ required: false, nazev: `isPoolHeatingManagedByHeatPump` }),
    },
    reg: {
        nadpis: new Nadpisova({ nazev: `controlAndElectricalInstallation` }),
        pripojeniKInternetu: new Vybiratkova({
            nazev: `internetConnection`, moznosti: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ],
        }),
        pospojeni: new Zaskrtavatkova({ required: false, nazev: `isElectricalBondingComplete` }),
        spotrebice: new Zaskrtavatkova({ required: false, nazev: `areElectricalDevicesTested` }),
        zalZdroj: new Zaskrtavatkova({
            required: false,
            nazev: `isBackupPowerSourceInstalled`,
            zobrazit: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new Nadpisova({
            nazev: `primaryCircuit`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
        }),
        typ: new Vybiratkova({
            nazev: `typeOfPrimaryCircuit`,
            moznosti: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ],
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        popis: new Pisatkova({
            nazev: d => {
                switch (d.uvedeni.primar.typ.value) {
                    case (`groundBoreholes`):
                        return `numberAndDepthOfBoreholes`;
                    case (`surfaceCollector`):
                        return `numberAndLengthOfCircuits`;
                    default:
                        return `collectorDescription`;
                }
            },
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new Pisatkova({
            nazev: `typeOfAntifreezeMixture`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new Vybiratkova({
            nazev: `onPrimaryCircuitInstalled`,
            moznosti: [`expansionTankInstalled`, `bufferTankInstalled`],
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        kontrola: new Zaskrtavatkova({
            required: false,
            nazev: `wasPrimaryCircuitTested`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new Nadpisova({ nazev: `commissioningSteps` }),
        tc: new Zaskrtavatkova({ required: false, nazev: `wasInstallationAccordingToManual` }),
        reg: new Zaskrtavatkova({ required: false, nazev: `wasControllerSetToParameters` }),
        vlastnik: new Zaskrtavatkova({ required: false, nazev: `wasOwnerFamiliarizedWithFunction` }),
        typZaruky: new Vybiratkova({
            nazev: `isExtendedWarrantyDesired`, moznosti: [`no`, `yes`]
        }),
        zaruka: new Zaskrtavatkova({
            required: false, nazev: `isInstallationInWarrantyConditions`,
            zobrazit: d => d.uvedeni.uvadeni.typZaruky.value == 'yes'
        }),
        date: new Pisatkova({ nazev: 'dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
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