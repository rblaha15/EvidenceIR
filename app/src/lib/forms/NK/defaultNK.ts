import { getTranslations } from '$lib/translations';
import { accumulationTanks, type Company, type Person, usersList, waterTanks } from '$lib/client/realtime';
import { heatPumps, indoorUnits } from '$lib/helpers/products';
import { type ContextNK, type FormNK, origins } from './formNK';
import { assemblyCompanies } from '$lib/helpers/companies';
import { derived, readable } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import ares from '$lib/helpers/ares';
import type { FormPlus } from '$lib/forms/Form';
import languageCodes from '$lib/languageCodes';
import ruian, { type Address } from '$lib/helpers/ruian';
import {
    newCheckboxWidget, newCheckboxWithChooserWidget,
    newCheckboxWithInputWidget,
    newChooserWidget, newCountersWidget,
    newInputWidget, newInputWithChooserWidget,
    newMultiCheckboxWidget, newPhotoSelectorWidget, newRadioWidget,
    newSearchWidget,
    newTextWidget,
    newTitleWidget,
} from '$lib/forms/Widget';

const fve = (c: ContextNK) => c.v.contacts.demandSubject.includes(`fve`);
const hp = (c: ContextNK) => c.v.contacts.demandSubject.includes(`heatPump`);
const pool = (c: ContextNK) => hp(c) && c.v.system.wantsPool;

export default (): FormPlus<FormNK> => ({
    contacts: {
        title: newTitleWidget({ text: t => t.nk.contacts.contacts, level: 2 }),
        demandOrigin: newChooserWidget({ options: origins.keys(), label: t => t.nk.contacts.demandOrigin, labels: t => t.nk.contacts.origins, }),
        demandSubject: newMultiCheckboxWidget({
            options: [`heatPump`, `fve`], label: t => t.nk.contacts.demandSubject, required: false, labels: t => t.nk.contacts.subjects,
        }),
        surname: newInputWidget({ label: t => t.nk.contacts.surname, autocapitalize: 'words' }),
        name: newInputWidget({ label: t => t.nk.contacts.name, autocapitalize: 'words' }),
        _search: newSearchWidget<ContextNK, Address, true>({
            label: t => t.in.searchAddress, hideInRawData: true, getSearchItem: i => ({
                pieces: [{ text: i.house, width: .5 }, { text: i.postalCode, width: .1 }, { text: i.city, width: .4 }]
            }), search: ruian.suggest, onValueSet: (c, a) => {
                c.v.contacts.street = a?.house ?? '';
                c.v.contacts.zip = a?.postalCode ?? '';
                c.v.contacts.city = a?.city ?? '';
            }, required: false,
        }),
        street: newInputWidget({ required: false, label: t => t.nk.contacts.street, autocapitalize: 'sentences' }),
        city: newInputWidget({ required: false, label: t => t.nk.contacts.city, autocapitalize: 'words' }),
        zip: newInputWidget({
            required: false, label: t => t.nk.contacts.zip, inputmode: 'numeric',
            onError: t => t.wrong.zip, regex: /^\d{3} \d{2}$/, maskOptions: { mask: `000 00` },
        }),
        phone: newInputWidget({ required: false, label: t => t.nk.contacts.phone, inputmode: 'tel' }),
        email: newInputWidget({ required: false, label: t => t.nk.contacts.email, type: 'email', inputmode: 'email' }),
        assemblyCompanySearch: newSearchWidget<ContextNK, Company, true>({
            label: t => t.nk.contacts.searchCompanyInList, items: assemblyCompanies, getSearchItem: i => ({
                pieces: [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (c, company) => {
                if (company) {
                    c.v.contacts.assemblyCompanyCRN = company.crn;
                    c.v.contacts.assemblyCompanySearch = null;
                }
            },
        }),
        assemblyCompanyCRN: newInputWidget({ required: false, label: t => t.nk.contacts.crn, type: 'number', inputmode: 'numeric' }),
        _chosen: newTextWidget<ContextNK>({
            text: async (t, c) => {
                const company = await ares.getName(c.v.contacts.assemblyCompanyCRN);
                return company ? `${t.in.chosenCompany}: ${company}` : '';
            }, showInXML: false,
        }),
        note: newInputWidget({ required: false, label: t => t.nk.note }),
    },
    photovoltaicPowerPlant: {
        title: newTitleWidget({ show: fve, text: t => t.nk.fve.fve, level: 2 }),
        titleCurrent: newTitleWidget({ show: fve, text: t => t.nk.fve.currentSituation, level: 3 }),
        currentHeating: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.currentHeating }),
        currentHotWater: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.currentHotWater }),
        currentTanks: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.currentTanks }),
        currentConsumption: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.currentConsumption }),
        breakerSize: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.breakerSize }),
        tariff: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.tariff }),
        breakerBoxLocation: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.breakerBoxLocation }),
        titleRequirements: newTitleWidget({ show: fve, text: t => t.nk.fve.requirements, level: 3 }),
        requiredPower: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.requiredPower }),
        locationBuildingType: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.locationBuidingType }),
        info: newTextWidget({ show: fve, text: t => t.nk.fve.familyHouseEtc }),
        lightningRod: newCheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.lightningRod }),
        roofMaterial: newInputWidget({
            suggestions: t => readable([
                t.nk.fve.tile, t.nk.fve.metalSheetFolded, t.nk.fve.metalSheetTrapezoidal,
                t.nk.fve.foil, t.nk.fve.asphaltShingle,
            ]), label: t => t.nk.fve.roofMaterial, required: false, show: fve,
        }),
        tileType: newInputWidget({
            required: false, label: t => t.nk.fve.tileType, show: c => fve(c) && languageCodes.map(
                l => getTranslations(l).nk.fve.tile.toLowerCase(),
            ).includes(c.v.photovoltaicPowerPlant.roofMaterial.toLowerCase()),
        }),
        roofAge: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.roofAge }),
        useOptimizers: newCheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.useOptimizers }),
        titleAreas: newTextWidget({ show: fve, text: t => t.nk.fve.avaiableAreas }),
        size1: newInputWidget({ show: fve, label: t => t.nk.fve.size(1), required: false }),
        orientation1: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(1) }),
        slope1: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(1) }),
        size2: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.size(2) }),
        orientation2: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(2) }),
        slope2: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(2) }),
        size3: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.size(3) }),
        orientation3: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(3) }),
        slope3: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(3) }),
        size4: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.size(4) }),
        orientation4: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.orientation(4) }),
        slope4: newInputWidget({ show: fve, required: false, label: t => t.nk.fve.slope(4) }),
        battery: newCheckboxWithInputWidget({
            required: false,
            label: t => t.nk.fve.battery, otherLabel: t => t.nk.fve.batteryCapacity,
            show: fve,
        }),
        water: newCheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.water }),
        network: newCheckboxWithInputWidget({
            label: t => t.nk.fve.network, otherLabel: t => t.nk.fve.networkPower,
            required: false,
            show: fve,
        }),
        charging: newCheckboxWidget({ show: fve, required: false, label: t => t.nk.fve.charging }),
        note: newInputWidget({ show: fve, required: false, label: t => t.nk.note }),
    },
    objectDetails: {
        title: newTitleWidget({ show: hp, text: t => t.nk.objectDetail.objectDetail, level: 2 }),
        heatLost: newInputWidget({
            show: hp, required: false, label: t => t.nk.objectDetail.heatLoss, suffix: t => t.units.kW, type: 'number', inputmode: 'decimal',
        }),
        heatNeedsForHeating: newInputWidget({
            required: false,
            label: t => t.nk.objectDetail.heatNeedsForHeating,
            suffix: t => t.units.kWh,
            type: 'number',
            inputmode: 'numeric',
            show: hp,
        }),
        heatNeedsForHotWater: newInputWidget({
            required: false,
            label: t => t.nk.objectDetail.heatNeedsForHotWater,
            suffix: t => t.units.kWh,
            type: 'number',
            inputmode: 'numeric',
            show: hp,
        }),
        heatedArea: newInputWidget({
            show: hp, required: false, label: t => t.nk.objectDetail.area, suffix: t => t.units.m2, type: 'number', inputmode: 'numeric',
        }),
        heatedVolume: newInputWidget({
            show: hp, required: false, label: t => t.nk.objectDetail.volume, suffix: t => t.units.m3, type: 'number', inputmode: 'numeric',
        }),
        heatingCosts: newInputWidget({
            required: false, label: t => t.nk.objectDetail.costs, suffix: t => t.nk.currency, type: 'number', inputmode: 'decimal', show: hp,
        }),
        fuelType: newInputWidget({ show: hp, required: false, label: t => t.nk.objectDetail.type }),
        fuelConsumption: newInputWithChooserWidget({
            required: false, label: t => t.nk.objectDetail.usage, chosen: `q`, options: [`q`, `m3`, `kWh`], show: hp, labels: t => t.units,
        }),
        fuelType2: newInputWidget({ show: hp, required: false, label: t => t.nk.objectDetail.type2 }),
        fuelConsumption2: newInputWithChooserWidget({
            required: false,
            label: t => t.nk.objectDetail.usage2,
            chosen: `q`,
            options: [`q`, `m3`, `kWh`],
            show: hp,
            labels: t => t.units,
        }),
        note: newInputWidget({ show: hp, required: false, label: t => t.nk.note }),
    },
    system: {
        title: newTitleWidget({ show: hp, text: t => t.nk.system.system, level: 2 }),
        hPType: newRadioWidget({
            show: hp,
            required: false,
            label: t => t.nk.system.heatPumpType,
            chosen: `airToWater`,
            options: [`airToWater`, `groundToWater`],
            labels: t => t.nk.system,
        }),
        hPModel: newChooserWidget({
            required: false,
            label: t => t.nk.system.heatPumpModel,
            show: hp,
            options: c => [`iDoNotKnow`, ...c.v.system.hPType == 'airToWater'
                ? [...heatPumps.airToWaterRTC[0], ...heatPumps.airToWaterCTC[0]] : heatPumps.groundToWaterCTC[0]],
            otherOptions: c => c.v.system.hPType == 'airToWater'
                ? [...heatPumps.airToWaterRTC[1], ...heatPumps.airToWaterCTC[1], ...heatPumps.multiEnergyCTC[0], ...heatPumps.multiEnergyCTC[1]] : heatPumps.groundToWaterCTC[1],
            chosen: `iDoNotKnow`,
            labels: t => t.nk.system,
        }),
        indoorUnitType: newChooserWidget({
            required: false,
            label: t => t.nk.system.indoorUnitType,
            chosen: `indoorUnitNone`,
            options: [`indoorUnitNone`, ...indoorUnits],
            show: hp,
            labels: t => t.nk.system,
        }),
        thermalStore: newInputWidget({
            label: t => t.tc.typeOfStorageTank, show: hp, required: false, suggestions: accumulationTanks,
        }),
        waterTank: newInputWidget({
            label: t => t.tc.typeOfStorageTank, show: hp, required: false, suggestions: waterTanks,
        }),
        heatingSystem: newChooserWidget({
            required: false, label: t => t.nk.system.heatingSystem, show: hp, chosen: `iDoNotKnow`, options: [
                `iDoNotKnow`, `heatingSystem1circuit`, `heatingSystem2circuits`,
                `heatingSystem3circuits`, `heatingSystemInvertor`, `heatingSystemOther`,
            ], labels: t => t.nk.system,
        }),
        hotWaterCirculation: newCheckboxWidget({ show: hp, required: false, label: t => t.nk.system.hotWaterCirculation }),
        wantsPool: newCheckboxWidget({ show: hp, required: false, label: t => t.nk.system.poolHeating }),
        note: newInputWidget({ show: hp, required: false, label: t => t.nk.note }),
    },
    pool: {
        title: newTitleWidget({ show: pool, text: t => t.nk.pool.pool, level: 2 }),
        usagePeriod: newRadioWidget({
            required: false,
            label: t => t.nk.pool.usagePeriod,
            chosen: `periodYearlong`,
            options: [`periodYearlong`, `periodSeasonal`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        placement: newRadioWidget({
            required: false,
            label: t => t.nk.pool.location,
            chosen: `locationOutdoor`,
            options: [`locationOutdoor`, `locationIndoor`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        waterType: newRadioWidget({
            required: false,
            label: t => t.nk.pool.waterType,
            chosen: `freshType`,
            options: [`freshType`, `saltType`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        shape: newRadioWidget({
            required: false,
            label: t => t.nk.pool.shape,
            chosen: `shapeRectangle`,
            options: [`shapeRectangle`, `shapeOval`, `shapeCircle`],
            show: pool,
            labels: t => t.nk.pool,
        }),
        length: newInputWidget({
            required: false, label: t => t.nk.pool.length, suffix: t => t.units.m, type: 'number', inputmode: 'decimal',
            show: c => pool(c) && c.v.pool.shape != `shapeCircle`,
        }),
        width: newInputWidget({
            required: false, label: t => t.nk.pool.width, suffix: t => t.units.m, type: 'number', inputmode: 'decimal',
            show: c => pool(c) && c.v.pool.shape != `shapeCircle`,
        }),
        radius: newInputWidget({
            required: false, label: t => t.nk.pool.radius, suffix: t => t.units.m, type: 'number', inputmode: 'decimal',
            show: c => pool(c) && c.v.pool.shape == `shapeCircle`,
        }),
        depth: newInputWidget({
            show: pool,
            required: false,
            label: t => t.nk.pool.depth,
            suffix: t => t.units.m,
            type: 'number',
            inputmode: 'decimal',
        }),
        coverage: newRadioWidget({
            required: false,
            label: t => t.nk.pool.coverage,
            show: pool,
            chosen: `coverageNone`,
            options: [`coverageNone`, `coverageSolid`, `coveragePolycarbonate`, `coverageOther`],
            labels: t => t.nk.pool,
        }),
        desiredTemperature: newInputWidget({
            required: false,
            label: t => t.nk.pool.temperature,
            suffix: t => t.units.degreeCelsius,
            type: 'number',
            inputmode: 'numeric',
            show: pool,
        }),
        note: newInputWidget({ show: pool, required: false, label: t => t.nk.note }),
    },
    additionalSources: {
        title: newTitleWidget({ show: hp, text: t => t.nk.additionalSources.sources, level: 2 }),
        heatingTitle: newTitleWidget({ show: hp, text: t => t.nk.additionalSources.heating, level: 3 }),
        heatingHeatingElementInStore: newCheckboxWithChooserWidget({
            required: false, label: t => t.nk.additionalSources.heatingElement, chosen: `newNeuter`, show: hp,
            options: [`existing`, `newNeuter`],
            labels: t => t.nk.additionalSources,
        }),
        heatingElectricBoiler: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.electricBoiler,
            show: hp,
            chosen: `existing`,
            options: [`existing`, `newMasculine`],
            labels: t => t.nk.additionalSources,
        }),
        heatingGasBoiler: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.gasBoiler,
            show: hp,
            chosen: `existing`,
            options: [`existing`, `newMasculine`],
            labels: t => t.nk.additionalSources,
        }),
        heatingFireplace: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.fireplace,
            show: hp,
            chosen: `existing`,
            options: [`existing`, `newMasculine`],
            labels: t => t.nk.additionalSources,
        }),
        heatingOther: newInputWidget({ show: hp, required: false, label: t => t.nk.additionalSources.otherSource }),
        hotWaterTitle: newTitleWidget({ show: hp, text: t => t.nk.additionalSources.hotWater, level: 3 }),
        hotWaterHeatingElementInStore: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.additionalSources.heatingElement,
            show: hp,
            chosen: `toSocket`,
            options: [`toSocket`, `fromRegulation`],
            labels: t => t.nk.additionalSources,
        }),
        hotWaterElectricBoiler: newCheckboxWidget({ show: hp, required: false, label: t => t.nk.additionalSources.electricBoiler }),
        hotWaterGasBoiler: newCheckboxWidget({ show: hp, required: false, label: t => t.nk.additionalSources.gasBoiler }),
        hotWaterFireplace: newCheckboxWidget({ show: hp, required: false, label: t => t.nk.additionalSources.fireplace }),
        hotWaterOther: newInputWidget({ show: hp, required: false, label: t => t.nk.additionalSources.otherSource }),
        note: newInputWidget({ show: hp, required: false, label: t => t.nk.note }),
    },
    accessories: {
        title: newTitleWidget({ text: t => t.nk.accessories.accessories, level: 2 }),
        hose: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.accessories.hose,
            chosen: '500 mm',
            options: ['300 mm', '500 mm', '700 mm', '1000 mm'],
        }),
        heatingCable: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.accessories.heatingCable,
            chosen: '2,5 m',
            options: ['2,5 m', '3,5 m', '5 m'],
        }),
        wallSupportBracket: newCheckboxWithChooserWidget({
            required: false,
            label: t => t.nk.accessories.wallSupportBracket,
            chosen: `onWall`,
            options: [`onWall`, `onIsolatedWall`],
            labels: t => t.nk.accessories,
        }),
        roomUnitsAndSensors: newCountersWidget({
            label: t => t.nk.accessories.roomUnitsAndSensors,
            counts: {
                'RC 25': 0,
                'RDC': 0,
                'RS 10': 0,
                'RSW 30 - WiFi': 0,
            },
            max: c => ({
                'heatingSystem1circuit': 1, 'heatingSystem2circuits': 2,
                'heatingSystem3circuits': 3, 'heatingSystemInvertor': 1,
            }[c.v.system.heatingSystem as string] ?? Number.POSITIVE_INFINITY),
        }),
        note: newInputWidget({ required: false, label: t => t.nk.note }),
    },
    other: {
        representative: newSearchWidget<ContextNK, Person>({
            label: t => t.nk.representative, getSearchItem: t => ({
                pieces: [
                    { text: t.responsiblePerson!, width: .4 },
                    { text: t.koNumber!, width: .1 },
                    { text: t.email, width: .5 },
                ],
            }), show: false, required: true, items: (_, c) => derived([usersList, currentUser], ([$users, $currentUser]) => {
                const withKO = $users.filter(p => p.koNumber && p.responsiblePerson);
                const me = withKO.find(t => $currentUser?.email == t.email);
                if (me) c.v.other.representative = me;
                return withKO
                    .filter(p => p.email.endsWith('cz'))
                    .sort((a, b) => a.responsiblePerson!.split(' ').at(-1)!
                        .localeCompare(b.responsiblePerson!.split(' ').at(-1)!));
            }),
        }),
        photos: newPhotoSelectorWidget({
            label: t => t.nk.photos, required: false, multiple: true, max: 5,
        }),
    },
});