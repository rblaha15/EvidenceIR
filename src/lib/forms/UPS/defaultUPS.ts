import { CheckboxWidget, ChooserWidget, type GetOrVal, InputWidget, SwitchWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { p } from '$lib/translations';
import { todayISO } from '$lib/helpers/date';
import { type FormUPS } from '$lib/forms/UPS/formUPS';

const newYesNoWidget = <D>(args: {
    label: GetOrVal<D>,
    onError?: GetOrVal<D>,
    required?: GetOrVal<D, boolean>,
    show?: GetOrVal<D, boolean>,
    chosen?: boolean,
}) => new SwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: [`sol.no`, `sol.yes`] as const,
    hasPositivity: true,
});

export default (): FormUPS => ({
    sol: {
        nadpis: new TitleWidget({ text: `in.solarSystem` }),
        orientace: new InputWidget({ label: 'sol.collectorFieldOrientation' }),
        sklon: new InputWidget({ label: 'sol.collectorSlope' }),
        zasobnik: new InputWidget({ label: 'sol.storageTankType' }),
        akumulacka: new InputWidget({ label: 'sol.accumulationTankType', required: false }),
        vymenik: new InputWidget({ label: 'sol.exchangerType', required: false }),
        solRegulator: new InputWidget({ label: 'sol.solarControllerType' }),
        cerpadloaSkupina: new InputWidget({ label: 'sol.pumpGroupType' }),
        expanznkaSolarni: newYesNoWidget({ label: 'sol.expansionTankSolar', required: true }),
        objem: new InputWidget({ label: 'sol.volume' }),
        ovzdusneni: new ChooserWidget({
            label: 'sol.forVentingInstalled',
            options: p(['odvzdušňovací ventil', 'separátor vzduchu', 'nic']),
        }),
        teplonosnaKapalina: new ChooserWidget({
            label: 'sol.heatTransferType',
            options: p(['Solarten Super', 'Solarten HT', 'jiná']),
        }),
        potrubi: new InputWidget({ label: 'sol.pipesMaterial' }),
        prumer: new InputWidget({ label: 'sol.diameter' }),
        delkyPotrubi: new InputWidget({ label: 'sol.pipesLength' }),
        izolacePotrubi: new CheckboxWidget({ label: 'sol.pipesIsolated' }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: `sol.commissioningSteps` }),
        tlakDoba: new CheckboxWidget({ label: 'sol.pressureCheckTime' }),
        tlakTlak: new CheckboxWidget({ label: 'sol.pressureCheckPressure' }),
        tlakUbytek: new CheckboxWidget({ label: 'sol.pressureCheckLoss' }),
        ovzdusneni: new CheckboxWidget({ label: 'sol.venting' }),
        blesk: new CheckboxWidget({ label: 'sol.lightningProtection' }),
        podminky: new CheckboxWidget({ label: 'sol.conditionsMet' }),
        regulator: new CheckboxWidget({ label: 'sol.solarControllerSet' }),
        vlastnik: new CheckboxWidget({ label: 'sol.ownerInformed' }),
        date: new InputWidget({ label: 'sol.dateOfCommission', type: 'date', text: todayISO() }),
    },
});