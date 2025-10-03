import {
    ChooserWidget,
    CounterWidget,
    InlinePdfPreviewWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte';
import { type SparePart } from '$lib/client/realtime';
import { type Form, type Raw } from '$lib/forms/Form';
import type { IR } from '$lib/data';

export type SparePartWidgetGroup<D> = {
    label: TextWidget<D>,
    dil: SearchWidget<D, SparePart, true>,
    name: InputWidget<D>;
    code: InputWidget<D>;
    unitPrice: InputWidget<D>;
    warehouse: InputWidget<D>,
    mnozstvi: InputWidget<D>,
}

export interface FormSP extends GenericFormSP<DataSP>, Form<DataSP> {
}

export type DataSP = IR & FormSP & {
    raw: Raw<FormSP>
}

export type Operation =
    | `regulusRoute`
    | `commissioningTC`
    | `commissioningSOL`
    | `commissioningFVE`
    | `yearlyHPCheck`
    | `yearlySOLCheck`
    | `extendedWarranty`
    | `installationApproval`
    | 'withoutCode';

export interface GenericFormSP<D extends GenericFormSP<D>> extends Form<D> {
    zasah: {
        nadpis: TitleWidget<D>,
        datum: InputWidget<D>,
        datumUvedeni: InputWidget<D>;
        clovek: InputWidget<D>,
        inicialy: InputWidget<D>,
        zaruka: RadioWidget<D, `warrantyCommon` | `warrantyExtended`>,
        nahlasenaZavada: InputWidget<D>,
        overflowFault: TextWidget<D>;
        popis: InputWidget<D>,
        overflowIntervention: TextWidget<D>;
    },
    ukony: {
        nadpis: TitleWidget<D>,
        doprava: InputWidget<D>,
        typPrace: RadioWidget<D, `assemblyWork` | `technicalAssistance` | `technicalAssistance12`>,
        ukony: MultiCheckboxWidget<D, Operation>,
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
        komu: RadioWidget<D, 'investor' | `assemblyCompany`>,
        jak: RadioWidget<D, 'onPaper' | 'electronically'>,
        invoiceParts: MultiCheckboxWidget<D, 'work' | Operation | `transportation`>,
    },
    other: {
        title: TitleWidget<D>,
        preview: InlinePdfPreviewWidget<D, 'NSP'>
    },
}

