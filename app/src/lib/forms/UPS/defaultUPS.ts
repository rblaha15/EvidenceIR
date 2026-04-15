import {
    type GetBOrVal,
    type GetTOrVal,
    newCheckboxWidget,
    newChooserWidget,
    newInputWidget,
    newSwitchWidget, newTitleWidget,
} from '$lib/forms/Widget';
import { type FormUPS, type HeatTransferFluidType } from '$lib/forms/UPS/formUPS';
import { defaultDK } from '$lib/forms/DK/formDK';
import type { IR } from '$lib/data';
import { dayISO } from '$lib/helpers/date';

const newYesNoWidget = <D>(args: {
    label: GetTOrVal<D>,
    onError?: GetTOrVal<D>,
    required?: GetBOrVal<D>,
    show?: GetBOrVal<D>,
    chosen?: boolean,
}) => newSwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: t => [t.sol.no, t.sol.yes] as const,
    hasPositivity: true,
});

export default (ir: IR): FormUPS => ({
    sol: {
        nadpis: newTitleWidget({ text: t => t.sol.solarSystem, level: 2 }),
        orientace: newInputWidget({ label: t => t.sol.collectorFieldOrientation }),
        sklon: newInputWidget({ label: t => t.sol.collectorSlope }),
        zasobnik: newInputWidget({ label: t => t.sol.storageTankType }),
        akumulacka: newInputWidget({ label: t => t.sol.accumulationTankType, required: false }),
        vymenik: newInputWidget({ label: t => t.sol.exchangerType, required: false }),
        solRegulator: newInputWidget({ label: t => t.sol.solarControllerType }),
        cerpadloaSkupina: newInputWidget({ label: t => t.sol.pumpGroupType }),
        expanznkaSolarni: newYesNoWidget({ label: t => t.sol.expansionTankSolar, required: false }),
        objem: newInputWidget({ label: t => t.sol.volume, required: c => c.UP.sol.expanznkaSolarni }),
        tlakEnSol: newInputWidget({ label: t => t.sol.pressureOfSolarExpansionTank, suffix: t => t.units.bar }),
        tlakKapaliny: newInputWidget({ label: t => t.sol.pressureOfSolarSystemLiquid, suffix: t => t.units.bar }),
        tlakEnTv: newInputWidget({ label: t => t.sol.pressureOfExpansionTankForWater, suffix: t => t.units.bar }),
        ovzdusneni: newChooserWidget({
            label: t => t.sol.forVentingInstalled, labels: t => t.sol,
            options: ['airVentValve', 'airSeparator', 'nothing'],
        }),
        teplonosnaKapalina: newChooserWidget({
            label: t => t.sol.heatTransferType, labels: t => t.sol,
            options: ['Solarten Super' as HeatTransferFluidType, 'other'],
        }),
        potrubi: newInputWidget({ label: t => t.sol.pipesMaterial }),
        prumer: newInputWidget({ label: t => t.sol.diameter }),
        delkyPotrubi: newInputWidget({ label: t => t.sol.pipesLength }),
        izolacePotrubi: newCheckboxWidget({ label: t => t.sol.pipesIsolated }),
    },
    uvadeni: {
        nadpis: newTitleWidget({ text: t => t.sol.commissioningSteps, level: 2 }),
        tlakDoba: newCheckboxWidget({ label: t => t.sol.pressureCheckTime }),
        tlakTlak: newCheckboxWidget({ label: t => t.sol.pressureCheckPressure }),
        tlakUbytek: newCheckboxWidget({ label: t => t.sol.pressureCheckLoss }),
        ovzdusneni: newCheckboxWidget({ label: t => t.sol.venting }),
        blesk: newCheckboxWidget({ label: t => t.sol.lightningProtection }),
        podminky: newCheckboxWidget({ label: t => t.sol.conditionsMet }),
        regulator: newCheckboxWidget({ label: t => t.sol.solarControllerSet }),
        vlastnik: newCheckboxWidget({ label: t => t.sol.ownerInformed }),
        date: newInputWidget({
            label: t => t.sol.dateOfCommission, type: 'date', hideInRawData: true,
            text: ir.UP.dateSOL || dayISO(), onValueSet: (c, date) => {
                c.DK.commissionDate = date;
            },
        }),
    },
    checkRecommendations: defaultDK('SOL', ir.UP.dateSOL, ir.RK.DK.SOL, true),
});