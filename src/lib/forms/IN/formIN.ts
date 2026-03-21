import {
    ButtonWidget,
    type CheckboxWidget,
    type ChooserWidget,
    type CounterWidget,
    type DoubleChooserWidget,
    HiddenValueWidget,
    type InputWidget,
    type MultiCheckboxWidget,
    type RadioWidget,
    type ScannerWidget,
    type SearchWidget,
    type TextWidget,
    type TitleWidget,
} from '$lib/forms/Widget.svelte.js';
import type { Company } from '$lib/client/realtime';
import type { Form, Values } from '$lib/forms/Form';
import type { HeatPump } from '$lib/helpers/products';
import { getTranslations, type Translations } from '$lib/translations';
import type { Address } from '$lib/helpers/ruian';

type CompanyWidgetGroup<C> = {
    company: SearchWidget<C, Company, true>;
    ico: InputWidget<C>;
    chosen: TextWidget<C>;
    zastupce: InputWidget<C>;
    email: InputWidget<C>;
    telefon: InputWidget<C>;
}
type AddressWidgetGroup<C> = {
    search: SearchWidget<C, Address, true>;
    obec: InputWidget<C>;
    ulice: InputWidget<C>;
    psc: InputWidget<C>;
}

export type UserFormContext<C extends UserFormContext<C>> = { v: Values<UserForm<C>> };

export interface UserForm<C extends UserFormContext<C>> extends Form<C> {
    koncovyUzivatel: {
        nadpis: TitleWidget<C>;
        typ: RadioWidget<C, `individual` | `company`>;
        prijmeni: InputWidget<C>;
        jmeno: InputWidget<C>;
        narozeni: InputWidget<C>;
        ico: InputWidget<C>;
        searchButton: ButtonWidget<C>;
        searchFail: HiddenValueWidget<C, boolean, true>;
        searchFailText: TextWidget<C>;
        nazev: InputWidget<C>;
        wrongFormat: TextWidget<C>;
        pobocka: InputWidget<C>;
        kontaktniOsoba: InputWidget<C>;
        telefon: InputWidget<C>;
        email: InputWidget<C>;
    };
    bydliste: AddressWidgetGroup<C>;
    mistoRealizace: AddressWidgetGroup<C>;
    montazka: CompanyWidgetGroup<C>;
    uvedeni: CompanyWidgetGroup<C>;
}

export type UntranslatableIRTypes = 'IR RegulusBOX' | 'IR RegulusHBOX' | 'IR RegulusHBOX K' | 'IR 34' | 'IR 30' | 'IR 14' | 'IR 12' | 'IR 10' | 'SOREL' | 'Thermona';
export type IRTypes = UntranslatableIRTypes | 'ctc' | 'other';
type ControllersSOREL =
    | 'SRS1 T'
    | 'SRS2 TE'
    | 'SRS3 E'
    | 'SRS6 EP'
    | 'STDC E'
    | 'TRS3'
    | 'TRS4'
    | 'TRS5'
    | 'TRS6 K'
    | 'DeltaSol BS, ES'
    | 'DeltaSol M, MX';
type ControllersCTC = 'EcoEl' | 'EcoZenith' | 'EcoHeat' | 'EcoLogic EXT';
export type IRSubTypes = 'RTC' | 'CTC' | ControllersSOREL | ControllersCTC | 'inTHERM 10';

export type ContextIN = {
    v: Values<FormIN>
    f: FormIN
}

export interface FormIN extends UserForm<ContextIN>, Form<ContextIN> {
    ir: {
        nadpisSystem: TitleWidget<ContextIN>;
        nadpis: TitleWidget<ContextIN>;
        regulus: HiddenValueWidget<ContextIN, boolean, true>;
        typ: DoubleChooserWidget<ContextIN, IRTypes, IRSubTypes>,
        cislo: InputWidget<ContextIN>,
        alreadyExists: HiddenValueWidget<ContextIN, boolean, true>,
        alreadyExistsWarning: TextWidget<ContextIN>,
        cisloBox: InputWidget<ContextIN>;
        boxType: TextWidget<ContextIN>;
        chceVyplnitK: MultiCheckboxWidget<ContextIN, `heatPump` | `solarCollector` | `accumulation` | 'waterStorage' | `ventilation` | 'photovoltaicPowerPlant' | 'other'>;
    };
    tc: {
        nadpis: TitleWidget<ContextIN>;
        poznamka: TextWidget<ContextIN>;
        typ: RadioWidget<ContextIN, 'airToWater' | 'groundToWater'>;
        pocet: CounterWidget<ContextIN, true>;
        model: ChooserWidget<ContextIN, HeatPump>;
        cislo: ScannerWidget<ContextIN>;
        model2: ChooserWidget<ContextIN, HeatPump>;
        cislo2: ScannerWidget<ContextIN>;
        model3: ChooserWidget<ContextIN, HeatPump>;
        cislo3: ScannerWidget<ContextIN>;
        model4: ChooserWidget<ContextIN, HeatPump>;
        cislo4: ScannerWidget<ContextIN>;
        model5: ChooserWidget<ContextIN, HeatPump>;
        cislo5: ScannerWidget<ContextIN>;
        model6: ChooserWidget<ContextIN, HeatPump>;
        cislo6: ScannerWidget<ContextIN>;
        model7: ChooserWidget<ContextIN, HeatPump>;
        cislo7: ScannerWidget<ContextIN>;
        model8: ChooserWidget<ContextIN, HeatPump>;
        cislo8: ScannerWidget<ContextIN>;
        model9: ChooserWidget<ContextIN, HeatPump>;
        cislo9: ScannerWidget<ContextIN>;
        model10: ChooserWidget<ContextIN, HeatPump>;
        cislo10: ScannerWidget<ContextIN>;
    };
    sol: {
        title: TitleWidget<ContextIN>;
        typ: InputWidget<ContextIN>;
        pocet: InputWidget<ContextIN>;
    };
    tanks: {
        title: TitleWidget<ContextIN>;
        accumulation: InputWidget<ContextIN>;
        water: InputWidget<ContextIN>;
        anode: RadioWidget<ContextIN, 'magnesium' | 'electronic' | 'none'>;
    };
    rek: {
        title: TitleWidget<ContextIN>;
        typ: InputWidget<ContextIN>;
    };
    fve: {
        title: TitleWidget<ContextIN>;
        typ: ChooserWidget<ContextIN, 'DG-450-B' | 'otherNotRegulusPanels'>;
        pocet: InputWidget<ContextIN>;
        typStridace: InputWidget<ContextIN>;
        cisloStridace: InputWidget<ContextIN>;
        akumulaceDoBaterii: CheckboxWidget<ContextIN>;
        typBaterii: InputWidget<ContextIN>;
        kapacitaBaterii: InputWidget<ContextIN>;
        wallbox: CheckboxWidget<ContextIN>;
        spolupraceIR: CheckboxWidget<ContextIN>,
    };
    jine: {
        title: TitleWidget<ContextIN>;
        popis: InputWidget<ContextIN>;
    };
    vzdalenyPristup: {
        nadpis: TitleWidget<ContextIN>;
        chce: CheckboxWidget<ContextIN>;
        pristupMa: MultiCheckboxWidget<ContextIN, 'endCustomer' | 'assemblyCompany' | 'commissioningCompany'>;
        plati: RadioWidget<ContextIN, 'assemblyCompany' | 'endCustomer' | 'doNotInvoice' | 'laterAccordingToTheProtocol'>;
        showResponsiblePerson: HiddenValueWidget<ContextIN, boolean, true>;
        zodpovednaOsoba: InputWidget<ContextIN>;
    };
    ostatni: {
        poznamka: InputWidget<ContextIN>;
    };
}

export const unknownCRN = '99999999';
export const unknownCompany = (t: Translations = getTranslations('cs')): Company =>
    ({ ...t.in.unknownCompany, crn: unknownCRN });
