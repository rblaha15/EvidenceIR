import {
    type ChooserWidget,
    type CounterWidget, HiddenValueWidget,
    type InlinePdfPreviewWidget,
    type InputWidget,
    type MultiCheckboxWidget,
    type RadioWidget,
    type RadioWithInputWidget,
    type SearchWidget,
} from '$lib/forms/Widget.svelte';
import { type SparePart } from '$lib/client/realtime';
import { type Form, type Raw } from '$lib/forms/Form';
import type { IR } from '$lib/data';
import type { Timestamp } from 'firebase/firestore';

export type SparePartWidgetGroup<D> = {
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
    form: FormSP
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
    system: {
        datumUvedeni: InputWidget<D>;
        zaruka: RadioWidget<D, `warrantyCommon` | `warrantyExtended`>,
    }
    zasah: {
        createdAt: HiddenValueWidget<D, Timestamp>,
        changedAt: HiddenValueWidget<D, Timestamp>,
        datum: InputWidget<D>,
        clovek: InputWidget<D>,
        inicialy: InputWidget<D>,
        nahlasenaZavada: InputWidget<D>,
        popis: InputWidget<D>,
        interventionDuration: InputWidget<D>,
    },
    ukony: {
        ukony: MultiCheckboxWidget<D, Operation>,
        typPrace: RadioWidget<D, `assemblyWork` | `technicalAssistance` | `technicalAssistance12`>,
        doba: InputWidget<D>,
        doprava: InputWidget<D>,
    },
    nahradniDily: {
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
        invoiceParts: MultiCheckboxWidget<D, 'work' | Operation | `transportation`>,
        discount: InputWidget<D>,
        hotove: ChooserWidget<D, 'yes' | 'no' | 'doNotInvoice'>,
        komu: RadioWithInputWidget<D, 'investor' | `assemblyCompany` | 'commissioningCompany' | 'otherCompany'>,
        jak: RadioWidget<D, 'onPaper' | 'electronically'>,
    },
    other: {
        preview: InlinePdfPreviewWidget<D, 'NSP'>
    },
}

