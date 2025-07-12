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
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte.js';
import { type Company, type Person } from '$lib/client/realtime';
import { type Products } from '$lib/helpers/products';
import { type P } from '$lib/translations';
import { origins } from '$lib/forms/PO/defaultPO';

export interface FormPO extends Form<FormPO> {
    contacts: {
        title: TitleWidget<FormPO>
        demandOrigin: ChooserWidget<FormPO, keyof typeof origins>
        demandSubject: MultiCheckboxWidget<FormPO, `demand.contacts.heatPump` | `demand.contacts.fve`>
        surname: InputWidget<FormPO>
        name: InputWidget<FormPO>
        street: InputWidget<FormPO>
        city: InputWidget<FormPO>
        zip: InputWidget<FormPO>
        phone: InputWidget<FormPO>
        email: InputWidget<FormPO>
        assemblyCompanySearch: SearchWidget<FormPO, Company, true>
        assemblyCompanyCRN: InputWidget<FormPO>
        note: InputWidget<FormPO>
    };
    photovoltaicPowerPlant: {
        title: TitleWidget<FormPO>
        titleCurrent: TitleWidget<FormPO>
        currentHeating: InputWidget<FormPO>
        currentHotWater: InputWidget<FormPO>
        currentTanks: InputWidget<FormPO>
        currentConsumption: InputWidget<FormPO>
        breakerSize: InputWidget<FormPO>
        tariff: InputWidget<FormPO>
        breakerBoxLocation: InputWidget<FormPO>
        titleRequirements: TitleWidget<FormPO>
        requiredPower: InputWidget<FormPO>
        locationBuildingType: InputWidget<FormPO>
        info: TextWidget<FormPO>
        lightningRod: CheckboxWidget<FormPO>
        roofMaterial: InputWithSuggestionsWidget<FormPO>
        tileType: InputWidget<FormPO>
        roofAge: InputWidget<FormPO>
        useOptimizers: CheckboxWidget<FormPO>
        titleAreas: TextWidget<FormPO>
        size1: InputWidget<FormPO>
        orientation1: InputWidget<FormPO>
        slope1: InputWidget<FormPO>
        size2: InputWidget<FormPO>
        orientation2: InputWidget<FormPO>
        slope2: InputWidget<FormPO>
        size3: InputWidget<FormPO>
        orientation3: InputWidget<FormPO>
        slope3: InputWidget<FormPO>
        size4: InputWidget<FormPO>
        orientation4: InputWidget<FormPO>
        slope4: InputWidget<FormPO>
        battery: CheckboxWithInputWidget<FormPO>
        water: CheckboxWidget<FormPO>
        network: CheckboxWithInputWidget<FormPO>
        charging: CheckboxWidget<FormPO>
        note: InputWidget<FormPO>
    };
    objectDetails: {
        title: TitleWidget<FormPO>
        heatLost: InputWidget<FormPO>
        heatNeedsForHeating: InputWidget<FormPO>
        heatNeedsForHotWater: InputWidget<FormPO>
        heatedArea: InputWidget<FormPO>
        heatedVolume: InputWidget<FormPO>
        heatingCosts: InputWidget<FormPO>
        fuelType: InputWidget<FormPO>
        fuelConsumption: InputWithChooserWidget<FormPO, `units.q` | `units.m3` | `units.kWh`>
        fuelType2: InputWidget<FormPO>
        fuelConsumption2: InputWithChooserWidget<FormPO, `units.q` | `units.m3` | `units.kWh`>
        note: InputWidget<FormPO>
    };
    system: {
        title: TitleWidget<FormPO>
        hPType: ChooserWidget<FormPO, `airToWater` | `groundToWater`>
        hPModel: ChooserWidget<FormPO, `iDoNotKnow` | Products['heatPumps']>
        indoorUnitType: ChooserWidget<FormPO, `demand.system.indoorUnitNone` | Products['indoorUnits']>
        thermalStoreType: DoubleChooserWidget<FormPO, 'demand.system.storeNone' | Products['thermalStores1'], Products['thermalStores2']>
        thermalStoreVolume: InputWidget<FormPO>
        waterTankType: ChooserWidget<FormPO, `demand.system.tankNone` | Products['waterTanks']>
        waterTankVolume: InputWidget<FormPO>
        heatingSystem: ChooserWidget<FormPO, `iDoNotKnow` | `demand.system.heatingSystem1circuit` | `demand.system.heatingSystem2circuits` | `demand.system.heatingSystem3circuits` | `demand.system.heatingSystemInvertor` | `demand.system.heatingSystemOther`>
        hotWaterCirculation: CheckboxWidget<FormPO>
        wantsPool: CheckboxWidget<FormPO>
        note: InputWidget<FormPO>
    };
    pool: {
        title: TitleWidget<FormPO>
        usagePeriod: ChooserWidget<FormPO, `demand.pool.periodYearlong` | `demand.pool.periodSeasonal`>
        placement: ChooserWidget<FormPO, `demand.pool.locationOutdoor` | `demand.pool.locationIndoor`>
        waterType: ChooserWidget<FormPO, `demand.pool.freshType` | `demand.pool.saltType`>
        shape: ChooserWidget<FormPO, `demand.pool.shapeRectangle` | `demand.pool.shapeOval` | `demand.pool.shapeCircle`>
        width: InputWidget<FormPO>
        length: InputWidget<FormPO>
        radius: InputWidget<FormPO>
        depth: InputWidget<FormPO>
        coverage: ChooserWidget<FormPO, `demand.pool.coverageNone` | `demand.pool.coverageSolid` | `demand.pool.coveragePolycarbonate` | `demand.pool.coverageOther`>
        desiredTemperature: InputWidget<FormPO>
        note: InputWidget<FormPO>
    };
    additionalSources: {
        title: TitleWidget<FormPO>
        heatingTitle: TitleWidget<FormPO>
        heatingHeatingElementInStore: CheckboxWithChooserWidget<FormPO, `demand.additionalSources.existing` | `demand.additionalSources.newNeuter`>
        heatingElectricBoiler: CheckboxWithChooserWidget<FormPO, `demand.additionalSources.existing` | `demand.additionalSources.newMasculine`>
        heatingGasBoiler: CheckboxWithChooserWidget<FormPO, `demand.additionalSources.existing` | `demand.additionalSources.newMasculine`>
        heatingFireplace: CheckboxWithChooserWidget<FormPO, `demand.additionalSources.existing` | `demand.additionalSources.newMasculine`>
        heatingOther: InputWidget<FormPO>
        hotWaterTitle: TitleWidget<FormPO>
        hotWaterHeatingElementInStore: CheckboxWithChooserWidget<FormPO, `demand.additionalSources.toSocket` | `demand.additionalSources.fromRegulation`>
        hotWaterElectricBoiler: CheckboxWidget<FormPO>
        hotWaterGasBoiler: CheckboxWidget<FormPO>
        hotWaterFireplace: CheckboxWidget<FormPO>
        hotWaterOther: InputWidget<FormPO>
        note: InputWidget<FormPO>
    };
    accessories: {
        title: TitleWidget<FormPO>
        hose: CheckboxWithChooserWidget<FormPO, P<'300 mm' | '500 mm' | '700 mm' | '1000 mm'>>
        heatingCable: CheckboxWithChooserWidget<FormPO, P<'3,5 m' | '5 m'>>
        wallSupportBracket: CheckboxWithChooserWidget<FormPO, `demand.accessories.onWall` | `demand.accessories.onIsolatedWall`>
        roomUnitsAndSensors: CountersWidget<FormPO>
        note: InputWidget<FormPO>
    };
    other: {
        representative: SearchWidget<FormPO, Person>
        photos: PhotoSelectorWidget<FormPO>
    };
}