import { type Form } from '$lib/forms/Form';
import {
    CheckboxWidget,
    CheckboxWithChooserWidget,
    CheckboxWithInputWidget,
    ChooserWidget,
    CountersWidget,
    DoubleChooserWidget,
    InputWidget,
    InputWithChooserWidget,
    InputWithSuggestionsWidget,
    MultiCheckboxWidget,
    PhotoSelectorWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte.js';
import { type Company, type Person } from '$lib/client/realtime';
import { type Products } from '$lib/helpers/products';

export const origins = {
    'questionEmail': '_dotazEmail',
    'questionExhibition': '_dotaznikVYS',
    'questionInPerson': '_dotazOsobně',
    'distributionCompany': '_poptávkaDis',
    'assembleres': '_poptávkaMF',
    'designer': '_poptávkaPROJ',
} as const;

export type HoseLength = '300 mm' | '500 mm' | '700 mm' | '1000 mm';
export type HeatingCableLength = '3,5 m' | '5 m';
export type RoomUnitType = 'RC 25' | 'RDC' | 'RS 10' | 'RSW 30 - WiFi';

export interface FormNK extends Form<FormNK> {
    contacts: {
        title: TitleWidget<FormNK>
        demandOrigin: ChooserWidget<FormNK, keyof typeof origins>
        demandSubject: MultiCheckboxWidget<FormNK, `heatPump` | `fve`>
        surname: InputWidget<FormNK>
        name: InputWidget<FormNK>
        street: InputWidget<FormNK>
        city: InputWidget<FormNK>
        zip: InputWidget<FormNK>
        phone: InputWidget<FormNK>
        email: InputWidget<FormNK>
        assemblyCompanySearch: SearchWidget<FormNK, Company, true>
        assemblyCompanyCRN: InputWidget<FormNK>
        note: InputWidget<FormNK>
    };
    photovoltaicPowerPlant: {
        title: TitleWidget<FormNK>
        titleCurrent: TitleWidget<FormNK>
        currentHeating: InputWidget<FormNK>
        currentHotWater: InputWidget<FormNK>
        currentTanks: InputWidget<FormNK>
        currentConsumption: InputWidget<FormNK>
        breakerSize: InputWidget<FormNK>
        tariff: InputWidget<FormNK>
        breakerBoxLocation: InputWidget<FormNK>
        titleRequirements: TitleWidget<FormNK>
        requiredPower: InputWidget<FormNK>
        locationBuildingType: InputWidget<FormNK>
        info: TextWidget<FormNK>
        lightningRod: CheckboxWidget<FormNK>
        roofMaterial: InputWithSuggestionsWidget<FormNK>
        tileType: InputWidget<FormNK>
        roofAge: InputWidget<FormNK>
        useOptimizers: CheckboxWidget<FormNK>
        titleAreas: TextWidget<FormNK>
        size1: InputWidget<FormNK>
        orientation1: InputWidget<FormNK>
        slope1: InputWidget<FormNK>
        size2: InputWidget<FormNK>
        orientation2: InputWidget<FormNK>
        slope2: InputWidget<FormNK>
        size3: InputWidget<FormNK>
        orientation3: InputWidget<FormNK>
        slope3: InputWidget<FormNK>
        size4: InputWidget<FormNK>
        orientation4: InputWidget<FormNK>
        slope4: InputWidget<FormNK>
        battery: CheckboxWithInputWidget<FormNK>
        water: CheckboxWidget<FormNK>
        network: CheckboxWithInputWidget<FormNK>
        charging: CheckboxWidget<FormNK>
        note: InputWidget<FormNK>
    };
    objectDetails: {
        title: TitleWidget<FormNK>
        heatLost: InputWidget<FormNK>
        heatNeedsForHeating: InputWidget<FormNK>
        heatNeedsForHotWater: InputWidget<FormNK>
        heatedArea: InputWidget<FormNK>
        heatedVolume: InputWidget<FormNK>
        heatingCosts: InputWidget<FormNK>
        fuelType: InputWidget<FormNK>
        fuelConsumption: InputWithChooserWidget<FormNK, `q` | `m3` | `kWh`>
        fuelType2: InputWidget<FormNK>
        fuelConsumption2: InputWithChooserWidget<FormNK, `q` | `m3` | `kWh`>
        note: InputWidget<FormNK>
    };
    system: {
        title: TitleWidget<FormNK>
        hPType: RadioWidget<FormNK, `airToWater` | `groundToWater`>
        hPModel: ChooserWidget<FormNK, `iDoNotKnow` | Products['heatPumps']>
        indoorUnitType: ChooserWidget<FormNK, `indoorUnitNone` | Products['indoorUnits']>
        thermalStoreType: DoubleChooserWidget<FormNK, 'storeNone' | Products['thermalStores1'], Products['thermalStores2']>
        thermalStoreVolume: InputWidget<FormNK>
        waterTankType: ChooserWidget<FormNK, `tankNone` | Products['waterTanks']>
        waterTankVolume: InputWidget<FormNK>
        heatingSystem: ChooserWidget<FormNK, `iDoNotKnow` | `heatingSystem1circuit` | `heatingSystem2circuits` | `heatingSystem3circuits` | `heatingSystemInvertor` | `heatingSystemOther`>
        hotWaterCirculation: CheckboxWidget<FormNK>
        wantsPool: CheckboxWidget<FormNK>
        note: InputWidget<FormNK>
    };
    pool: {
        title: TitleWidget<FormNK>
        usagePeriod: RadioWidget<FormNK, `periodYearlong` | `periodSeasonal`>
        placement: RadioWidget<FormNK, `locationOutdoor` | `locationIndoor`>
        waterType: RadioWidget<FormNK, `freshType` | `saltType`>
        shape: RadioWidget<FormNK, `shapeRectangle` | `shapeOval` | `shapeCircle`>
        width: InputWidget<FormNK>
        length: InputWidget<FormNK>
        radius: InputWidget<FormNK>
        depth: InputWidget<FormNK>
        coverage: RadioWidget<FormNK, `coverageNone` | `coverageSolid` | `coveragePolycarbonate` | `coverageOther`>
        desiredTemperature: InputWidget<FormNK>
        note: InputWidget<FormNK>
    };
    additionalSources: {
        title: TitleWidget<FormNK>
        heatingTitle: TitleWidget<FormNK>
        heatingHeatingElementInStore: CheckboxWithChooserWidget<FormNK, `existing` | `newNeuter`>
        heatingElectricBoiler: CheckboxWithChooserWidget<FormNK, `existing` | `newMasculine`>
        heatingGasBoiler: CheckboxWithChooserWidget<FormNK, `existing` | `newMasculine`>
        heatingFireplace: CheckboxWithChooserWidget<FormNK, `existing` | `newMasculine`>
        heatingOther: InputWidget<FormNK>
        hotWaterTitle: TitleWidget<FormNK>
        hotWaterHeatingElementInStore: CheckboxWithChooserWidget<FormNK, `toSocket` | `fromRegulation`>
        hotWaterElectricBoiler: CheckboxWidget<FormNK>
        hotWaterGasBoiler: CheckboxWidget<FormNK>
        hotWaterFireplace: CheckboxWidget<FormNK>
        hotWaterOther: InputWidget<FormNK>
        note: InputWidget<FormNK>
    };
    accessories: {
        title: TitleWidget<FormNK>
        hose: CheckboxWithChooserWidget<FormNK, HoseLength>
        heatingCable: CheckboxWithChooserWidget<FormNK, HeatingCableLength>
        wallSupportBracket: CheckboxWithChooserWidget<FormNK, `onWall` | `onIsolatedWall`>
        roomUnitsAndSensors: CountersWidget<FormNK, RoomUnitType>
        note: InputWidget<FormNK>
    };
    other: {
        representative: SearchWidget<FormNK, Person>
        photos: PhotoSelectorWidget<FormNK>
    };
}