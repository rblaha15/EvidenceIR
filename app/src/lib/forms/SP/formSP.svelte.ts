import {
    ChooserWidget,
    CounterWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte';
import { type SparePart } from '$lib/client/realtime';
import { type Form } from '$lib/forms/Form';
import { type P } from '$lib/translations';

export type SparePartWidgetGroup<D extends Form<D>> = {
    label: TextWidget<D>,
    dil: SearchWidget<D, SparePart, true>,
    name: InputWidget<D>;
    code: InputWidget<D>;
    unitPrice: InputWidget<D>;
    warehouse: InputWidget<D>,
    mnozstvi: InputWidget<D>,
}

export type FormSP = GenericFormSP<FormSP>

export interface GenericFormSP<D extends GenericFormSP<D>> extends Form<D> {
    zasah: {
        datum: InputWidget<D>,
        datumUvedeni: InputWidget<D>;
        clovek: InputWidget<D>,
        inicialy: InputWidget<D>,
        zaruka: RadioWidget<D, `sp.warrantyCommon` | `sp.warrantyExtended`>,
        nahlasenaZavada: InputWidget<D>,
        popis: InputWidget<D>,
    },
    ukony: {
        nadpis: TitleWidget<D>,
        doprava: InputWidget<D>,
        typPrace: RadioWidget<D, `sp.assemblyWork` | `sp.technicalAssistance` | `sp.technicalAssistance12`>,
        ukony: MultiCheckboxWidget<D, `sp.regulusRoute` | `sp.commissioningTC` | `sp.commissioningSOL` | `sp.commissioningFVE` | `sp.yearlyHPCheck` | `sp.yearlySOLCheck` | `sp.extendedWarranty` | `sp.installationApproval` | 'sp.withoutCode'>,
        doba: InputWidget<D>,
    },
    nahradniDily: {
        nadpis: TitleWidget<D>,
        pocet: CounterWidget<D>,
    },
    nahradniDil1: SparePartWidgetGroup<D>,
    nahradniDil2: SparePartWidgetGroup<D>,
    nahradniDil3: SparePartWidgetGroup<D>,
    nahradniDil4: SparePartWidgetGroup<D>,
    nahradniDil5: SparePartWidgetGroup<D>,
    nahradniDil6: SparePartWidgetGroup<D>,
    nahradniDil7: SparePartWidgetGroup<D>,
    nahradniDil8: SparePartWidgetGroup<D>,
    fakturace: {
        nadpis: TitleWidget<D>,
        hotove: ChooserWidget<D, 'yes' | 'no' | 'doNotInvoice'>,
        komu: RadioWidget<D, P<'Investor'> | `assemblyCompany`>,
        jak: RadioWidget<D, P<'Papírově' | 'Elektronicky'>>,
    },
}

