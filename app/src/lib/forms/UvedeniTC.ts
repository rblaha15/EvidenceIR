import { type GetOrVal, TitleWidget, InputWidget, SwitchWidget, ChooserWidget, CheckboxWidget } from '../Widget.svelte';
import { uvestTCDoProvozu } from '$lib/client/firestore';
import type { FormInfo } from './forms.svelte';
import type { Form, Raw } from '$lib/forms/Form';
import type { Data } from './Data';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';

export type UDTC = {
    uvedeni: UvedeniTC,
    evidence: Raw<Data>,
}

export class Vyhovuje<D> extends SwitchWidget<D> {
    constructor(args: {
        label: GetOrVal<D>,
        onError?: GetOrVal<D>,
        required?: GetOrVal<D, boolean>,
        show?: GetOrVal<D, boolean>,
        chosen?: boolean,
    }) {
        super({
            chosen: args.chosen ?? false,
            required: args.required ?? false,
            ...args,
            options: [`suitsNot`, `suits`] as const,
            hasPositivity: true,
        });
    }
}

export interface UvedeniTC extends Form<UDTC> {
    tc: {
        nadpis: TitleWidget<UDTC>,
        jisticTC: Vyhovuje<UDTC>,
        jisticVJ: Vyhovuje<UDTC>,
        vzdalenostZdi: Vyhovuje<UDTC>,
        kondenzator: CheckboxWidget<UDTC>,
        filtr: CheckboxWidget<UDTC>,
    },
    nadrze: {
        nadpis: TitleWidget<UDTC>,
        akumulacka: InputWidget<UDTC>,
        zasobnik: InputWidget<UDTC>,
    },
    os: {
        nadpis: TitleWidget<UDTC>,
        tvori: ChooserWidget<UDTC, `radiators` | `underfloorHeating` | `combinationHeating` | `otherHeatingSystem`>,
        popis: InputWidget<UDTC>,
        dzTop: CheckboxWidget<UDTC>,
        typDzTop: InputWidget<UDTC>,
        tcTv: CheckboxWidget<UDTC>,
        zTv: InputWidget<UDTC>,
        objemEnOs: Vyhovuje<UDTC>,
        bazenTc: CheckboxWidget<UDTC>,
    },
    reg: {
        nadpis: TitleWidget<UDTC>,
        pripojeniKInternetu: ChooserWidget<UDTC, `connectedViaRegulusRoute` | `connectedWithPublicIpAddress` | `notConnected`>,
        pospojeni: CheckboxWidget<UDTC>,
        spotrebice: CheckboxWidget<UDTC>,
        zalZdroj: CheckboxWidget<UDTC>,
    },
    primar: {
        nadpis: TitleWidget<UDTC>,
        typ: ChooserWidget<UDTC, `groundBoreholes` | `surfaceCollector` | `otherCollector`>,
        popis: InputWidget<UDTC>,
        nemrz: InputWidget<UDTC>
        nadoba: ChooserWidget<UDTC, `expansionTankInstalled` | `bufferTankInstalled`>,
        kontrola: CheckboxWidget<UDTC>,
    },
    uvadeni: {
        nadpis: TitleWidget<UDTC>,
        tc: CheckboxWidget<UDTC>,
        reg: CheckboxWidget<UDTC>,
        vlastnik: CheckboxWidget<UDTC>,
        typZaruky: ChooserWidget<UDTC, `no` | `yes`>,
        zaruka: CheckboxWidget<UDTC>,
        date: InputWidget<UDTC>,
    },
}

export const defaultUvedeniTC = (): UvedeniTC => ({
    tc: {
        nadpis: new TitleWidget({ text: `heatPump` }),
        jisticTC: new Vyhovuje({ label: `characteristicsAndSizeOfHeatPumpBreaker` }),
        jisticVJ: new Vyhovuje({ show: d => d.evidence.ir.typ.first!.includes('BOX'), label: `characteristicsAndSizeOfIndoorUnitBreaker` }),
        vzdalenostZdi: new Vyhovuje({ label: `distanceFromWall`, show: d => d.evidence.tc.typ == `airToWater` }),
        kondenzator: new CheckboxWidget({
            required: false,
            label: `isCompensatorInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new CheckboxWidget({ required: false, label: `isCirculationPumpFilterInstalled` }),
    },
    nadrze: {
        nadpis: new TitleWidget({ text: `tanks` }),
        akumulacka: new InputWidget({ label: `typeOfAccumulationTank`, required: false }),
        zasobnik: new InputWidget({ label: `typeOfStorageTank`, required: false }),
    },
    os: {
        nadpis: new TitleWidget({ text: `heatingSystem` }),
        tvori: new ChooserWidget({
            label: `heatingSystemConsistsOf`, options: [
                `radiators`,
                `underfloorHeating`,
                `combinationHeating`,
                `otherHeatingSystem`,
            ],
        }),
        popis: new InputWidget({
            label: `heatingSystemDescription`,
            show: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
            required: d => d.uvedeni.os.tvori.value == 'otherHeatingSystem',
        }),
        dzTop: new CheckboxWidget({ required: false, label: `isAdditionalHeatingSourceConnected` }),
        typDzTop: new InputWidget({
            label: `typeAndPowerOfAdditionalHeatingSource`,
            show: d => d.uvedeni.os.dzTop.value,
            required: d => d.uvedeni.os.dzTop.value
        }),
        tcTv: new CheckboxWidget({ required: false, label: `doesHeatPumpPrepareHotWater` }),
        zTv: new InputWidget(
            { label: d => d.uvedeni.os.tcTv.value ? `additionalHotWaterSource` : `mainHotWaterSource`, required: d => !d.uvedeni.os.tcTv.value }),
        objemEnOs: new Vyhovuje({ label: `volumeOfExpansionTank` }),
        bazenTc: new CheckboxWidget({ required: false, label: `isPoolHeatingManagedByHeatPump` }),
    },
    reg: {
        nadpis: new TitleWidget({ text: `controlAndElectricalInstallation` }),
        pripojeniKInternetu: new ChooserWidget({
            label: `internetConnection`, options: [
                `connectedViaRegulusRoute`,
                `connectedWithPublicIpAddress`,
                `notConnected`,
            ],
        }),
        pospojeni: new CheckboxWidget({ required: false, label: `isElectricalBondingComplete` }),
        spotrebice: new CheckboxWidget({ required: false, label: `areElectricalDevicesTested` }),
        zalZdroj: new CheckboxWidget({
            required: false,
            label: `isBackupPowerSourceInstalled`,
            show: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new TitleWidget({
            text: `primaryCircuit`,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
        typ: new ChooserWidget({
            label: `typeOfPrimaryCircuit`,
            options: [
                `groundBoreholes`,
                `surfaceCollector`,
                `otherCollector`,
            ],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        popis: new InputWidget({
            label: d => {
                switch (d.uvedeni.primar.typ.value) {
                    case (`groundBoreholes`):
                        return `numberAndDepthOfBoreholes`;
                    case (`surfaceCollector`):
                        return `numberAndLengthOfCircuits`;
                    default:
                        return `collectorDescription`;
                }
            },
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new InputWidget({
            label: `typeOfAntifreezeMixture`,
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new ChooserWidget({
            label: `onPrimaryCircuitInstalled`,
            options: [`expansionTankInstalled`, `bufferTankInstalled`],
            show: d => d.evidence.tc.typ == 'groundToWater',
            required: d => d.evidence.tc.typ == 'groundToWater',
        }),
        kontrola: new CheckboxWidget({
            required: false,
            label: `wasPrimaryCircuitTested`,
            show: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: `commissioningSteps` }),
        tc: new CheckboxWidget({ required: false, label: `wasInstallationAccordingToManual` }),
        reg: new CheckboxWidget({ required: false, label: `wasControllerSetToParameters` }),
        vlastnik: new CheckboxWidget({ required: false, label: `wasOwnerFamiliarizedWithFunction` }),
        typZaruky: new ChooserWidget({
            label: `isExtendedWarrantyDesired`, options: [`no`, `yes`]
        }),
        zaruka: new CheckboxWidget({
            required: false, label: `isInstallationInWarrantyConditions`,
            show: d => d.uvedeni.uvadeni.typZaruky.value == 'yes'
        }),
        date: new InputWidget({ label: 'dateOfCommission', type: 'date', text: (new Date()).toISOString().split('T')[0] }),
    },
});

export const heatPumpCommission: FormInfo<UDTC, UvedeniTC> = ({
    storeName: 'stored_heat_pump_commission',
    defaultData: defaultUvedeniTC,
    pdfLink: () => 'heatPumpCommissionProtocol',
    saveData: async (irid, raw, _1, _2, editResult, t, _3, ir) => {
        await uvestTCDoProvozu(irid, raw);
        if (await checkRegulusOrAdmin()) return

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Vyplněno nové uvedení TČ do provozu k ${irName(ir.evidence.ir)}`,
            component: MailProtocol,
            props: { name: user.email!, origin: page.url.origin, irid_spid: irid },
        });

        if (response!.ok) return;
        editResult({
            text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false
        });
        return false
    },
    showSaveAndSendButtonByDefault: derived(isUserRegulusOrAdmin, i => !i),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: t => t.commissioning,
});