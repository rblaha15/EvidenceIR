import {
    CheckboxWidget,
    ChooserWidget,
    CounterWidget,
    DoubleChooserWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    ScannerWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '$lib/forms/Widget.svelte.js';
import { type Company } from '$lib/client/realtime';
import { type Form } from '$lib/forms/Form';
import { type Products } from '$lib/helpers/products';
import { getTranslations, type Translations } from '$lib/translations';

type CompanyWidgetGroup<D> = {
    company: SearchWidget<D, Company, true>;
    ico: InputWidget<D>;
    chosen: TextWidget<D>;
    zastupce: InputWidget<D>;
    email: InputWidget<D>;
    telefon: InputWidget<D>;
}
type AddressWidgetGroup<D> = {
    obec: InputWidget<D>;
    ulice: InputWidget<D>;
    psc: InputWidget<D>;
}

export interface UserForm<D extends UserForm<D>> extends Form<D> {
    koncovyUzivatel: {
        nadpis: TitleWidget<D>;
        typ: RadioWidget<D, `individual` | `company`>;
        prijmeni: InputWidget<D>;
        jmeno: InputWidget<D>;
        narozeni: InputWidget<D>;
        company: SearchWidget<D, Company, true>;
        or: TextWidget<D>;
        nazev: InputWidget<D>;
        wrongFormat: TextWidget<D>;
        pobocka: InputWidget<D>;
        ico: InputWidget<D>;
        kontaktniOsoba: InputWidget<D>;
        telefon: InputWidget<D>;
        email: InputWidget<D>;
    };
    bydliste: AddressWidgetGroup<D>;
    mistoRealizace: AddressWidgetGroup<D>;
    montazka: CompanyWidgetGroup<D>;
    uvedeni: CompanyWidgetGroup<D>;
}

export type UntranslatableIRTypes = 'IR RegulusBOX' | 'IR RegulusHBOX' | 'IR RegulusHBOX K' | 'IR 34' | 'IR 30' | 'IR 14' | 'IR 12' | 'IR 10' | 'SOREL';
export type IRTypes = UntranslatableIRTypes | 'fve';
export type IRSubTypes = 'RTC' | 'CTC' | 'SRS1 T' | 'SRS2 TE' | 'SRS3 E' | 'SRS6 EP' | 'STDC E' | 'TRS3' | 'TRS4' | 'TRS5' | 'TRS6 K';

export interface FormIN extends UserForm<FormIN>, Form<FormIN> {
    ir: {
        nadpisSystem: TitleWidget<FormIN>;
        nadpis: TitleWidget<FormIN>;
        typ: DoubleChooserWidget<FormIN, IRTypes, IRSubTypes>;
        cislo: InputWidget<FormIN>;
        cisloBox: InputWidget<FormIN>;
        boxType: TextWidget<FormIN>;
        chceVyplnitK: MultiCheckboxWidget<FormIN, `heatPump` | `solarCollector` | `ventilation` | 'photovoltaicPowerPlant' | 'other'>;
    };
    tc: {
        nadpis: TitleWidget<FormIN>;
        poznamka: TextWidget<FormIN>;
        typ: RadioWidget<FormIN, 'airToWater' | 'groundToWater'>;
        pocet: CounterWidget<FormIN, true>;
        model: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo: ScannerWidget<FormIN>;
        model2: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo2: ScannerWidget<FormIN>;
        model3: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo3: ScannerWidget<FormIN>;
        model4: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo4: ScannerWidget<FormIN>;
        model5: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo5: ScannerWidget<FormIN>;
        model6: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo6: ScannerWidget<FormIN>;
        model7: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo7: ScannerWidget<FormIN>;
        model8: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo8: ScannerWidget<FormIN>;
        model9: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo9: ScannerWidget<FormIN>;
        model10: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo10: ScannerWidget<FormIN>;
    };
    sol: {
        title: TitleWidget<FormIN>;
        typ: InputWidget<FormIN>;
        pocet: InputWidget<FormIN>;
    };
    rek: {
        title: TitleWidget<FormIN>;
        typ: InputWidget<FormIN>;
    };
    fve: {
        title: TitleWidget<FormIN>;
        typ: ChooserWidget<FormIN, 'DG-450-B' | 'otherNotRegulusPanels'>;
        pocet: InputWidget<FormIN>;
        typStridace: InputWidget<FormIN>;
        cisloStridace: InputWidget<FormIN>;
        akumulaceDoBaterii: CheckboxWidget<FormIN>;
        typBaterii: InputWidget<FormIN>;
        kapacitaBaterii: InputWidget<FormIN>;
        wallbox: CheckboxWidget<FormIN>;
        spolupraceIR: CheckboxWidget<FormIN>,
    };
    jine: {
        title: TitleWidget<FormIN>;
        popis: InputWidget<FormIN>;
    };
    vzdalenyPristup: {
        nadpis: TitleWidget<FormIN>;
        chce: CheckboxWidget<FormIN>;
        pristupMa: MultiCheckboxWidget<FormIN, 'endCustomer' | 'assemblyCompany' | 'commissioningCompany'>;
        plati: RadioWidget<FormIN, 'assemblyCompany' | 'endCustomer' | 'doNotInvoice' | 'laterAccordingToTheProtocol'>;
        zodpovednaOsoba: InputWidget<FormIN>;
    };
    ostatni: {
        poznamka: InputWidget<FormIN>;
    };
}

export const unknownCRN = '99999999';
export const unknownCompany = (t: Translations = getTranslations('cs')): Company =>
    ({ ...t.in.unknownCompany, crn: unknownCRN });
