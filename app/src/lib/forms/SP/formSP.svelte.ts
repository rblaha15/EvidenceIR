import {
    type ChooserWidget,
    type CounterWidget, type HiddenValueWidget,
    type InlinePdfPreviewWidget,
    type InputWidget,
    type MultiCheckboxWidget,
    type RadioWidget,
    type RadioWithInputWidget,
    type SearchWidget,
} from '$lib/forms/Widget';
import { type SparePart } from '$lib/client/realtime';
import { type Form, type Raw, type Values } from '$lib/forms/Form';
import type { IR } from '$lib/data';
import type { GenericContextSZ, GenericFormSZ } from '$lib/forms/SP/formSZ';

export type SparePartWidgetGroup<C> = {
    dil: SearchWidget<C, SparePart, true>,
    name: InputWidget<C>;
    code: InputWidget<C>;
    unitPrice: InputWidget<C>;
    warehouse: InputWidget<C>,
    mnozstvi: InputWidget<C>,
}

export interface FormSP extends GenericFormSP<ContextSP>, Form<ContextSP> {
}

export interface ContextSP extends GenericContextSP<ContextSP> {
    f: FormSP
    v: Values<FormSP>
    raw: Raw<FormSP>
    ir: IR
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

export interface GenericContextSP<C extends GenericContextSP<C>> extends GenericContextSZ<C> {
    v: Values<GenericFormSP<C>>
    f: GenericFormSP<C>
}

export interface GenericFormSP<C extends GenericContextSP<C>> extends GenericFormSZ<C>, Form<C> {
    system: {
        datumUvedeni: InputWidget<C>;
        zaruka: RadioWidget<C, `warrantyCommon` | `warrantyExtended`>,
    },
    zasah: {
        showNameFileds: HiddenValueWidget<C, boolean, true>,
        inicialy: InputWidget<C>,
        nahlasenaZavada: InputWidget<C>,
        interventionDuration: InputWidget<C>,
    } & GenericFormSZ<C>['zasah'],
    ukony: {
        ukony: MultiCheckboxWidget<C, Operation>,
        typPrace: RadioWidget<C, `assemblyWork` | `technicalAssistance` | `assemblyWork12`>,
        doba: InputWidget<C>,
        doprava: InputWidget<C>,
    },
    nahradniDily: {
        pocet: CounterWidget<C>,
    },
    nahradniDil1: SparePartWidgetGroup<C>,
    nahradniDil2: SparePartWidgetGroup<C>,
    nahradniDil3: SparePartWidgetGroup<C>,
    nahradniDil4: SparePartWidgetGroup<C>,
    nahradniDil5: SparePartWidgetGroup<C>,
    nahradniDil6: SparePartWidgetGroup<C>,
    nahradniDil7: SparePartWidgetGroup<C>,
    nahradniDil8: SparePartWidgetGroup<C>,
    fakturace: {
        invoiceParts: MultiCheckboxWidget<C, 'work' | Operation | `transportation`>,
        discount: InputWidget<C>,
        discountReason: InputWidget<C>,
        hotove: ChooserWidget<C, 'yes' | 'no' | 'doNotInvoice'>,
        komu: RadioWithInputWidget<C, 'investor' | `assemblyCompany` | 'commissioningCompany' | 'otherCompany'>,
        jak: RadioWidget<C, 'onPaper' | 'electronically'>,
    },
    other: {
        preview: InlinePdfPreviewWidget<C, 'NSP'>
    },
}

