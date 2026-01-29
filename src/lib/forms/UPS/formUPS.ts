import { CheckboxWidget, ChooserWidget, InputWidget, SwitchWidget, TitleWidget } from '../Widget.svelte.js';
import type { Form, Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormPartDK } from '$lib/forms/DK/formDK';

export type DataUPS = {
    uvedeni: FormUPS,
    evidence: Raw<FormIN>,
    dk: FormPartDK<DataUPS>,
}

export type HeatTransferFluidType = 'Solarten Super' | 'Solarten HT'

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
        tlakEnSol: InputWidget<DataUPS>,
        tlakKapaliny: InputWidget<DataUPS>,
        tlakEnTv: InputWidget<DataUPS>,
        ovzdusneni: ChooserWidget<DataUPS, 'airVentValve' | 'airSeparator' | 'nothing'>,
        teplonosnaKapalina: ChooserWidget<DataUPS, HeatTransferFluidType | 'other'>,
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
        date: InputWidget<DataUPS, true>,
    },
    checkRecommendations: FormPartDK<DataUPS>,
}
