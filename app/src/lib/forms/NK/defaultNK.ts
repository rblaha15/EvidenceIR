import { getTranslations } from '$lib/translations';
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
import { type Company, type Person, usersList } from '$lib/client/realtime';
import { languageCodes } from '$lib/languages';
import products from '$lib/helpers/products';
import { type FormNK, origins } from './formNK';
import { assemblyCompanies } from '$lib/helpers/companies';
import { derived } from 'svelte/store';
import { currentUser } from '$lib/client/auth';

const fve = (d: FormNK) => d.contacts.demandSubject.value.includes(`fve`);
const hp = (d: FormNK) => d.contacts.demandSubject.value.includes(`heatPump`);
const pool = (d: FormNK) => hp(d) && d.system.wantsPool.value;

export default (): FormNK => ({
    contacts: {
        title: new TitleWidget({ text: t => t.nk.contacts.contacts, level: 2 }),
        demandOrigin: new ChooserWidget({ options: origins.keys(), label: t => t.nk.contacts.demandOrigin, labels: t => t.nk.contacts.origins, }),
        demandSubject: new MultiCheckboxWidget({
            options: [`heatPump`, `fve`], label: t => t.nk.contacts.demandSubject, required: false, labels: t => t.nk.contacts.subjects,
        }),
        surname: new InputWidget({ label: t => t.nk.contacts.surname, autocapitalize: 'words' }),
        name: new InputWidget({ label: t => t.nk.contacts.name, autocapitalize: 'words' }),
        street: new InputWidget({ required: false, label: t => t.nk.contacts.street, autocapitalize: 'sentences' }),
        city: new InputWidget({ required: false, label: t => t.nk.contacts.city, autocapitalize: 'words' }),
        zip: new InputWidget({
            required: false, label: t => t.nk.contacts.zip, inputmode: 'numeric',
            onError: t => t.wrong.zip, regex: /^\d{3} \d{2}$/, maskOptions: { mask: `000 00` },
        }),
        phone: new InputWidget({ required: false, label: t => t.nk.contacts.phone, inputmode: 'tel' }),
        email: new InputWidget({ required: false, label: t => t.nk.contacts.email, type: 'email', inputmode: 'email' }),
        assemblyCompanySearch: new SearchWidget<FormNK, Company, true>({
            label: t => t.nk.contacts.searchCompanyInList, items: assemblyCompanies, getSearchItem: i => ({
                pieces: [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                if (company)
                    d.contacts.assemblyCompanyCRN.setValue(d, company.crn);
            },
        }),
        assemblyCompanyCRN: new InputWidget({ required: false, label: t => t.nk.contacts.crn, type: 'number', inputmode: 'numeric' }),
        note: new InputWidget({ required: false, label: t => t.nk.note }),
    },
    photovoltaicPowerPlant: {
        title: new TitleWidget({ show: fve, text: t => t.nk.fve.fve, level: 2 }),
        titleCurrent: new TitleWidget({ show: fve, text: t => t.nk.fve.currentSituation, level: 3 }),
        currentHeating: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.currentHeating }),
        currentHotWater: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.currentHotWater }),
        currentTanks: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.currentTanks }),
        currentConsumption: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.currentConsumption }),
        breakerSize: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.breakerSize }),
        tariff: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.tariff }),
        breakerBoxLocation: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.breakerBoxLocation }),
        titleRequirements: new TitleWidget({ show: fve, text: t => t.nk.fve.requirements, level: 3 }),
        requiredPower: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.requiredPower }),
        locationBuildingType: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.locationBuidingType }),
        info: new TextWidget({ show: fve, text: t => t.nk.fve.familyHouseEtc }),
        lightningRod: new CheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.lightningRod }),
        roofMaterial: new InputWithSuggestionsWidget({
            suggestions: t => [
                t.nk.fve.tile, t.nk.fve.metalSheetFolded, t.nk.fve.metalSheetTrapezoidal,
                t.nk.fve.foil, t.nk.fve.asphaltShingle,
            ], label: t => t.nk.fve.roofMaterial, required: false, show: fve,
        }),
        tileType: new InputWidget({
            required: false, label: t => t.nk.fve.tileType, show: d => fve(d) && languageCodes.map(
                l => getTranslations(l).nk.fve.tile.toLowerCase(),
            ).includes(d.photovoltaicPowerPlant.roofMaterial.value.toLowerCase()),
        }),
        roofAge: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.roofAge }),
        useOptimizers: new CheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.useOptimizers }),
        titleAreas: new TextWidget({ show: fve, text: t => t.nk.fve.avaiableAreas }),
        size1: new InputWidget({ show: fve, label: t => t.nk.fve.size(['1']), required: false }),
        orientation1: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(['1']) }),
        slope1: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(['1']) }),
        size2: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.size(['2']) }),
        orientation2: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(['2']) }),
        slope2: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(['2']) }),
        size3: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.size(['3']) }),
        orientation3: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(['3']) }),
        slope3: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(['3']) }),
        size4: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.size(['4']) }),
        orientation4: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(['4']) }),
        slope4: new InputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(['4']) }),
        battery: new CheckboxWithInputWidget({
            required: false,
            label: (t, d) => d.photovoltaicPowerPlant.battery.value.checked ? t.nk.fve.batteryCapacity : t.nk.fve.battery,
            show: fve,
        }),
        water: new CheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.water }),
        network: new CheckboxWithInputWidget({
            label: (t, d) => d.photovoltaicPowerPlant.network.value.checked ? t.nk.fve.networkPower : t.nk.fve.network,
            required: false,
            show: fve,
        }),
        charging: new CheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.charging }),
        note: new InputWidget({ show: fve, required: false, label: t => t.nk.note }),
    },
    objectDetails: {
        title: new TitleWidget({ show: hp, text: t => t.nk.objectDetail.objectDetail, level: 2 }),
        heatLost: new InputWidget({
            show: hp, required: false, label: t => t.nk.objectDetail.heatLoss, suffix: t => t.units.kW, type: 'number', inputmode: 'decimal',
        }),
        heatNeedsForHeating: new InputWidget({
            required: false,
            label: t => t.nk.objectDetail.heatNeedsForHeating,
            suffix: t => t.units.kWh,
            type: 'number',
            inputmode: 'numeric',
            show: hp,
        }),
        heatNeedsForHotWater: new InputWidget({
            required: false,
            label: t => t.nk.objectDetail.heatNeedsForHotWater,
            suffix: t => t.units.kWh,
            type: 'number',
            inputmode: 'numeric',
            show: hp,
        }),
        heatedArea: new InputWidget({
            show: hp, required: false, label: t => t.nk.objectDetail.area, suffix: t => t.units.m2, type: 'number', inputmode: 'numeric',
        }),
        heatedVolume: new InputWidget({
            show: hp, required: false, label: t => t.nk.objectDetail.volume, suffix: t => t.units.m3, type: 'number', inputmode: 'numeric',
        }),
        heatingCosts: new InputWidget({
            required: false, label: t => t.nk.objectDetail.costs, suffix: t => t.nk.currency, type: 'number', inputmode: 'decimal', show: hp,
        }),
        fuelType: new InputWidget({ show: hp, required: false, label: t => t.nk.objectDetail.type }),
        fuelConsumption: new InputWithChooserWidget({
            required: false, label: t => t.nk.objectDetail.usage, chosen: `q`, options: [`q`, `m3`, `kWh`], show: hp, labels: t => t.units,
        }),
        fuelType2: new InputWidget({ show: hp, required: false, label: t => t.nk.objectDetail.type2 }),
        fuelConsumption2: new InputWithChooserWidget({
            required: false,
            label: t => t.nk.objectDetail.usage2,
            chosen: `q`,
            options: [`q`, `m3`, `kWh`],
            show: hp,
            labels: t => t.units,
        }),
        note: new InputWidget({ show: hp, required: false, label: t => t.nk.note }),
    },
    system: {
        title: new TitleWidget({ show: hp, text: t => t.nk.system.system, level: 2 }),
        hPType: new RadioWidget({
            show: hp,
            required: false,
            label: t => t.nk.system.heatPumpType,
            chosen: `airToWater`,
            options: [`airToWater`, `groundToWater`],
            labels: t => t.nk.system,
        }),
        hPModel: new ChooserWidget({
            required: false,
            label: t => t.nk.system.heatPumpModel,
            show: hp,
            options: d => [`iDoNotKnow`, ...d.system.hPType.value == 'airToWater'
                ? [...products.heatPumpsRTC, ...products.heatPumpsAirToWaterCTC] : products.heatPumpsGroundToWater],
            chosen: `iDoNotKnow`,
            labels: t => t.nk.system,
        }),
        indoorUnitType: new ChooserWidget({
            required: false,
            label: t => t.nk.system.indoorUnitType,
            chosen: `indoorUnitNone`,
            options: [`indoorUnitNone`, ...products.indoorUnits],
            show: hp,
            labels: t => t.nk.system,
        }),
        thermalStoreType: new DoubleChooserWidget({
            required: false,
            label: t => t.nk.system.storeType,
            chosen: { first: `storeNone`, second: null },
            options1: [`storeNone`, ...products.thermalStores.keys()],
            show: hp,
            options2: d => products.thermalStores[d.system.thermalStoreType.value.first as keyof typeof products.thermalStores] ?? [],
            onValueSet: (d, v) => {
                const second = d.system.thermalStoreType.options2(d)[0];
                if (second) d.system.thermalStoreType._value = { ...v, second };
            },
            labels: t => t.nk.system,
        }),
        thermalStoreVolume: new InputWidget({
            required: false, label: t => t.nk.system.storeVolume, suffix: t => t.units.dm3, type: 'number', inputmode: 'numeric',
            show: d => hp(d) && d.system.thermalStoreType.value.first != `storeNone`,
        }),
        waterTankType: new ChooserWidget({
            required: false,
            label: t => t.nk.system.tankType,
            chosen: `tankNone`,
            options: [`tankNone`, ...products.waterTanks],
            show: hp,
            labels: t => t.nk.system,
        }),
        waterTankVolume: new InputWidget({
            required: false, label: t => t.nk.system.tankVolume, suffix: t => t.units.dm3, type: 'number', inputmode: 'numeric',
            show: d => hp(d) && d.system.waterTankType.value != `tankNone`,
        }),
        heatingSystem: new ChooserWidget({
            required: false, label: t => t.nk.system.heatingSystem, show: hp, chosen: `iDoNotKnow`, options: [
                `iDoNotKnow`, `heatingSystem1circuit`, `heatingSystem2circuits`,
                `heatingSystem3circuits`, `heatingSystemInvertor`, `heatingSystemOther`,
            ], labels: t => t.nk.system,
        }),
        hotWaterCirculation: new CheckboxWidget({ show: hp, required: false, label: t => t.nk.system.hotWaterCirculation }),
        wantsPool: new CheckboxWidget({ show: hp, required: false, label: t => t.nk.system.poolHeating }),
        note: new InputWidget({ show: hp, required: false, label: t => t.nk.note }),
    },
    pool: {
        title: new TitleWidget({ show: pool, text: t => t.nk.pool.pool, level: 2 }),
        usagePeriod: new RadioWidget({
            required: false,
            label: t => t.nk.pool.usagePeriod,
            chosen: `periodYearlong`,
            options: [`periodYearlong`, `periodSeasonal`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        placement: new RadioWidget({
            required: false,
            label: t => t.nk.pool.location,
            chosen: `locationOutdoor`,
            options: [`locationOutdoor`, `locationIndoor`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        waterType: new RadioWidget({
            required: false,
            label: t => t.nk.pool.waterType,
            chosen: `freshType`,
            options: [`freshType`, `saltType`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        shape: new RadioWidget({
            required: false,
            label: t => t.nk.pool.shape,
            chosen: `shapeRectangle`,
            options: [`shapeRectangle`, `shapeOval`, `shapeCircle`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        length: new InputWidget({
            required: false, label: t => t.nk.pool.length, suffix: t => t.units.m, type: 'number', inputmode: 'decimal',
            show: d => pool(d) && d.pool.shape.value != `shapeCircle`,
        }),
        width: new InputWidget({
            required: false, label: t => t.nk.pool.width, suffix: t => t.units.m, type: 'number', inputmode: 'decimal',
            show: d => pool(d) && d.pool.shape.value != `shapeCircle`,
        }),
        radius: new InputWidget({
            required: false, label: t => t.nk.pool.radius, suffix: t => t.units.m, type: 'number', inputmode: 'decimal',
            show: d => pool(d) && d.pool.shape.value == `shapeCircle`,
        }),
        depth: new InputWidget({
            show: pool,
            required: false,
            label: t => t.nk.pool.depth,
            suffix: t => t.units.m,
            type: 'number',
            inputmode: 'decimal',
        }),
        coverage: new RadioWidget({
            required: false,
            label: t => t.nk.pool.coverage,
            show: pool,
            chosen: `coverageNone`,
            options: [`coverageNone`, `coverageSolid`, `coveragePolycarbonate`, `coverageOther`],
            labels: t => t.nk.pool,
        }),
        desiredTemperature: new InputWidget({
            required: false,
            label: t => t.nk.pool.temperature,
            suffix: t => t.units.degreeCelsius,
            type: 'number',
            inputmode: 'numeric',
            show: pool,
        }),
        note: new InputWidget({ show: pool, required: false, label: t => t.nk.note }),
    },
    additionalSources: {
        title: new TitleWidget({ show: hp, text: t => t.nk.additionalSources.sources, level: 2 }),
        heatingTitle: new TitleWidget({ show: hp, text: t => t.nk.additionalSources.heating, level: 3 }),
        heatingHeatingElementInStore: new CheckboxWithChooserWidget({
            required: false, label: t => t.nk.additionalSources.heatingElement, chosen: `newNeuter`, show: hp,
            options: [`existing`, `newNeuter`],
            labels: t => t.nk.additionalSources,
        }),
        heatingElectricBoiler: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.electricBoiler,
            show: hp,
            chosen: `existing`,
            options: [`existing`, `newMasculine`],
            labels: t => t.nk.additionalSources,
        }),
        heatingGasBoiler: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.gasBoiler,
            show: hp,
            chosen: `existing`,
            options: [`existing`, `newMasculine`],
            labels: t => t.nk.additionalSources,
        }),
        heatingFireplace: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.fireplace,
            show: hp,
            chosen: `existing`,
            options: [`existing`, `newMasculine`],
            labels: t => t.nk.additionalSources,
        }),
        heatingOther: new InputWidget({ show: hp, required: false, label: t => t.nk.additionalSources.otherSource }),
        hotWaterTitle: new TitleWidget({ show: hp, text: t => t.nk.additionalSources.hotWater, level: 3 }),
        hotWaterHeatingElementInStore: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.heatingElement,
            show: hp,
            chosen: `toSocket`,
            options: [`toSocket`, `fromRegulation`],
            labels: t => t.nk.additionalSources,
        }),
        hotWaterElectricBoiler: new CheckboxWidget({ show: hp, required: false, label: t => t.nk.additionalSources.electricBoiler }),
        hotWaterGasBoiler: new CheckboxWidget({ show: hp, required: false, label: t => t.nk.additionalSources.gasBoiler }),
        hotWaterFireplace: new CheckboxWidget({ show: hp, required: false, label: t => t.nk.additionalSources.fireplace }),
        hotWaterOther: new InputWidget({ show: hp, required: false, label: t => t.nk.additionalSources.otherSource }),
        note: new InputWidget({ show: hp, required: false, label: t => t.nk.note }),
    },
    accessories: {
        title: new TitleWidget({ text: t => t.nk.accessories.accessories, level: 2 }),
        hose: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.accessories.hose,
            chosen: '500 mm',
            options: ['300 mm', '500 mm', '700 mm', '1000 mm'],
        }),
        heatingCable: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.accessories.heatingCable,
            options: ['2,5 m', '3,5 m', '5 m'],
        }),
        wallSupportBracket: new CheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.accessories.wallSupportBracket,
            chosen: `onWall`,
            options: [`onWall`, `onIsolatedWall`],
            labels: t => t.nk.accessories,
        }),
        roomUnitsAndSensors: new CountersWidget({
            label: t => t.nk.accessories.roomUnitsAndSensors,
            counts: {
                'RC 25': 0,
                'RDC': 0,
                'RS 10': 0,
                'RSW 30 - WiFi': 0,
            },
            max: d => ({
                'heatingSystem1circuit': 1, 'heatingSystem2circuits': 2,
                'heatingSystem3circuits': 3, 'heatingSystemInvertor': 1,
            }[d.system.heatingSystem.value as string] ?? Number.POSITIVE_INFINITY),
        }),
        note: new InputWidget({ required: false, label: t => t.nk.note }),
    },
    other: {
        representative: new SearchWidget<FormNK, Person>({
            label: t => t.nk.representative, getSearchItem: t => ({
                pieces: [
                    { text: t.responsiblePerson!, width: .4 },
                    { text: t.koNumber!, width: .1 },
                    { text: t.email, width: .5 },
                ],
            }), show: false, required: true, items: (_, d) => derived([usersList, currentUser], ([$users, $currentUser]) => {
                const withKO = $users.filter(p => p.koNumber && p.responsiblePerson);
                const me = withKO.find(t => $currentUser?.email == t.email);
                if (me) d.other.representative.setValue(d, me);
                return withKO
                    .filter(p => p.email.endsWith('cz'))
                    .toSorted((a, b) => a.responsiblePerson!.split(' ').at(-1)!
                        .localeCompare(b.responsiblePerson!.split(' ').at(-1)!));
            }),
        }),
        photos: new PhotoSelectorWidget({
            label: t => t.nk.photos, required: false, multiple: true, max: 5,
        }),
    },
});