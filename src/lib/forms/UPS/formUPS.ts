import { CheckboxWidget, ChooserWidget, InputWidget, SwitchWidget, TitleWidget } from '../Widget.svelte.js';
import type { Form, Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import { type P } from '$lib/translations';

export type DataUPS = {
    uvedeni: FormUPS,
    evidence: Raw<FormIN>,
}

export interface FormUPS extends Form<DataUPS> {
    sol: {
        nadpis: TitleWidget<DataUPS>,
        orientace: InputWidget<DataUPS>,
        sklon: InputWidget<DataUPS>,
        zasobnik: InputWidget<DataUPS>,
        akumulacka: InputWidget<DataUPS>,
        vymenik: InputWidget<DataUPS>,
        solRegulator: InputWidget<DataUPS>,
        cerpadloaSkupina: InputWidget<DataUPS>,
        expanznkaSolarni: SwitchWidget<DataUPS>,
        objem: InputWidget<DataUPS>,
        ovzdusneni: ChooserWidget<DataUPS, P<'odvzdušňovací ventil' | 'separátor vzduchu' | 'nic'>>,
        teplonosnaKapalina: ChooserWidget<DataUPS, P<'Solarten Super' | 'Solarten HT' | 'jiná'>>,
        potrubi: InputWidget<DataUPS>,
        prumer: InputWidget<DataUPS>,
        delkyPotrubi: InputWidget<DataUPS>,
        izolacePotrubi: CheckboxWidget<DataUPS>,
    },
    uvadeni: {
        nadpis: TitleWidget<DataUPS>,
        tlakDoba: CheckboxWidget<DataUPS>,
        tlakTlak: CheckboxWidget<DataUPS>,
        tlakUbytek: CheckboxWidget<DataUPS>,
        ovzdusneni: CheckboxWidget<DataUPS>,
        blesk: CheckboxWidget<DataUPS>,
        podminky: CheckboxWidget<DataUPS>,
        regulator: CheckboxWidget<DataUPS>,
        vlastnik: CheckboxWidget<DataUPS>,
        date: InputWidget<DataUPS>,
    },
}
