import { type Form, type Values } from '$lib/forms/Form';
import type {
    CheckboxWidget,
    CheckboxWithChooserWidget,
    CheckboxWithInputWidget,
    ChooserWidget,
    CountersWidget,
    InputWidget,
    InputWithChooserWidget,
    MultiCheckboxWidget,
    PhotoSelectorWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget';
import { type Company, type Person } from '$lib/client/realtime';
import { type HeatPump, type IndoorUnit } from '$lib/helpers/products';

export const origins = {
    'questionEmail': '_dotazEmail',
    'questionExhibition': '_dotaznikVYS',
    'questionInPerson': '_dotazOsobně',
    'distributionCompany': '_poptávkaDis',
    'assembleres': '_poptávkaMF',
    'designer': '_poptávkaPROJ',
} as const;

export type HoseLength = '300 mm' | '500 mm' | '700 mm' | '1000 mm';
export type HeatingCableLength = '3,5 m' | '2,5 m' | '5 m';
export type RoomUnitType = 'RC 25' | 'RDC' | 'RS 10' | 'RSW 30 - WiFi';

export type ContextNK = {
    f: FormNK;
    v: Values<FormNK>;
}

export interface FormNK extends Form<ContextNK> {
    contacts: {
        title: TitleWidget<ContextNK>
        demandOrigin: ChooserWidget<ContextNK, keyof typeof origins>
        demandSubject: MultiCheckboxWidget<ContextNK, `heatPump` | `fve`>
        surname: InputWidget<ContextNK>
        name: InputWidget<ContextNK>
        street: InputWidget<ContextNK>
        city: InputWidget<ContextNK>
        zip: InputWidget<ContextNK>
        phone: InputWidget<ContextNK>
        email: InputWidget<ContextNK>
        assemblyCompanySearch: SearchWidget<ContextNK, Company, true>
        assemblyCompanyCRN: InputWidget<ContextNK>
        note: InputWidget<ContextNK>
    };
    photovoltaicPowerPlant: {
        title: TitleWidget<ContextNK>
        titleCurrent: TitleWidget<ContextNK>
        currentHeating: InputWidget<ContextNK>
        currentHotWater: InputWidget<ContextNK>
        currentTanks: InputWidget<ContextNK>
        currentConsumption: InputWidget<ContextNK>
        breakerSize: InputWidget<ContextNK>
        tariff: InputWidget<ContextNK>
        breakerBoxLocation: InputWidget<ContextNK>
        titleRequirements: TitleWidget<ContextNK>
        requiredPower: InputWidget<ContextNK>
        locationBuildingType: InputWidget<ContextNK>
        info: TextWidget<ContextNK>
        lightningRod: CheckboxWidget<ContextNK>
        roofMaterial: InputWidget<ContextNK>
        tileType: InputWidget<ContextNK>
        roofAge: InputWidget<ContextNK>
        useOptimizers: CheckboxWidget<ContextNK>
        titleAreas: TextWidget<ContextNK>
        size1: InputWidget<ContextNK>
        orientation1: InputWidget<ContextNK>
        slope1: InputWidget<ContextNK>
        size2: InputWidget<ContextNK>
        orientation2: InputWidget<ContextNK>
        slope2: InputWidget<ContextNK>
        size3: InputWidget<ContextNK>
        orientation3: InputWidget<ContextNK>
        slope3: InputWidget<ContextNK>
        size4: InputWidget<ContextNK>
        orientation4: InputWidget<ContextNK>
        slope4: InputWidget<ContextNK>
        battery: CheckboxWithInputWidget<ContextNK>
        water: CheckboxWidget<ContextNK>
        network: CheckboxWithInputWidget<ContextNK>
        charging: CheckboxWidget<ContextNK>
        note: InputWidget<ContextNK>
    };
    objectDetails: {
        title: TitleWidget<ContextNK>
        heatLost: InputWidget<ContextNK>
        heatNeedsForHeating: InputWidget<ContextNK>
        heatNeedsForHotWater: InputWidget<ContextNK>
        heatedArea: InputWidget<ContextNK>
        heatedVolume: InputWidget<ContextNK>
        heatingCosts: InputWidget<ContextNK>
        fuelType: InputWidget<ContextNK>
        fuelConsumption: InputWithChooserWidget<ContextNK, `q` | `m3` | `kWh`>
        fuelType2: InputWidget<ContextNK>
        fuelConsumption2: InputWithChooserWidget<ContextNK, `q` | `m3` | `kWh`>
        note: InputWidget<ContextNK>
    };
    system: {
        title: TitleWidget<ContextNK>
        hPType: RadioWidget<ContextNK, `airToWater` | `groundToWater`>
        hPModel: ChooserWidget<ContextNK, `iDoNotKnow` | HeatPump>
        indoorUnitType: ChooserWidget<ContextNK, `indoorUnitNone` | IndoorUnit>
        thermalStore: InputWidget<ContextNK>
        waterTank: InputWidget<ContextNK>
        heatingSystem: ChooserWidget<ContextNK, `iDoNotKnow` | `heatingSystem1circuit` | `heatingSystem2circuits` | `heatingSystem3circuits` | `heatingSystemInvertor` | `heatingSystemOther`>
        hotWaterCirculation: CheckboxWidget<ContextNK>
        wantsPool: CheckboxWidget<ContextNK>
        note: InputWidget<ContextNK>
    };
    pool: {
        title: TitleWidget<ContextNK>
        usagePeriod: RadioWidget<ContextNK, `periodYearlong` | `periodSeasonal`>
        placement: RadioWidget<ContextNK, `locationOutdoor` | `locationIndoor`>
        waterType: RadioWidget<ContextNK, `freshType` | `saltType`>
        shape: RadioWidget<ContextNK, `shapeRectangle` | `shapeOval` | `shapeCircle`>
        width: InputWidget<ContextNK>
        length: InputWidget<ContextNK>
        radius: InputWidget<ContextNK>
        depth: InputWidget<ContextNK>
        coverage: RadioWidget<ContextNK, `coverageNone` | `coverageSolid` | `coveragePolycarbonate` | `coverageOther`>
        desiredTemperature: InputWidget<ContextNK>
        note: InputWidget<ContextNK>
    };
    additionalSources: {
        title: TitleWidget<ContextNK>
        heatingTitle: TitleWidget<ContextNK>
        heatingHeatingElementInStore: CheckboxWithChooserWidget<ContextNK, `existing` | `newNeuter`>
        heatingElectricBoiler: CheckboxWithChooserWidget<ContextNK, `existing` | `newMasculine`>
        heatingGasBoiler: CheckboxWithChooserWidget<ContextNK, `existing` | `newMasculine`>
        heatingFireplace: CheckboxWithChooserWidget<ContextNK, `existing` | `newMasculine`>
        heatingOther: InputWidget<ContextNK>
        hotWaterTitle: TitleWidget<ContextNK>
        hotWaterHeatingElementInStore: CheckboxWithChooserWidget<ContextNK, `toSocket` | `fromRegulation`>
        hotWaterElectricBoiler: CheckboxWidget<ContextNK>
        hotWaterGasBoiler: CheckboxWidget<ContextNK>
        hotWaterFireplace: CheckboxWidget<ContextNK>
        hotWaterOther: InputWidget<ContextNK>
        note: InputWidget<ContextNK>
    };
    accessories: {
        title: TitleWidget<ContextNK>
        hose: CheckboxWithChooserWidget<ContextNK, HoseLength>
        heatingCable: CheckboxWithChooserWidget<ContextNK, HeatingCableLength>
        wallSupportBracket: CheckboxWithChooserWidget<ContextNK, `onWall` | `onIsolatedWall`>
        roomUnitsAndSensors: CountersWidget<ContextNK, RoomUnitType>
        note: InputWidget<ContextNK>
    };
    other: {
        representative: SearchWidget<ContextNK, Person>
        photos: PhotoSelectorWidget<ContextNK>
    };
}