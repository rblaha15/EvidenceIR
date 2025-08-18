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
    PhotoSelectorWidget, RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte.js';
import { type Company, type Person } from '$lib/client/realtime';
import { type Products } from '$lib/helpers/products';
import { type P } from '$lib/translations';
import { origins } from '$lib/forms/NK/defaultNK';

export interface FormNK extends Form<FormNK> {
    contacts: {
        title: TitleWidget<FormNK>
        demandOrigin: ChooserWidget<FormNK, keyof typeof origins>
        demandSubject: MultiCheckboxWidget<FormNK, `demand.contacts.heatPump` | `demand.contacts.fve`>
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
        fuelConsumption: InputWithChooserWidget<FormNK, `units.q` | `units.m3` | `units.kWh`>
        fuelType2: InputWidget<FormNK>
        fuelConsumption2: InputWithChooserWidget<FormNK, `units.q` | `units.m3` | `units.kWh`>
        note: InputWidget<FormNK>
    };
    system: {
        title: TitleWidget<FormNK>
        hPType: RadioWidget<FormNK, `airToWater` | `groundToWater`>
        hPModel: ChooserWidget<FormNK, `demand.system.iDoNotKnow` | Products['heatPumps']>
        indoorUnitType: ChooserWidget<FormNK, `demand.system.indoorUnitNone` | Products['indoorUnits']>
        thermalStoreType: DoubleChooserWidget<FormNK, 'demand.system.storeNone' | Products['thermalStores1'], Products['thermalStores2']>
        thermalStoreVolume: InputWidget<FormNK>
        waterTankType: ChooserWidget<FormNK, `demand.system.tankNone` | Products['waterTanks']>
        waterTankVolume: InputWidget<FormNK>
        heatingSystem: ChooserWidget<FormNK, `demand.system.iDoNotKnow` | `demand.system.heatingSystem1circuit` | `demand.system.heatingSystem2circuits` | `demand.system.heatingSystem3circuits` | `demand.system.heatingSystemInvertor` | `demand.system.heatingSystemOther`>
        hotWaterCirculation: CheckboxWidget<FormNK>
        wantsPool: CheckboxWidget<FormNK>
        note: InputWidget<FormNK>
    };
    pool: {
        title: TitleWidget<FormNK>
        usagePeriod: RadioWidget<FormNK, `demand.pool.periodYearlong` | `demand.pool.periodSeasonal`>
        placement: RadioWidget<FormNK, `demand.pool.locationOutdoor` | `demand.pool.locationIndoor`>
        waterType: RadioWidget<FormNK, `demand.pool.freshType` | `demand.pool.saltType`>
        shape: RadioWidget<FormNK, `demand.pool.shapeRectangle` | `demand.pool.shapeOval` | `demand.pool.shapeCircle`>
        width: InputWidget<FormNK>
        length: InputWidget<FormNK>
        radius: InputWidget<FormNK>
        depth: InputWidget<FormNK>
        coverage: RadioWidget<FormNK, `demand.pool.coverageNone` | `demand.pool.coverageSolid` | `demand.pool.coveragePolycarbonate` | `demand.pool.coverageOther`>
        desiredTemperature: InputWidget<FormNK>
        note: InputWidget<FormNK>
    };
    additionalSources: {
        title: TitleWidget<FormNK>
        heatingTitle: TitleWidget<FormNK>
        heatingHeatingElementInStore: CheckboxWithChooserWidget<FormNK, `demand.additionalSources.existing` | `demand.additionalSources.newNeuter`>
        heatingElectricBoiler: CheckboxWithChooserWidget<FormNK, `demand.additionalSources.existing` | `demand.additionalSources.newMasculine`>
        heatingGasBoiler: CheckboxWithChooserWidget<FormNK, `demand.additionalSources.existing` | `demand.additionalSources.newMasculine`>
        heatingFireplace: CheckboxWithChooserWidget<FormNK, `demand.additionalSources.existing` | `demand.additionalSources.newMasculine`>
        heatingOther: InputWidget<FormNK>
        hotWaterTitle: TitleWidget<FormNK>
        hotWaterHeatingElementInStore: CheckboxWithChooserWidget<FormNK, `demand.additionalSources.toSocket` | `demand.additionalSources.fromRegulation`>
        hotWaterElectricBoiler: CheckboxWidget<FormNK>
        hotWaterGasBoiler: CheckboxWidget<FormNK>
        hotWaterFireplace: CheckboxWidget<FormNK>
        hotWaterOther: InputWidget<FormNK>
        note: InputWidget<FormNK>
    };
    accessories: {
        title: TitleWidget<FormNK>
        hose: CheckboxWithChooserWidget<FormNK, P<'300 mm' | '500 mm' | '700 mm' | '1000 mm'>>
        heatingCable: CheckboxWithChooserWidget<FormNK, P<'3,5 m' | '5 m'>>
        wallSupportBracket: CheckboxWithChooserWidget<FormNK, `demand.accessories.onWall` | `demand.accessories.onIsolatedWall`>
        roomUnitsAndSensors: CountersWidget<FormNK>
        note: InputWidget<FormNK>
    };
    other: {
        representative: SearchWidget<FormNK, Person>
        photos: PhotoSelectorWidget<FormNK>
    };
}