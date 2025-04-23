import { type Form } from '$lib/forms/Form';
import type { DetachedFormInfo } from '$lib/forms/forms.svelte';
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
    SearchWidget,
    TextWidget,
    TitleWidget
} from '$lib/Widget.svelte';
import type { Company, FriendlyCompanies } from '$lib/client/realtime';
import { companies } from '$lib/helpers/companies';
import { dev } from '$app/environment';
import products from '$lib/helpers/products';
import { languageCodes } from '$lib/languages';
import { getTranslations } from '$lib/translations';

export interface Demand extends Form<Demand> {
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
    accessories: {
        title: TitleWidget<Demand>
        hose: CheckboxWithChooserWidget<Demand>
        heatingCable: CheckboxWithChooserWidget<Demand>
        wallSupportBracket: CheckboxWithChooserWidget<Demand>
        roomUnitsAndSensors: CountersWidget<Demand>
        note: InputWidget<Demand>
    }
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

const fve = (d: Demand) => d.contacts.demandSubject.value.includes(`demand.contacts.fve`)
const hp = (d: Demand) => d.contacts.demandSubject.value.includes(`demand.contacts.heatPump`)
const pool = (d: Demand) => hp(d) && d.system.wantsPool.value

export const defaultDemand = (): Demand => ({
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
        zip: new InputWidget({ required: false, label: `demand.contacts.zip`, type: 'number', inputmode: 'numeric' }),
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
        assemblyCompanyCRN: new InputWidget({ required: false, label: `demand.contacts.email`, type: 'email', inputmode: 'email' }),
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
})

const demand: DetachedFormInfo<Demand, Demand, [[FriendlyCompanies]]> = {
    storeName: 'stored_demand',
    defaultData: defaultDemand,
    saveData: async (/*raw, edit, data, editResult, t, send*/) => {
        // const irid = extractIRIDFromRawData(raw);
        //
        // if (!edit && irid && getIsOnline() && await existuje(irid)) {
        //     editResult({
        //         red: true, load: false,
        //         text: t.irExistsHtml.parseTemplate({ link: relUrl(`/detail/${irid}`) }),
        //     });
        //     return;
        // }
        // if (!getIsOnline()) {
        //     editResult({ red: true, text: t.offline, load: false });
        //     return;
        // }
        //
        // const user = get(currentUser)!;
        //
        // if (edit) await upravitEvidenci(raw);
        // else await novaEvidence({ evidence: raw, kontroly: {}, users: [user.email!], installationProtocols: [] });
        //
        // const userAddress = {
        //     address: user.email!,
        //     name: user.displayName ?? '',
        // };
        // const doNotSend = edit && (!send || !dev);
        //
        // if (raw.vzdalenyPristup.chce && !doNotSend) {
        //     const t = getTranslations('cs');
        //     const montazka = (await nazevFirmy(raw.montazka.ico)) ?? null;
        //     const uvadec = (await nazevFirmy(raw.uvedeni.ico)) ?? null;
        //
        //     const response = await sendEmail({
        //         from: SENDER,
        //         replyTo: userAddress,
        //         to: dev ? 'radek.blaha.15@gmail.com' : 'david.cervenka@regulus.cz',
        //         subject: `Založení RegulusRoute k ${nazevIR(raw.ir)}`,
        //         attachments: [{
        //             content: generateXML(data, t),
        //             contentType: 'application/xml',
        //             filename: `Evidence ${irid}.xml`
        //         }],
        //         pdf: {
        //             link: `/cs/detail/${irid}/pdf/rroute`,
        //             title: 'Souhlas RegulusRoute.pdf',
        //         },
        //         component: MailRRoute,
        //         props: { e: raw, montazka, uvadec, t },
        //     });
        //     console.log(response);
        // }
        //
        // const response = doNotSend ? undefined : await sendEmail({
        //     from: SENDER,
        //     replyTo: userAddress,
        //     to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
        //     cc: dev ? undefined : userAddress,
        //     subject: edit
        //         ? `Úprava evidence regulátoru ${nazevIR(raw.ir)}`
        //         : `Nově zaevidovaný regulátor ${nazevIR(raw.ir)}`,
        //     component: MailSDaty,
        //     props: { data, t, user, origin: page.url.origin },
        // });
        //
        // if (doNotSend || response!.ok) return true
        // else editResult({
        //     text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
        //     red: true,
        //     load: false
        // });
    },
    createWidgetData: d => d,
    title: t => t.demand.demandForm,
    onMount: async () => {

    },
    storeEffects: [
        [(_, d, [$companies]) => {
            d.contacts.assemblyCompanySearch.items = () => $companies.assemblyCompanies;
        }, [companies]],
    ],
    isSendingEmails: true,
};

export default demand;