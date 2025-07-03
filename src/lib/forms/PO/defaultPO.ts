import { dev } from '$app/environment';
import { getTranslations, p } from '$lib/translations';
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
} from '$lib/forms/Widget.svelte';
import type { Company, Person } from '$lib/client/realtime';
import { languageCodes } from '$lib/languages';
import products from '$lib/helpers/products';
import type { FormPO } from './formPO';

export const origins = {
    ...{
        'demand.contacts.originQuestionEmail': '_dotazEmail',
        'demand.contacts.originQuestionExhibition': '_dotaznikVYS',
        'demand.contacts.originQuestionInPerson': '_dotazOsobně',
        'demand.contacts.originDistributionCompany': '_poptávkaDis',
        'demand.contacts.originAssembleres': '_poptávkaMF',
        [`demand.contacts.originDesigner`]: '_poptávkaPROJ',
    }, ...(!dev ? {}
            : { [p('Zkoušení funkčnosti aplikace, prosím, nepoužívejte tuto možnost v reálných poptávkách')]: '' } as const
    ),
} as const;

const fve = (d: FormPO) => d.contacts.demandSubject.value.includes(`demand.contacts.fve`);
const hp = (d: FormPO) => d.contacts.demandSubject.value.includes(`demand.contacts.heatPump`);
const pool = (d: FormPO) => hp(d) && d.system.wantsPool.value;

export default (): FormPO => ({
    contacts: {
        title: new TitleWidget({ text: `demand.contacts.contacts` }),
        demandOrigin: new ChooserWidget({ options: origins.keys(), label: `demand.contacts.demandOrigin` }),
        demandSubject: new MultiCheckboxWidget({
            options: [`demand.contacts.heatPump`, `demand.contacts.fve`], label: `demand.contacts.demandSubject`, required: false,
        }),
        surname: new InputWidget({ label: `demand.contacts.surname`, autocapitalize: 'words' }),
        name: new InputWidget({ label: `demand.contacts.name`, autocapitalize: 'words' }),
        street: new InputWidget({ required: false, label: `demand.contacts.street`, autocapitalize: 'sentences' }),
        city: new InputWidget({ required: false, label: `demand.contacts.city`, autocapitalize: 'words' }),
        zip: new InputWidget({
            required: false, label: `demand.contacts.zip`, type: 'number', inputmode: 'numeric',
            onError: `wrongZIPFormat`, regex: /^\d{3} \d{2}$/, maskOptions: { mask: `000 00` },
        }),
        phone: new InputWidget({ required: false, label: `demand.contacts.phone`, inputmode: 'tel' }),
        email: new InputWidget({ required: false, label: `demand.contacts.email`, type: 'email', inputmode: 'email' }),
        assemblyCompanySearch: new SearchWidget<FormPO, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p(i.crn), width: .2 },
                    { text: p(i.companyName), width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                if (company)
                    d.contacts.assemblyCompanyCRN.setValue(d, company.crn);
            },
        }),
        assemblyCompanyCRN: new InputWidget({ required: false, label: `demand.contacts.crn`, type: 'number', inputmode: 'numeric' }),
        note: new InputWidget({ required: false, label: `note` }),
    },
    photovoltaicPowerPlant: {
        title: new TitleWidget({ show: fve, text: `demand.fve.fve` }),
        titleCurrent: new TitleWidget({ show: fve, text: `demand.fve.currentSituation` }),
        currentHeating: new InputWidget({ show: fve, required: false, label: `demand.fve.currentHeating` }),
        currentHotWater: new InputWidget({ show: fve, required: false, label: `demand.fve.currentHotWater` }),
        currentTanks: new InputWidget({ show: fve, required: false, label: `demand.fve.currentTanks` }),
        currentConsumption: new InputWidget({ show: fve, required: false, label: `demand.fve.currentConsumption` }),
        breakerSize: new InputWidget({ show: fve, required: false, label: `demand.fve.breakerSize` }),
        tariff: new InputWidget({ show: fve, required: false, label: `demand.fve.tariff` }),
        breakerBoxLocation: new InputWidget({ show: fve, required: false, label: `demand.fve.breakerBoxLocation` }),
        titleRequirements: new TitleWidget({ show: fve, text: `demand.fve.requirements` }),
        requiredPower: new InputWidget({ show: fve, required: false, label: `demand.fve.requiredPower` }),
        locationBuildingType: new InputWidget({ show: fve, required: false, label: `demand.fve.locationBuidingType` }),
        info: new TextWidget({ show: fve, text: `demand.fve.familyHouseEtc` }),
        lightningRod: new CheckboxWidget({ show: fve, required: false, label: `demand.fve.lightningRod` }),
        roofMaterial: new InputWithSuggestionsWidget({
            suggestions: [
                `demand.fve.tile`, `demand.fve.metalSheetFolded`, `demand.fve.metalSheetTrapezoidal`,
                `demand.fve.foil`, `demand.fve.asphaltShingle`,
            ], label: `demand.fve.roofMaterial`, required: false, show: fve,
        }),
        tileType: new InputWidget({
            required: false, label: `demand.fve.tileType`, show: d => fve(d) && languageCodes.map(
                l => getTranslations(l).demand.fve.tile.toLowerCase(),
            ).includes(d.photovoltaicPowerPlant.roofMaterial.value.toLowerCase()),
        }),
        roofAge: new InputWidget({ show: fve, required: false, label: `demand.fve.roofAge` }),
        useOptimizers: new CheckboxWidget({ show: fve, required: false, label: `demand.fve.useOptimizers` }),
        titleAreas: new TextWidget({ show: fve, text: `demand.fve.avaiableAreas` }),
        size1: new InputWidget({ show: fve, label: `demand.fve.size1`, required: false }),
        orientation1: new InputWidget({ show: fve, required: false, label: `demand.fve.orientation1` }),
        slope1: new InputWidget({ show: fve, required: false, label: `demand.fve.slope1` }),
        size2: new InputWidget({ show: fve, required: false, label: `demand.fve.size2` }),
        orientation2: new InputWidget({ show: fve, required: false, label: `demand.fve.orientation2` }),
        slope2: new InputWidget({ show: fve, required: false, label: `demand.fve.slope2` }),
        size3: new InputWidget({ show: fve, required: false, label: `demand.fve.size3` }),
        orientation3: new InputWidget({ show: fve, required: false, label: `demand.fve.orientation3` }),
        slope3: new InputWidget({ show: fve, required: false, label: `demand.fve.slope3` }),
        size4: new InputWidget({ show: fve, required: false, label: `demand.fve.size4` }),
        orientation4: new InputWidget({ show: fve, required: false, label: `demand.fve.orientation4` }),
        slope4: new InputWidget({ show: fve, required: false, label: `demand.fve.slope4` }),
        battery: new CheckboxWithInputWidget({
            required: false,
            label: d => d.photovoltaicPowerPlant.battery.value.checked ? `demand.fve.batteryCapacity` : `demand.fve.battery`,
            show: fve,
        }),
        water: new CheckboxWidget({ show: fve, required: false, label: `demand.fve.water` }),
        network: new CheckboxWithInputWidget({
            label: d => d.photovoltaicPowerPlant.network.value.checked ? `demand.fve.networkPower` : `demand.fve.network`,
            required: false,
            show: fve,
        }),
        charging: new CheckboxWidget({ show: fve, required: false, label: `demand.fve.charging` }),
        note: new InputWidget({ show: fve, required: false, label: `note` }),
    },
    objectDetails: {
        title: new TitleWidget({ show: hp, text: `demand.objectDetail.objectDetail` }),
        heatLost: new InputWidget({
            show: hp, required: false, label: `demand.objectDetail.heatLoss`, suffix: `units.kW`, type: 'number', inputmode: 'decimal',
        }),
        heatNeedsForHeating: new InputWidget({
            required: false,
            label: `demand.objectDetail.heatNeedsForHeating`,
            suffix: `units.kWh`,
            type: 'number',
            inputmode: 'numeric',
            show: hp,
        }),
        heatNeedsForHotWater: new InputWidget({
            required: false,
            label: `demand.objectDetail.heatNeedsForHotWater`,
            suffix: `units.kWh`,
            type: 'number',
            inputmode: 'numeric',
            show: hp,
        }),
        heatedArea: new InputWidget({
            show: hp, required: false, label: `demand.objectDetail.area`, suffix: `units.m2`, type: 'number', inputmode: 'numeric',
        }),
        heatedVolume: new InputWidget({
            show: hp, required: false, label: `demand.objectDetail.volume`, suffix: `units.m3`, type: 'number', inputmode: 'numeric',
        }),
        heatingCosts: new InputWidget({
            required: false, label: `demand.objectDetail.costs`, suffix: `demand.currency`, type: 'number', inputmode: 'decimal', show: hp,
        }),
        fuelType: new InputWidget({ show: hp, required: false, label: `demand.objectDetail.type` }),
        fuelConsumption: new InputWithChooserWidget({
            required: false, label: `demand.objectDetail.usage`, chosen: `units.q`, options: [`units.q`, `units.m3`, `units.kWh`], show: hp,
        }),
        fuelType2: new InputWidget({ show: hp, required: false, label: `demand.objectDetail.type2` }),
        fuelConsumption2: new InputWithChooserWidget({
            required: false,
            label: `demand.objectDetail.usage2`,
            chosen: `units.q`,
            options: [`units.q`, `units.m3`, `units.kWh`],
            show: hp,
        }),
        note: new InputWidget({ show: hp, required: false, label: `note` }),
    },
    system: {
        title: new TitleWidget({ show: hp, text: `demand.system.system` }),
        hPType: new RadioWidget({
            show: hp,
            required: false,
            label: `heatPumpType`,
            chosen: `airToWater`,
            options: [`airToWater`, `groundToWater`],
        }),
        hPModel: new ChooserWidget({
            required: false, label: `heatPumpModel`, show: hp, options: d => [`iDoNotKnow`, ...d.system.hPType.value == 'airToWater'
                ? [...products.heatPumpsRTC, ...products.heatPumpsAirToWaterCTC] : products.heatPumpsGroundToWater], chosen: `iDoNotKnow`,
        }),
        indoorUnitType: new ChooserWidget({
            required: false,
            label: `demand.system.indoorUnitType`,
            chosen: `demand.system.indoorUnitNone`,
            options: [`demand.system.indoorUnitNone`, ...products.indoorUnits],
            show: hp,
        }),
        thermalStoreType: new DoubleChooserWidget({
            required: false,
            label: `demand.system.storeType`,
            options1: [`demand.system.storeNone`, ...products.thermalStores.keys()],
            show: hp,
            options2: d => products.thermalStores[d.system.thermalStoreType.value.first as keyof typeof products.thermalStores] ?? [],
            onValueSet: (d, v) => {
                const second = d.system.thermalStoreType.options2(d)[0];
                if (second) d.system.thermalStoreType._value = { ...v, second };
            },
        }),
        thermalStoreVolume: new InputWidget({
            required: false, label: `demand.system.storeVolume`, suffix: `units.dm3`, type: 'number', inputmode: 'numeric',
            show: d => hp(d) && d.system.thermalStoreType.value.first != `demand.system.storeNone`,
        }),
        waterTankType: new ChooserWidget({
            required: false,
            label: `demand.system.tankType`,
            chosen: `demand.system.tankNone`,
            options: [`demand.system.tankNone`, ...products.waterTanks],
            show: hp,
        }),
        waterTankVolume: new InputWidget({
            required: false, label: `demand.system.tankVolume`, suffix: `units.dm3`, type: 'number', inputmode: 'numeric',
            show: d => hp(d) && d.system.waterTankType.value != `demand.system.tankNone`,
        }),
        heatingSystem: new ChooserWidget({
            required: false, label: `demand.system.heatingSystem`, show: hp, chosen: `iDoNotKnow`, options: [
                `iDoNotKnow`, `demand.system.heatingSystem1circuit`, `demand.system.heatingSystem2circuits`,
                `demand.system.heatingSystem3circuits`, `demand.system.heatingSystemInvertor`, `demand.system.heatingSystemOther`,
            ],
        }),
        hotWaterCirculation: new CheckboxWidget({ show: hp, required: false, label: `demand.system.hotWaterCirculation` }),
        wantsPool: new CheckboxWidget({ show: hp, required: false, label: `demand.system.poolHeating` }),
        note: new InputWidget({ show: hp, required: false, label: `note` }),
    },
    pool: {
        title: new TitleWidget({ show: pool, text: `demand.pool.pool` }),
        usagePeriod: new RadioWidget({
            required: false,
            label: `demand.pool.usagePeriod`,
            chosen: `demand.pool.periodYearlong`,
            options: [`demand.pool.periodYearlong`, `demand.pool.periodSeasonal`],
            show: pool,
        }),
        placement: new RadioWidget({
            required: false,
            label: `demand.pool.location`,
            chosen: `demand.pool.locationOutdoor`,
            options: [`demand.pool.locationOutdoor`, `demand.pool.locationIndoor`],
            show: pool,
        }),
        waterType: new RadioWidget({
            required: false,
            label: `demand.pool.waterType`,
            chosen: `demand.pool.freshType`,
            options: [`demand.pool.freshType`, `demand.pool.saltType`],
            show: pool,
        }),
        shape: new RadioWidget({
            required: false,
            label: `demand.pool.shape`,
            chosen: `demand.pool.shapeRectangle`,
            options: [`demand.pool.shapeRectangle`, `demand.pool.shapeOval`, `demand.pool.shapeCircle`],
            show: pool,
        }),
        length: new InputWidget({
            required: false, label: `demand.pool.length`, suffix: `units.m`, type: 'number', inputmode: 'decimal',
            show: d => pool(d) && d.pool.shape.value != `demand.pool.shapeCircle`,
        }),
        width: new InputWidget({
            required: false, label: `demand.pool.width`, suffix: `units.m`, type: 'number', inputmode: 'decimal',
            show: d => pool(d) && d.pool.shape.value != `demand.pool.shapeCircle`,
        }),
        radius: new InputWidget({
            required: false, label: `demand.pool.radius`, suffix: `units.m`, type: 'number', inputmode: 'decimal',
            show: d => pool(d) && d.pool.shape.value == `demand.pool.shapeCircle`,
        }),
        depth: new InputWidget({
            show: pool,
            required: false,
            label: `demand.pool.depth`,
            suffix: `units.m`,
            type: 'number',
            inputmode: 'decimal',
        }),
        coverage: new RadioWidget({
            required: false,
            label: `demand.pool.coverage`,
            show: pool,
            chosen: `demand.pool.coverageNone`,
            options: [`demand.pool.coverageNone`, `demand.pool.coverageSolid`, `demand.pool.coveragePolycarbonate`, `demand.pool.coverageOther`],
        }),
        desiredTemperature: new InputWidget({
            required: false,
            label: `demand.pool.temperature`,
            suffix: `units.degreeCelsius`,
            type: 'number',
            inputmode: 'numeric',
            show: pool,
        }),
        note: new InputWidget({ show: pool, required: false, label: `note` }),
    },
    additionalSources: {
        title: new TitleWidget({ show: hp, text: `demand.additionalSources.sources` }),
        heatingTitle: new TitleWidget({ show: hp, text: `demand.additionalSources.heating` }),
        heatingHeatingElementInStore: new CheckboxWithChooserWidget({
            required: false, label: `demand.additionalSources.heatingElement`, chosen: `demand.additionalSources.newNeuter`, show: hp,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newNeuter`],
        }),
        heatingElectricBoiler: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.additionalSources.electricBoiler`,
            show: hp,
            chosen: `demand.additionalSources.existing`,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newMasculine`],
        }),
        heatingGasBoiler: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.additionalSources.gasBoiler`,
            show: hp,
            chosen: `demand.additionalSources.existing`,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newMasculine`],
        }),
        heatingFireplace: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.additionalSources.fireplace`,
            show: hp,
            chosen: `demand.additionalSources.existing`,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newMasculine`],
        }),
        heatingOther: new InputWidget({ show: hp, required: false, label: `demand.additionalSources.otherSource` }),
        hotWaterTitle: new TitleWidget({ show: hp, text: `demand.additionalSources.hotWater` }),
        hotWaterHeatingElementInStore: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.additionalSources.heatingElement`,
            show: hp,
            chosen: `demand.additionalSources.toSocket`,
            options: [`demand.additionalSources.toSocket`, `demand.additionalSources.fromRegulation`],
        }),
        hotWaterElectricBoiler: new CheckboxWidget({ show: hp, required: false, label: `demand.additionalSources.electricBoiler` }),
        hotWaterGasBoiler: new CheckboxWidget({ show: hp, required: false, label: `demand.additionalSources.gasBoiler` }),
        hotWaterFireplace: new CheckboxWidget({ show: hp, required: false, label: `demand.additionalSources.fireplace` }),
        hotWaterOther: new InputWidget({ show: hp, required: false, label: `demand.additionalSources.otherSource` }),
        note: new InputWidget({ show: hp, required: false, label: `note` }),
    },
    accessories: {
        title: new TitleWidget({ text: `demand.accessories.accessories` }),
        hose: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.accessories.hose`,
            chosen: p('500 mm'),
            options: p(['300 mm', '500 mm', '700 mm', '1000 mm']),
        }),
        heatingCable: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.accessories.heatingCable`,
            chosen: p('3,5 m'),
            options: p(['3,5 m', '5 m']),
        }),
        wallSupportBracket: new CheckboxWithChooserWidget({
            required: false,
            label: `demand.accessories.wallSupportBracket`,
            chosen: `demand.accessories.onWall`,
            options: [`demand.accessories.onWall`, `demand.accessories.onIsolatedWall`],
        }),
        roomUnitsAndSensors: new CountersWidget({
            label: `demand.accessories.roomUnitsAndSensors`,
            options: p(['RC 25', 'RDC', 'RS 10', 'RSW 30 - WiFi']),
            counts: [0, 0, 0, 0],
            max: d => ({
                'demand.system.heatingSystem1circuit': 1, 'demand.system.heatingSystem2circuits': 2,
                'demand.system.heatingSystem3circuits': 3, 'demand.system.heatingSystemInvertor': 1,
            }[d.system.heatingSystem.value as string] ?? Number.POSITIVE_INFINITY),
        }),
        note: new InputWidget({ required: false, label: `note` }),
    },
    other: {
        representative: new SearchWidget<FormPO, Person>({
            label: `representative`, items: [], getSearchItem: t => ({
                pieces: [
                    { text: p(t.responsiblePerson!), width: .4 },
                    { text: p(t.koNumber!), width: .1 },
                    { text: p(t.email), width: .5 },
                ],
            }), show: false, required: true,
        }),
        photos: new PhotoSelectorWidget({
            label: `photos`, required: false, multiple: true, max: 5,
        }),
    },
});