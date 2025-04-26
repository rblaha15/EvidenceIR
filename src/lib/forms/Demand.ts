import { type Form, type Raw } from '$lib/forms/Form';
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
    p,
    SearchWidget, type SeCh,
    TextWidget,
    TitleWidget
} from '$lib/Widget.svelte';
import { type Company, type FriendlyCompanies, getIsOnline, startTechniciansListening, type Technician, techniciansList } from '$lib/client/realtime';
import { version, dev, browser } from '$app/environment';
import products from '$lib/helpers/products';
import { languageCodes } from '$lib/languages';
import { getTranslations, type Translations } from '$lib/translations';
import type { User } from 'firebase/auth';
import type { DetachedFormInfo } from '$lib/forms/forms.svelte';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { sendEmail, SENDER } from '$lib/client/email';
import { page } from '$app/state';
import { companies } from '$lib/helpers/companies';
import MailDemand from '$lib/emails/MailDemand.svelte';

interface Demand extends Form<Demand> {
    contacts: {
        title: TitleWidget<Demand>
        demandOrigin: ChooserWidget<Demand>
        demandSubject: MultiCheckboxWidget<Demand>
        surname: InputWidget<Demand>
        name: InputWidget<Demand>
        street: InputWidget<Demand>
        city: InputWidget<Demand>
        zip: InputWidget<Demand>
        phone: InputWidget<Demand>
        email: InputWidget<Demand>
        assemblyCompanySearch: SearchWidget<Demand, Company, true>
        assemblyCompanyCRN: InputWidget<Demand>
        note: InputWidget<Demand>
    };
    photovoltaicPowerPlant: {
        title: TitleWidget<Demand>
        titleCurrent: TitleWidget<Demand>
        currentHeating: InputWidget<Demand>
        currentHotWater: InputWidget<Demand>
        currentTanks: InputWidget<Demand>
        currentConsumption: InputWidget<Demand>
        breakerSize: InputWidget<Demand>
        tariff: InputWidget<Demand>
        breakerBoxLocation: InputWidget<Demand>
        titleRequirements: TitleWidget<Demand>
        requiredPower: InputWidget<Demand>
        locationBuildingType: InputWidget<Demand>
        info: TextWidget<Demand>
        lightningRod: CheckboxWidget<Demand>
        roofMaterial: InputWithSuggestionsWidget<Demand>
        tileType: InputWidget<Demand>
        roofAge: InputWidget<Demand>
        useOptimizers: CheckboxWidget<Demand>
        titleAreas: TextWidget<Demand>
        size1: InputWidget<Demand>
        orientation1: InputWidget<Demand>
        slope1: InputWidget<Demand>
        size2: InputWidget<Demand>
        orientation2: InputWidget<Demand>
        slope2: InputWidget<Demand>
        size3: InputWidget<Demand>
        orientation3: InputWidget<Demand>
        slope3: InputWidget<Demand>
        size4: InputWidget<Demand>
        orientation4: InputWidget<Demand>
        slope4: InputWidget<Demand>
        battery: CheckboxWithInputWidget<Demand>
        water: CheckboxWidget<Demand>
        network: CheckboxWithInputWidget<Demand>
        charging: CheckboxWidget<Demand>
        note: InputWidget<Demand>
    };
    objectDetails: {
        title: TitleWidget<Demand>
        heatLost: InputWidget<Demand>
        heatNeedsForHeating: InputWidget<Demand>
        heatNeedsForHotWater: InputWidget<Demand>
        heatedArea: InputWidget<Demand>
        heatedVolume: InputWidget<Demand>
        heatingCosts: InputWidget<Demand>
        fuelType: InputWidget<Demand>
        fuelConsumption: InputWithChooserWidget<Demand>
        fuelType2: InputWidget<Demand>
        fuelConsumption2: InputWithChooserWidget<Demand>
        note: InputWidget<Demand>
    };
    system: {
        title: TitleWidget<Demand>
        hPType: ChooserWidget<Demand>
        hPModel: ChooserWidget<Demand>
        indoorUnitType: ChooserWidget<Demand>
        thermalStoreType: DoubleChooserWidget<Demand>
        thermalStoreVolume: InputWidget<Demand>
        waterTankType: ChooserWidget<Demand>
        waterTankVolume: InputWidget<Demand>
        heatingSystem: ChooserWidget<Demand>
        hotWaterCirculation: CheckboxWidget<Demand>
        wantsPool: CheckboxWidget<Demand>
        note: InputWidget<Demand>
    };
    pool: {
        title: TitleWidget<Demand>
        usagePeriod: ChooserWidget<Demand>
        placement: ChooserWidget<Demand>
        waterType: ChooserWidget<Demand>
        shape: ChooserWidget<Demand>
        width: InputWidget<Demand>
        length: InputWidget<Demand>
        radius: InputWidget<Demand>
        depth: InputWidget<Demand>
        coverage: ChooserWidget<Demand>
        desiredTemperature: InputWidget<Demand>
        note: InputWidget<Demand>
    };
    additionalSources: {
        title: TitleWidget<Demand>
        heatingTitle: TitleWidget<Demand>
        heatingHeatingElementInStore: CheckboxWithChooserWidget<Demand>
        heatingElectricBoiler: CheckboxWithChooserWidget<Demand>
        heatingGasBoiler: CheckboxWithChooserWidget<Demand>
        heatingFireplace: CheckboxWithChooserWidget<Demand>
        heatingOther: InputWidget<Demand>
        hotWaterTitle: TitleWidget<Demand>
        hotWaterHeatingElementInStore: CheckboxWithChooserWidget<Demand>
        hotWaterElectricBoiler: CheckboxWidget<Demand>
        hotWaterGasBoiler: CheckboxWidget<Demand>
        hotWaterFireplace: CheckboxWidget<Demand>
        hotWaterOther: InputWidget<Demand>
        note: InputWidget<Demand>
    };
    accessories: {
        title: TitleWidget<Demand>
        hose: CheckboxWithChooserWidget<Demand>
        heatingCable: CheckboxWithChooserWidget<Demand>
        wallSupportBracket: CheckboxWithChooserWidget<Demand>
        roomUnitsAndSensors: CountersWidget<Demand>
        note: InputWidget<Demand>
    };
    other: {
        representative: SearchWidget<Demand, Technician>
    };
}

const origins = {
    ...{
        'demand.contacts.originQuestionEmail': '_dotazEmail',
        'demand.contacts.originQuestionExhibition': '_dotaznikVYS',
        'demand.contacts.originQuestionInPerson': '_dotazOsobně',
        'demand.contacts.originDistributionCompany': '_poptávkaDis',
        'demand.contacts.originAssembleres': '_poptávkaMF',
        [`demand.contacts.originDesigner`]: '_poptávkaPROJ',
    }, ...(!dev ? {}
            : { [p`Zkoušení funkčnosti aplikace, prosím, nepoužívejte tuto možnost v reálných poptávkách (DEBUG)`]: '' } as const
    )
} as const;

const fve = (d: Demand) => d.contacts.demandSubject.value.includes(`demand.contacts.fve`);
const hp = (d: Demand) => d.contacts.demandSubject.value.includes(`demand.contacts.heatPump`);
const pool = (d: Demand) => hp(d) && d.system.wantsPool.value;

const defaultDemand = (): Demand => ({
    contacts: {
        title: new TitleWidget({ text: `demand.contacts.contacts` }),
        demandOrigin: new ChooserWidget({ options: origins.keys(), required: true, label: `demand.contacts.demandOrigin` }),
        demandSubject: new MultiCheckboxWidget({
            options: [`demand.contacts.heatPump`, `demand.contacts.fve`], label: `demand.contacts.demandSubject`, required: false,
        }),
        surname: new InputWidget({ required: false, label: `demand.contacts.surname`, autocapitalize: 'words' }),
        name: new InputWidget({ required: false, label: `demand.contacts.name`, autocapitalize: 'words' }),
        street: new InputWidget({ required: false, label: `demand.contacts.street`, autocapitalize: 'sentences' }),
        city: new InputWidget({ required: false, label: `demand.contacts.city`, autocapitalize: 'words' }),
        zip: new InputWidget({
            required: false, label: `demand.contacts.zip`, type: 'number', inputmode: 'numeric',
            onError: `wrongZIPFormat`, regex: /^\d{3} \d{2}$/, maskOptions: { mask: `000 00` },
        }),
        phone: new InputWidget({ required: false, label: `demand.contacts.phone`, inputmode: 'tel' }),
        email: new InputWidget({ required: false, label: `demand.contacts.email`, type: 'email', inputmode: 'email' }),
        assemblyCompanySearch: new SearchWidget<Demand, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                if (company)
                    d.contacts.assemblyCompanyCRN.setValue(d, company.crn);
            }
        }),
        assemblyCompanyCRN: new InputWidget({ required: false, label: `demand.contacts.crn`, type: 'number', inputmode: 'numeric' }),
        note: new InputWidget({ required: false, label: `note`, }),
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
                l => getTranslations(l).demand.fve.tile.toLowerCase()
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
            required: false, label: d => d.photovoltaicPowerPlant.battery.value.checked ? `demand.fve.batteryCapacity` : `demand.fve.battery`, show: fve,
        }),
        water: new CheckboxWidget({ show: fve, required: false, label: `demand.fve.water` }),
        network: new CheckboxWithInputWidget({
            label: d => d.photovoltaicPowerPlant.network.value.checked ? `demand.fve.networkPower` : `demand.fve.network`, required: false, show: fve,
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
            required: false, label: `demand.objectDetail.heatNeedsForHeating`, suffix: `units.kWh`, type: 'number', inputmode: 'numeric', show: hp,
        }),
        heatNeedsForHotWater: new InputWidget({
            required: false, label: `demand.objectDetail.heatNeedsForHotWater`, suffix: `units.kWh`, type: 'number', inputmode: 'numeric', show: hp,
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
            required: false, label: `demand.objectDetail.usage`, options: [`units.q`, `units.m3`, `units.kWh`], show: hp,
        }),
        fuelType2: new InputWidget({ show: hp, required: false, label: `demand.objectDetail.type2` }),
        fuelConsumption2: new InputWithChooserWidget({
            required: false, label: `demand.objectDetail.usage2`, options: [`units.q`, `units.m3`, `units.kWh`], show: hp,
        }),
        note: new InputWidget({ show: hp, required: false, label: `note` }),
    },
    system: {
        title: new TitleWidget({ show: hp, text: `demand.system.system` }),
        hPType: new ChooserWidget({ show: hp, required: false, label: `heatPumpType`, options: [`airToWater`, `groundToWater`] }),
        hPModel: new ChooserWidget({
            required: false, label: `heatPumpModel`, show: hp, options: d => d.system.hPType.value == 'airToWater'
                ? [...products.heatPumpsRTC, ...products.heatPumpsAirToWaterCTC] : products.heatPumpsGroundToWater,
        }),
        indoorUnitType: new ChooserWidget({
            required: false, label: `demand.system.indoorUnitType`, options: [`demand.system.indoorUnitNone`, ...products.indoorUnits], show: hp,
        }),
        thermalStoreType: new DoubleChooserWidget({
            required: false, label: `demand.system.storeType`, options1: [`demand.system.storeNone`, ...products.thermalStores.keys()], show: hp,
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
            required: false, label: `demand.system.tankType`, options: [`demand.system.tankNone`, ...products.waterTanks], show: hp,
        }),
        waterTankVolume: new InputWidget({
            required: false, label: `demand.system.tankVolume`, suffix: `units.dm3`, type: 'number', inputmode: 'numeric',
            show: d => hp(d) && d.system.waterTankType.value != `demand.system.tankNone`,
        }),
        heatingSystem: new ChooserWidget({
            required: false, label: `demand.system.heatingSystem`, show: hp, options: [
                `demand.system.heatingSystem1circuit`, `demand.system.heatingSystem2circuits`, `demand.system.heatingSystem3circuits`,
                `demand.system.heatingSystemInvertor`, `demand.system.heatingSystemOther`,
            ],
        }),
        hotWaterCirculation: new CheckboxWidget({ show: hp, required: false, label: `demand.system.hotWaterCirculation` }),
        wantsPool: new CheckboxWidget({ show: hp, required: false, label: `demand.system.poolHeating` }),
        note: new InputWidget({ show: hp, required: false, label: `note` }),
    },
    pool: {
        title: new TitleWidget({ show: pool, text: `demand.pool.pool` }),
        usagePeriod: new ChooserWidget({
            required: false, label: `demand.pool.usagePeriod`, options: [`demand.pool.periodYearlong`, `demand.pool.periodSeasonal`], show: pool,
        }),
        placement: new ChooserWidget({
            required: false, label: `demand.pool.location`, options: [`demand.pool.locationOutdoor`, `demand.pool.locationIndoor`], show: pool,
        }),
        waterType: new ChooserWidget({
            required: false, label: `demand.pool.waterType`, options: [`demand.pool.freshType`, `demand.pool.saltType`], show: pool,
        }),
        shape: new ChooserWidget({
            required: false,
            label: `demand.pool.shape`,
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
        depth: new InputWidget({ show: pool, required: false, label: `demand.pool.depth`, suffix: `units.m`, type: 'number', inputmode: 'decimal' }),
        coverage: new ChooserWidget({
            required: false, label: `demand.pool.coverage`, show: pool,
            options: [`demand.pool.coverageNone`, `demand.pool.coverageSolid`, `demand.pool.coveragePolycarbonate`, `demand.pool.coverageOther`],
        }),
        desiredTemperature: new InputWidget({
            required: false, label: `demand.pool.temperature`, suffix: `units.degreeCelsius`, type: 'number', inputmode: 'numeric', show: pool,
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
            required: false, label: `demand.additionalSources.electricBoiler`, show: hp,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newMasculine`],
        }),
        heatingGasBoiler: new CheckboxWithChooserWidget({
            required: false, label: `demand.additionalSources.gasBoiler`, show: hp,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newMasculine`],
        }),
        heatingFireplace: new CheckboxWithChooserWidget({
            required: false, label: `demand.additionalSources.fireplace`, show: hp,
            options: [`demand.additionalSources.existing`, `demand.additionalSources.newMasculine`],
        }),
        heatingOther: new InputWidget({ show: hp, required: false, label: `demand.additionalSources.otherSource` }),
        hotWaterTitle: new TitleWidget({ show: hp, text: `demand.additionalSources.hotWater` }),
        hotWaterHeatingElementInStore: new CheckboxWithChooserWidget({
            required: false, label: `demand.additionalSources.heatingElement`, show: hp,
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
            required: false, label: `demand.accessories.hose`, chosen: p`500 mm`, options: [p`300 mm`, p`500 mm`, p`700 mm`, p`1000 mm`],
        }),
        heatingCable: new CheckboxWithChooserWidget({ required: false, label: `demand.accessories.heatingCable`, options: [p`3,5 m`, p`5 m`] }),
        wallSupportBracket: new CheckboxWithChooserWidget({
            required: false, label: `demand.accessories.wallSupportBracket`, options: [`demand.accessories.onWall`, `demand.accessories.onIsolatedWall`],
        }),
        roomUnitsAndSensors: new CountersWidget({
            label: `demand.accessories.roomUnitsAndSensors`, options: [p`RC 25`, p`RDC`, p`RS 10`, p`RSW 30 - WiFi`], counts: [0, 0, 0, 0], max: d => ({
                'demand.system.heatingSystem1circuit': 1, 'demand.system.heatingSystem2circuits': 2,
                'demand.system.heatingSystem3circuits': 3, 'demand.system.heatingSystemInvertor': 1,
            }[d.system.heatingSystem.value as string] ?? Number.POSITIVE_INFINITY),
        }),
        note: new InputWidget({ required: false, label: `note` }),
    },
    other: {
        representative: new SearchWidget<Demand, Technician>({
            label: `representative`, items: [], getSearchItem: t => ({
                pieces: [
                    { text: p`${t.name}`, width: .4 },
                    { text: p`${t.koNumber}`, width: .1 },
                    { text: p`${t.email}`, width: .5 },
                ],
            }), show: false, required: true,
        })
    },
});

const fveR = (d: Raw<Demand>) => d.contacts.demandSubject.includes(`demand.contacts.fve`);
const hpR = (d: Raw<Demand>) => d.contacts.demandSubject.includes(`demand.contacts.heatPump`);
const poolR = (d: Raw<Demand>) => hpR(d) && d.system.wantsPool;

const seCh = (t: Translations, v: SeCh) => v.checked ? t.get(v.chosen ?? '') : t.no

const xml = (d: Raw<Demand>, user: User, t: Translations, dem: Demand) => `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="dotaznik_app.xsl"?>

<!-- 
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 3.0 (Zaveden ve verzi aplikace 5.1.1 (Android) a 1.2.0 (SEIR))
Verze aplikace: 1.2.0 (${version}) (${dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'})
-->

<!--
Změny ve verzi 3.0 oproti verzi 2.3:
- Přidána všechna pole "řeší" v sekci /xml/system
  - Né každá poptávka nyní řeší TČ
- Přidána fotovoltaická elektrárna
  - Přidána sekce /xml/fve - pouze pokud je poptávána
  - Sekce  /xml/detailobjektu, /xml/tc, /xml/zdrojeTop, /xml/tv, /xml/zdrojeTV, /xml/bazen, /xml/prislusenstvi jsou zahrnuty pouze pokud je poptávané TČ
  - Přidána poznámka k FVE (/xml/poznamka/fve)
-->

<!--
Změny ve verzi 2.3 oproti verzi 2.2:
- Přidán kód1 (/xml/system/kod1)
  - Možnosti jsou: _dotazEmail, _dotaznikVYS, _dotazOsobně, _poptávkaDis, _poptávkaMF, _poptávkaPROJ 
  - V DEBUG verzi aplikace lze zadat i možnost _debug, ta by se ale nikdy neměla objevit v opravdových poptávkách
- Pokojová čidla a jednotky sjednoceny do jednoho pole (/xml/prislusenstvi/pokojova_cidla_a_jednotky)
  - Nyní mohou obsahovat více možností, oddělených čárkou
  - Každá možnost má před sebou vždy specifikován počet položek pomocí písmene x 
  - Název žádné jednotky ani čidla neobsahuje čárku
  - Příklad: \`<pokojove_cidlo>1x RS 10, 2x RDC</pokojove_cidlo>\`
-->

<xml>
    <system>
        <kod1>${t.get(d.contacts.demandOrigin!)}</kod1>
        <resi_tc>${hpR(d) ? t.yes : t.no}</resi_tc>
        <resi_fve>${fveR(d) ? t.yes : t.no}</resi_fve>
        <resi_sol>${d.strings.no}</resi_sol>
        <resi_rek>${d.strings.no}</resi_rek>
        <resi_krb>${d.strings.no}</resi_krb>
        <resi_konz>${d.strings.no}</resi_konz>
        <resi_jine>${d.strings.no}</resi_jine>
        <resi_jine_uvedte>${d.strings.no}</resi_jine_uvedte>
        <resi_doporuc>${d.strings.no}</resi_doporuc>
        <cislo_ko>${d.other.representative!.koNumber}</cislo_ko>
        <odesilatel>${user.email}</odesilatel>
    </system>
    <kontakt>
        <jmeno>${d.contacts.name}</jmeno>
        <prijmeni>${d.contacts.surname}</prijmeni>
        <telefon>${d.contacts.phone}</telefon>
        <email>${d.contacts.email}</email>
        <ulice>${d.contacts.street}</ulice>
        <psc>${d.contacts.zip}</psc>
        <mesto>${d.contacts.city}</mesto>
        <partner_ico>${d.contacts.assemblyCompanyCRN}</partner_ico>
    </kontakt>${hpR(d) ? `
    <detailobjektu>
        <os_popis>${t.get(d.system.heatingSystem ?? '')}</os_popis>
        <tepelna_ztrata>${d.objectDetails.heatLost}</tepelna_ztrata>
        <rocni_spotreba_vytapeni>${d.objectDetails.heatNeedsForHeating}</rocni_spotreba_vytapeni>
        <rocni_spotreba_tv>${d.objectDetails.heatNeedsForHotWater}</rocni_spotreba_tv>
        <vytapena_plocha>${d.objectDetails.heatedArea}</vytapena_plocha>
        <vytapeny_objem>${d.objectDetails.heatedVolume}</vytapeny_objem>
        <spotreba_paliva_druh>${d.objectDetails.fuelType}</spotreba_paliva_druh>
        <spotreba_paliva_mnozstvi>${d.objectDetails.fuelConsumption.text}</spotreba_paliva_mnozstvi>
        <spotreba_paliva_jednotky>${t.get(d.objectDetails.fuelConsumption.chosen ?? '')}</spotreba_paliva_jednotky>
        <spotreba_paliva_2_druh>${d.objectDetails.fuelType2}</spotreba_paliva_2_druh>
        <spotreba_paliva_2_mnozstvi>${d.objectDetails.fuelConsumption2.text}</spotreba_paliva_2_mnozstvi>
        <spotreba_paliva_2_jednotky>${t.get(d.objectDetails.fuelConsumption2.chosen ?? '')}</spotreba_paliva_2_jednotky>
        <rocni_platba_vytapeni>${d.objectDetails.heatingCosts} ${d.strings.currency}</rocni_platba_vytapeni>
    </detailobjektu>
    <tc>
        <typ>${t.get(d.system.hPType ?? '')}</typ>
        <model>${t.get(d.system.hPModel ?? '')}</model>
        <nadrz>${t.get(d.system.thermalStoreType.first ?? '')} ${t.get(d.system.thermalStoreType.second ?? '')} {d.system.thermalStoreVolume}</nadrz>
        <vnitrni_jednotka>${t.get(d.system.indoorUnitType ?? '')}</vnitrni_jednotka>
    </tc>
    <zdrojeTop>
        <topne_teleso>${seCh(t, d.additionalSources.heatingHeatingElementInStore)}</topne_teleso>
        <elektrokotel>${seCh(t, d.additionalSources.heatingElectricBoiler)}</elektrokotel>
        <plyn_kotel>${seCh(t, d.additionalSources.heatingGasBoiler)}</plyn_kotel>
        <krb_KTP>${seCh(t, d.additionalSources.heatingFireplace)}</krb_KTP>
        <jiny_zdroj>${d.additionalSources.heatingOther}</jiny_zdroj>
    </zdrojeTop>
    <tv>
        <zasobnik>${t.get(d.system.waterTankType ?? '')} ${d.system.waterTankVolume}</zasobnik>
        <cirkulace>${d.system.hotWaterCirculation ? t.yes : t.no}</cirkulace>
    </tv>
    <zdrojeTV>
        <topne_teleso>${seCh(t, d.additionalSources.hotWaterHeatingElementInStore)}</topne_teleso>
        <elektrokotel>${d.additionalSources.hotWaterElectricBoiler ? t.yes : t.no}</elektrokotel>
        <plyn_kotel>${d.additionalSources.hotWaterGasBoiler ? t.yes : t.no}</plyn_kotel>
        <krb_KTP>${d.additionalSources.hotWaterFireplace ? t.yes : t.no}</krb_KTP>
        <jiny_zdroj>${d.additionalSources.hotWaterOther}</jiny_zdroj>
    </zdrojeTV>
    <bazen>
        <ohrev>${d.system.wantsPool ? t.yes : t.no}</ohrev>
        <doba_vyuzivani>${poolR(d) ? '' : t.get(d.pool.usagePeriod ?? '')}</doba_vyuzivani>
        <umisteni>${poolR(d) ? '' : t.get(d.pool.placement ?? '')}</umisteni>
        <zakryti>${poolR(d) ? '' : t.get(d.pool.coverage ?? '')}</zakryti>
        <tvar>${poolR(d) ? '' : t.get(d.pool.shape ?? '')}</tvar>
        <sirka>${d.pool.width}</sirka>
        <delka>${d.pool.length}</delka>
        <hloubka>${d.pool.depth}</hloubka>
        <prumer>${d.pool.radius}</prumer>
        <teplota>${d.pool.desiredTemperature}</teplota>
        <voda>${poolR(d) ? '' : t.get(d.pool.waterType ?? '')}</voda>
    </bazen>
    <prislusenstvi>
        <hadice>${seCh(t, d.accessories.hose)}</hadice>
        <topny_kabel>${seCh(t, d.accessories.heatingCable)}</topny_kabel>
        <drzak_na_tc>${seCh(t, d.accessories.wallSupportBracket)}</drzak_na_tc>
        <pokojova_cidla_a_jednotky>${dem.accessories.roomUnitsAndSensors.options(dem)
            .zip(d.accessories.roomUnitsAndSensors)
            .filter(([, c]) => c > 0)
            .map(([k, c]) => `${c}x ${t.get(k)}`)}</pokojova_cidla_a_jednotky>
    </prislusenstvi>` : ''}${fveR(d) ? `
    <fve>
        <stavajici_topeni>${d.photovoltaicPowerPlant.currentHeating}</stavajici_topeni>
        <stavajici_tuv>${d.photovoltaicPowerPlant.currentHotWater}</stavajici_tuv>
        <stavajici_zasobniky>${d.photovoltaicPowerPlant.currentTanks}</stavajici_zasobniky>
        <stavajici_spotreba>${d.photovoltaicPowerPlant.currentConsumption}</stavajici_spotreba>
        <jistic>${d.photovoltaicPowerPlant.breakerSize}</jistic>
        <sazba>${d.photovoltaicPowerPlant.tariff}</sazba>
        <umisteni_rozvadece>${d.photovoltaicPowerPlant.breakerBoxLocation}</umisteni_rozvadece>
        <pozadovany_vykon>${d.photovoltaicPowerPlant.requiredPower}</pozadovany_vykon>
        <typ_budovy_instalace>${d.photovoltaicPowerPlant.locationBuildingType}</typ_budovy_instalace>
        <hromosvod>${d.photovoltaicPowerPlant.lightningRod ? t.yes : t.no}</hromosvod>
        <material_krytiny>${d.photovoltaicPowerPlant.roofMaterial}</material_krytiny>
        <typ_tasek>${d.photovoltaicPowerPlant.tileType}</typ_tasek>
        <stari_krytiny>${d.photovoltaicPowerPlant.roofAge}</stari_krytiny>
        <pouzit_optimizatory>${d.photovoltaicPowerPlant.useOptimizers ? t.yes : t.no}</pouzit_optimizatory>
        <rozmer_1>${d.photovoltaicPowerPlant.size1}</rozmer_1>
        <orientace_1>${d.photovoltaicPowerPlant.orientation1}</orientace_1>
        <sklon_1>${d.photovoltaicPowerPlant.slope1}</sklon_1>
        <rozmer_2>${d.photovoltaicPowerPlant.size2}</rozmer_2>
        <orientace_2>${d.photovoltaicPowerPlant.orientation2}</orientace_2>
        <sklon_2>${d.photovoltaicPowerPlant.slope2}</sklon_2>
        <rozmer_3>${d.photovoltaicPowerPlant.size3}</rozmer_3>
        <orientace_3>${d.photovoltaicPowerPlant.orientation3}</orientace_3>
        <sklon_3>${d.photovoltaicPowerPlant.slope3}</sklon_3>
        <rozmer_4>${d.photovoltaicPowerPlant.size4}</rozmer_4>
        <orientace_4>${d.photovoltaicPowerPlant.orientation4}</orientace_4>
        <sklon_4>${d.photovoltaicPowerPlant.slope4}</sklon_4>
        <baterie>${d.photovoltaicPowerPlant.battery.checked ? t.yes : t.no}</baterie>
        <baterie_kapacita>${d.photovoltaicPowerPlant.battery.text}</baterie_kapacita>
        <voda>${d.photovoltaicPowerPlant.water ? t.yes : t.no}</voda>
        <sit>${d.photovoltaicPowerPlant.network.checked ? t.yes : t.no}</sit>
        <sit_vykon>${d.photovoltaicPowerPlant.network.text}</sit_vykon>
        <dobijeni>${d.photovoltaicPowerPlant.charging ? t.yes : t.no}</dobijeni>
    </fve>` : ''}
    <poznamka>
        <kontakty>${d.contacts.note}</kontakty>
        <detail_objektu>${d.objectDetails.note}</detail_objektu>
        <tv_tc_nadrz_a_os>${d.system.note}</tv_tc_nadrz_a_os>
        <bazen>${d.pool.note}</bazen>
        <doplnkove_zdroje>${d.additionalSources.note}</doplnkove_zdroje>
        <prislusenstvi>${d.accessories.note}</prislusenstvi>
        <fve>${d.photovoltaicPowerPlant.note}</fve>
    </poznamka>
</xml>`;

const demand: DetachedFormInfo<Demand, Demand, [[FriendlyCompanies], [Technician[], User | null]]> = {
    storeName: 'stored_demand',
    defaultData: defaultDemand,
    saveData: async (raw, _, data, editResult, t) => {
        if (!getIsOnline()) {
            editResult({ red: true, text: t.offline, load: false });
            return;
        }

        const user = get(currentUser)!;

        const userAddress = {
            address: user.email!,
            name: user.displayName ?? '',
        };

        const name = raw.contacts.name;
        const surname = raw.contacts.surname;

        const cs = getTranslations('cs');
        const response = await sendEmail({
            from: SENDER,
            replyTo: userAddress,
            to: dev ? 'radek.blaha.15@gmail.com'
                : page.data.languageCode == 'sk' ? 'obchod@regulus.sk' : 'poptavky@regulus.cz',
            cc: dev ? undefined : userAddress,
            subject: `Poptávka z aplikace – OSOBA: ${name} ${surname}`,
            attachments: [{
                content: xml(raw, user, cs, data),
                contentType: 'application/xml',
                filename: `Dotazník ${name} ${surname}.xml`
            }],
            component: MailDemand,
            props: raw.other.representative!,
        });

        if (response!.ok) return true;
        else editResult({
            text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false
        });
    },
    createWidgetData: d => d,
    title: t => t.demand.demandForm,
    onMount: async () => {
        await startTechniciansListening()
    },
    storeEffects: [
        [(_, d, [$companies]) => {
            d.contacts.assemblyCompanySearch.items = () => $companies.assemblyCompanies;
        }, [companies]],
        [(_, d, [$techniciansList, $currentUser]) => {
            const me = $techniciansList.find(t => $currentUser?.email == t.email);
            d.other.representative.items = () => $techniciansList
                .filter(t => t.email.endsWith('cz'))
                .toSorted((a, b) => a.name.split(" ").at(-1)!
                    .localeCompare(b.name.split(" ").at(-1)!));
            d.other.representative.setValue(d, me ?? d.other.representative.value);
            d.other.representative.show = () => !me;
        }, [techniciansList, currentUser]],
    ],
    isSendingEmails: true,
};

export default demand;