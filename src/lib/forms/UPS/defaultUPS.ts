import {
    CheckboxWidget,
    ChooserWidget,
    type GetBOrVal,
    type GetTOrVal,
    InputWidget,
    SwitchWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte';
import { dayISO } from '$lib/helpers/date';
import { type FormUPS, type HeatTransferFluidType } from '$lib/forms/UPS/formUPS';
import { defaultDK } from '$lib/forms/DK/formDK';

const newYesNoWidget = <D>(args: {
    label: GetTOrVal<D>,
    onError?: GetTOrVal<D>,
    required?: GetBOrVal<D>,
    show?: GetBOrVal<D>,
    chosen?: boolean,
}) => new SwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: t => [t.sol.no, t.sol.yes] as const,
    hasPositivity: true,
});

export default (): FormUPS => ({
    sol: {
        nadpis: new TitleWidget({ text: t => t.sol.solarSystem, level: 2 }),
        orientace: new InputWidget({ label: t => t.sol.collectorFieldOrientation }),
        sklon: new InputWidget({ label: t => t.sol.collectorSlope }),
        zasobnik: new InputWidget({ label: t => t.sol.storageTankType }),
        akumulacka: new InputWidget({ label: t => t.sol.accumulationTankType, required: false }),
        vymenik: new InputWidget({ label: t => t.sol.exchangerType, required: false }),
        solRegulator: new InputWidget({ label: t => t.sol.solarControllerType }),
        cerpadloaSkupina: new InputWidget({ label: t => t.sol.pumpGroupType }),
        expanznkaSolarni: newYesNoWidget({ label: t => t.sol.expansionTankSolar, required: true }),
        objem: new InputWidget({ label: t => t.sol.volume, required: d => d.uvedeni.sol.expanznkaSolarni.value }),
        tlakEnSol: new InputWidget({ label: t => t.sol.pressureOfSolarExpansionTank, suffix: t => t.units.bar }),
        tlakKapaliny: new InputWidget({ label: t => t.sol.pressureOfSolarSystemLiquid, suffix: t => t.units.bar }),
        tlakEnTv: new InputWidget({ label: t => t.sol.pressureOfExpansionTankForWater, suffix: t => t.units.bar }),
        ovzdusneni: new ChooserWidget({
            label: t => t.sol.forVentingInstalled, labels: t => t.sol,
            options: ['airVentValve', 'airSeparator', 'nothing'],
        }),
        teplonosnaKapalina: new ChooserWidget({
            label: t => t.sol.heatTransferType, labels: t => t.sol,
            options: ['Solarten Super' as HeatTransferFluidType, 'other'],
        }),
        potrubi: new InputWidget({ label: t => t.sol.pipesMaterial }),
        prumer: new InputWidget({ label: t => t.sol.diameter }),
        delkyPotrubi: new InputWidget({ label: t => t.sol.pipesLength }),
        izolacePotrubi: new CheckboxWidget({ label: t => t.sol.pipesIsolated }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: t => t.sol.commissioningSteps, level: 2 }),
        tlakDoba: new CheckboxWidget({ label: t => t.sol.pressureCheckTime }),
        tlakTlak: new CheckboxWidget({ label: t => t.sol.pressureCheckPressure }),
        tlakUbytek: new CheckboxWidget({ label: t => t.sol.pressureCheckLoss }),
        ovzdusneni: new CheckboxWidget({ label: t => t.sol.venting }),
        blesk: new CheckboxWidget({ label: t => t.sol.lightningProtection }),
        podminky: new CheckboxWidget({ label: t => t.sol.conditionsMet }),
        regulator: new CheckboxWidget({ label: t => t.sol.solarControllerSet }),
        vlastnik: new CheckboxWidget({ label: t => t.sol.ownerInformed }),
        date: new InputWidget({ label: t => t.sol.dateOfCommission, type: 'date', hideInRawData: true }),
    },
    checkRecommendations: defaultDK('SOL'),
});