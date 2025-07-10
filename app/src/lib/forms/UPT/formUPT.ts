import { CheckboxWidget, ChooserWidget, InputWidget, SwitchWidget, TitleWidget } from '../Widget.svelte.js';
import type { Form, Raw } from '$lib/forms/Form';
import type { FormIN } from '../IN/formIN';

export type DataUPT = {
    uvedeni: FormUPT,
    evidence: Raw<FormIN>,
}

export interface FormUPT extends Form<DataUPT> {
    tc: {
        nadpis: TitleWidget<DataUPT>,
        jisticTC: SwitchWidget<DataUPT>,
        jisticVJ: SwitchWidget<DataUPT>,
        vzdalenostZdi: SwitchWidget<DataUPT>,
        kondenzator: CheckboxWidget<DataUPT>,
        filtr: CheckboxWidget<DataUPT>,
    },
    nadrze: {
        nadpis: TitleWidget<DataUPT>,
        akumulacka: InputWidget<DataUPT>,
        zasobnik: InputWidget<DataUPT>,
    },
    os: {
        nadpis: TitleWidget<DataUPT>,
        tvori: ChooserWidget<DataUPT, `radiators` | `underfloorHeating` | `combinationHeating` | `otherHeatingSystem`>,
        popis: InputWidget<DataUPT>,
        dzTop: CheckboxWidget<DataUPT>,
        typDzTop: InputWidget<DataUPT>,
        tcTv: CheckboxWidget<DataUPT>,
        zTv: InputWidget<DataUPT>,
        objemEnOs: SwitchWidget<DataUPT>,
        tlakEnOs: InputWidget<DataUPT>,
        tlakOs: InputWidget<DataUPT>,
        tlakEnTv: InputWidget<DataUPT>,
        bazenTc: CheckboxWidget<DataUPT>,
    },
    reg: {
        nadpis: TitleWidget<DataUPT>,
        pripojeniKInternetu: ChooserWidget<DataUPT, `connectedViaRegulusRoute` | `connectedWithPublicIpAddress` | `notConnected`>,
        pospojeni: CheckboxWidget<DataUPT>,
        spotrebice: CheckboxWidget<DataUPT>,
        zalZdroj: CheckboxWidget<DataUPT>,
    },
    primar: {
        nadpis: TitleWidget<DataUPT>,
        typ: ChooserWidget<DataUPT, `groundBoreholes` | `surfaceCollector` | `otherCollector`>,
        popis: InputWidget<DataUPT>,
        nemrz: InputWidget<DataUPT>
        nadoba: ChooserWidget<DataUPT, `expansionTankInstalled` | `bufferTankInstalled`>,
        kontrola: CheckboxWidget<DataUPT>,
    },
    uvadeni: {
        nadpis: TitleWidget<DataUPT>,
        tc: CheckboxWidget<DataUPT>,
        reg: CheckboxWidget<DataUPT>,
        vlastnik: CheckboxWidget<DataUPT>,
        typZaruky: ChooserWidget<DataUPT, `no` | `yes`>,
        zaruka: CheckboxWidget<DataUPT>,
        date: InputWidget<DataUPT>,
    },
}
