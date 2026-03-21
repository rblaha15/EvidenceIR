import { CheckboxWidget, ChooserWidget, InputWidget, SwitchWidget, TitleWidget } from '../Widget.svelte.js';
import type { Form, Raw, Values } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormPartDK } from '$lib/forms/DK/formDK';

export type ContextUPS = {
    UP: Values<FormUPS>,
    IN: Raw<FormIN>,
    DK: Values<FormPartDK<ContextUPS>>,
    mode: 'create' | 'edit' | 'view' | 'loading',
}

export type HeatTransferFluidType = 'Solarten Super' | 'Solarten HT'

export interface FormUPS extends Form<ContextUPS> {
    sol: {
        nadpis: TitleWidget<ContextUPS>,
        orientace: InputWidget<ContextUPS>,
        sklon: InputWidget<ContextUPS>,
        zasobnik: InputWidget<ContextUPS>,
        akumulacka: InputWidget<ContextUPS>,
        vymenik: InputWidget<ContextUPS>,
        solRegulator: InputWidget<ContextUPS>,
        cerpadloaSkupina: InputWidget<ContextUPS>,
        expanznkaSolarni: SwitchWidget<ContextUPS>,
        objem: InputWidget<ContextUPS>,
        tlakEnSol: InputWidget<ContextUPS>,
        tlakKapaliny: InputWidget<ContextUPS>,
        tlakEnTv: InputWidget<ContextUPS>,
        ovzdusneni: ChooserWidget<ContextUPS, 'airVentValve' | 'airSeparator' | 'nothing'>,
        teplonosnaKapalina: ChooserWidget<ContextUPS, HeatTransferFluidType | 'other'>,
        potrubi: InputWidget<ContextUPS>,
        prumer: InputWidget<ContextUPS>,
        delkyPotrubi: InputWidget<ContextUPS>,
        izolacePotrubi: CheckboxWidget<ContextUPS>,
    },
    uvadeni: {
        nadpis: TitleWidget<ContextUPS>,
        tlakDoba: CheckboxWidget<ContextUPS>,
        tlakTlak: CheckboxWidget<ContextUPS>,
        tlakUbytek: CheckboxWidget<ContextUPS>,
        ovzdusneni: CheckboxWidget<ContextUPS>,
        blesk: CheckboxWidget<ContextUPS>,
        podminky: CheckboxWidget<ContextUPS>,
        regulator: CheckboxWidget<ContextUPS>,
        vlastnik: CheckboxWidget<ContextUPS>,
        date: InputWidget<ContextUPS, true>,
    },
    checkRecommendations: FormPartDK<ContextUPS>,
}
