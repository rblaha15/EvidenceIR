import type { Form, Raw, Values } from '$lib/forms/Form';
import type { FormIN } from '../IN/formIN';
import type { FormPartDK } from '$lib/forms/DK/formDK';
import type { CheckboxWidget, ChooserWidget, InputWidget, RadioWidget, SwitchWidget, TitleWidget } from '$lib/forms/Widget';

export type ContextUPT = {
    UP: Values<FormUPT>,
    IN: Raw<FormIN>,
    DK: Values<FormPartDK<ContextUPT>>,
    mode: 'create' | 'edit' | 'view' | 'loading',
}

export interface FormUPT extends Form<ContextUPT> {
    tc: {
        nadpisSystem: TitleWidget<ContextUPT>,
        nadpis: TitleWidget<ContextUPT>,
        jisticTC: SwitchWidget<ContextUPT>,
        jisticVJ: SwitchWidget<ContextUPT>,
        vzdalenostZdi: SwitchWidget<ContextUPT>,
        kondenzator: CheckboxWidget<ContextUPT>,
        filtr: CheckboxWidget<ContextUPT>,
    },
    os: {
        nadpis: TitleWidget<ContextUPT>,
        tvori: ChooserWidget<ContextUPT, `radiators` | `underfloorHeating` | `combinationHeating` | `otherHeatingSystem`>,
        popis: InputWidget<ContextUPT>,
        dzTop: CheckboxWidget<ContextUPT>,
        typDzTop: InputWidget<ContextUPT>,
        tcTv: CheckboxWidget<ContextUPT>,
        zTv: InputWidget<ContextUPT>,
        objemEnOs: SwitchWidget<ContextUPT>,
        tlakEnOs: InputWidget<ContextUPT>,
        tlakOs: InputWidget<ContextUPT>,
        tlakEnTv: InputWidget<ContextUPT>,
        prutokTcTopeni: InputWidget<ContextUPT>,
        prutokTcTepleVody: InputWidget<ContextUPT>,
        prutokTcChlazeni: InputWidget<ContextUPT>,
        bazenTc: CheckboxWidget<ContextUPT>,
    },
    reg: {
        nadpis: TitleWidget<ContextUPT>,
        pripojeniKInternetu: ChooserWidget<ContextUPT, `connectedViaRegulusRoute` | `connectedWithPublicIpAddress` | `notConnected`>,
        ipAdresa: InputWidget<ContextUPT>,
        pospojeni: CheckboxWidget<ContextUPT>,
        spotrebice: CheckboxWidget<ContextUPT>,
        zalZdroj: CheckboxWidget<ContextUPT>,
    },
    primar: {
        nadpis: TitleWidget<ContextUPT>,
        typ: ChooserWidget<ContextUPT, `groundBoreholes` | `surfaceCollector` | `otherCollector`>,
        popis: InputWidget<ContextUPT>,
        nemrz: InputWidget<ContextUPT>
        nadoba: ChooserWidget<ContextUPT, `expansionTankInstalled` | `bufferTankInstalled`>,
        kontrola: CheckboxWidget<ContextUPT>,
    },
    uvadeni: {
        nadpis: TitleWidget<ContextUPT>,
        tc: CheckboxWidget<ContextUPT>,
        reg: CheckboxWidget<ContextUPT>,
        vlastnik: CheckboxWidget<ContextUPT>,
        typZaruky: RadioWidget<ContextUPT, `no` | `yes`>,
        fullPaidWarranty: RadioWidget<ContextUPT, `yes` | 'unsure' | 'no'>,
        compressorWarranty: RadioWidget<ContextUPT, `yes` | 'no'>,
        zaruka: CheckboxWidget<ContextUPT>,
        date: InputWidget<ContextUPT, true>,
        note: InputWidget<ContextUPT>,
    },
    checkRecommendations: FormPartDK<ContextUPT>,
}
