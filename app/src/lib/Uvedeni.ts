import type { RawData } from "./Data";
import { Nadpisova, p, Pisatkova, Prepinatkova, Vec, Vybiratkova, type GetOrVal, type Raw } from "./Vec";

export type UD = {
    uvedeni: Uvedeni,
    evidence: RawData,
}

export class Vyhovuje extends Prepinatkova<UD> {
    constructor(args: {
        nazev: GetOrVal<UD>,
        onError?: GetOrVal<UD>,
        nutne?: GetOrVal<UD, boolean>,
        zobrazit?: GetOrVal<UD, boolean>,
        vybrano?: boolean,
    }) {
        super({
            vybrano: args.vybrano ?? false,
            nutne: args.nutne ?? false,
            ...args,
            moznosti: [`suitsNot`, `suits`] as const,
        })
    }
}
export class Ano extends Prepinatkova<UD> {
    constructor(args: {
        nazev: GetOrVal<UD>,
        onError?: GetOrVal<UD>,
        nutne?: GetOrVal<UD, boolean>,
        zobrazit?: GetOrVal<UD, boolean>,
        vybrano?: boolean,
    }) {
        super({
            vybrano: args.vybrano ?? false,
            nutne: args.nutne ?? false,
            ...args,
            moznosti: [`no`, `yes`] as const,
        })
    }
}

export type Uvedeni = {
    tc: {
        nadpis: Nadpisova<UD>,
        jisticTC: Vyhovuje,
        jisticVJ: Vyhovuje,
        vzdalenostZdi: Vyhovuje,
        kondenzator: Ano,
        filtr: Ano,
    },
    nadrze: {
        nadpis: Nadpisova<UD>,
        akumulacka: Pisatkova<UD>,
        zasobnik: Pisatkova<UD>,
    },
    os: {
        nadpis: Nadpisova<UD>,
        tvori: Vybiratkova<UD>,
        dzTop: Ano,
        typDzTop: Pisatkova<UD>,
        tcTv: Ano,
        zTv: Pisatkova<UD>,
        objemEnOs: Vyhovuje,
        bazenTc: Ano,
    },
    reg: {
        nadpis: Nadpisova<UD>,
        pripojeniKInternetu: Vybiratkova<UD>,
        pospojeni: Ano,
        spotrebice: Ano,
        zalZdroj: Ano,
    },
    primar: {
        nadpis: Nadpisova<UD>,
        typ: Vybiratkova<UD>,
        popis: Pisatkova<UD>,
        nemrz: Pisatkova<UD>
        nadoba: Vybiratkova<UD>,
        kontrola: Ano,
    },
    uvadeni: {
        nadpis: Nadpisova<UD>,
        tc: Ano,
        reg: Ano,
        vlastnik: Ano,
        typZaruky: Vybiratkova<UD>,
        zaruka: Ano,
    },
}

export const defaultUvedeni = (): Uvedeni => ({
    tc: {
        nadpis: new Nadpisova<UD>({ nazev: `heatPump` }),
        jisticTC: new Vyhovuje({ nazev: `characteristicsAndSizeOfHeatPumpBreaker` }),
        jisticVJ: new Vyhovuje({ nazev: `characteristicsAndSizeOfIndoorUnitBreaker` }),
        vzdalenostZdi: new Vyhovuje({ nazev: `distanceFromWall` }),
        kondenzator: new Ano({
            nazev: `isCompensatorInstalled`,
            zobrazit: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new Ano({ nazev: `isCirculationPumpFilterInstalled` }),
    },
    nadrze: {
        nadpis: new Nadpisova<UD>({ nazev: `tanks` }),
        akumulacka: new Pisatkova<UD>({ nazev: `typeOfAccumulationTank`, nutne: false }),
        zasobnik: new Pisatkova<UD>({ nazev: `typeOfStorageTank`, nutne: false }),
    },
    os: {
        nadpis: new Nadpisova<UD>({ nazev: `heatingSystem` }),
        tvori: new Vybiratkova<UD>({
            nazev: `heatingSystemConsistsOf`, moznosti: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ],
        }),
        dzTop: new Ano({ nazev: `isAdditionalHeatingSourceConnected` }),
        typDzTop: new Pisatkova<UD>({
            nazev: `typeAndPowerOfAdditionalHeatingSource`,
            zobrazit: d => d.uvedeni.os.dzTop.value,
            nutne: d => d.uvedeni.os.dzTop.value
        }),
        tcTv: new Ano({ nazev: `doesHeatPumpPrepareHotWater`, nutne: false }),
        zTv: new Pisatkova<UD>({ nazev: d => d.uvedeni.os.tcTv.value ? `additionalHotWaterSource` : `mainHotWaterSource` }),
        objemEnOs: new Vyhovuje({ nazev: `volumeOfExpansionTank` }),
        bazenTc: new Ano({ nazev: `isPoolHeatingManagedByHeatPump` }),
    },
    reg: {
        nadpis: new Nadpisova<UD>({ nazev: `controlAndElectricalInstallation` }),
        pripojeniKInternetu: new Vybiratkova<UD>({
            nazev: `internetConnection`, moznosti: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ],
        }),
        pospojeni: new Ano({ nazev: `isElectricalBondingComplete` }),
        spotrebice: new Ano({ nazev: `areElectricalDevicesTested` }),
        zalZdroj: new Ano({
            nazev: `isBackupPowerSourceInstalled`,
            zobrazit: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new Nadpisova<UD>({
            nazev: `primaryCircuit`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
        }),
        typ: new Vybiratkova<UD>({
            nazev: `typeOfPrimaryCircuit`,
            moznosti: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ],
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater',
        }),
        popis: new Pisatkova<UD>({
            nazev: d => {
                switch (d.uvedeni.primar.typ.value) {
                    case (`groundBoreholes`): return `numberAndDepthOfBoreholes`;
                    case (`surfaceCollector`): return `numberAndLengthOfCircuits`;
                    default: return `collectorDescription`;
                }
            },
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new Pisatkova<UD>({
            nazev: `typeOfAntifreezeMixture`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new Vybiratkova<UD>({
            nazev: `onPrimaryCircuitInstalled`,
            moznosti: [`expansionTankInstalled`, `bufferTankInstalled`],
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater',
        }),
        kontrola: new Ano({
            nazev: `wasPrimaryCircuitTested`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new Nadpisova<UD>({ nazev: `commissioningSteps` }),
        tc: new Ano({ nazev: `wasInstallationAccordingToManual` }),
        reg: new Ano({ nazev: `wasControllerSetToParameters` }),
        vlastnik: new Ano({ nazev: `wasOwnerFamiliarizedWithFunction` }),
        typZaruky: new Vybiratkova<UD>({
            nazev: `isExtendedWarrantyDesired`, moznosti: [
                `no`,
                `extendedWarranty7Years`,
                `extendedWarranty10Years`,
            ]
        }),
        zaruka: new Ano({ nazev: `isInstallationInWarrantyConditions`, zobrazit: d => d.uvedeni.uvadeni.typZaruky.value?.includes('extendedWarranty') ?? false }),
    },
})

export const rawUvedeniToUvedeni = (toUvedeni: Uvedeni, rawUvedeni: RawUvedeni) => {
    const d = toUvedeni as Record<string, Record<string, Vec<UD, any>>>

    Object.entries(rawUvedeni).map(a =>
        a as [keyof Uvedeni, RawUvedeni[keyof RawUvedeni]]
    ).forEach(([key1, section]) =>
        Object.entries(section).map(a =>
            a as [string, any]
        ).forEach(([key2, value]) => {
            d[key1][key2].value = value
            if (d[key1][key2] instanceof Pisatkova) d[key1][key2].updateText(value as string)
        })
    )

    return d as Uvedeni
}

export type RawUvedeni = Raw<Uvedeni, UD>

export const uvedeniToRawUvedeni = (uvedeni: Uvedeni): RawUvedeni => {
    const UvedeniEntries = Object.entries(uvedeni);
    const rawUvedeniEntries = UvedeniEntries.map(([key, subUvedeni]) => {
        const subUvedeniEntries = Object.entries(subUvedeni) as [string, Vec<UD, any>][];
        const rawSubUvedeniEntries = subUvedeniEntries.map(([subKey, vec]) => {
            if (vec.value == undefined) return undefined;
            else return [subKey, vec.value] as const;
        }).filter(it => it != undefined);
        const rawSubUvedeni = Object.fromEntries(rawSubUvedeniEntries);
        return [key, rawSubUvedeni] as const;
    });
    return Object.fromEntries(rawUvedeniEntries) as RawUvedeni;
};
