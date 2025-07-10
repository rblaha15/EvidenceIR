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
import { type Company, type Technician } from '$lib/client/realtime';
import { type P } from '$lib/translations';
import { type Form } from '$lib/forms/Form';
import { type Products } from '$lib/helpers/products';

export interface UserForm<D extends UserForm<D>> extends Form<D> {
    koncovyUzivatel: {
        nadpis: TitleWidget<D>;
        typ: RadioWidget<D, `individual` | `company`>;
        prijmeni: InputWidget<D>;
        jmeno: InputWidget<D>;
        narozeni: InputWidget<D>;
        nazev: InputWidget<D>;
        wrongFormat: TextWidget<D>;
        pobocka: InputWidget<D>;
        ico: InputWidget<D>;
        telefon: InputWidget<D>;
        email: InputWidget<D>;
    };
    bydliste: {
        nadpis: TitleWidget<D>;
        obec: InputWidget<D>;
        ulice: InputWidget<D>;
        psc: InputWidget<D>;
    };
    mistoRealizace: {
        nadpis: TitleWidget<D>;
        jakoBydliste: CheckboxWidget<D, true>;
        obec: InputWidget<D>;
        ulice: InputWidget<D>;
        psc: InputWidget<D>;
    };
    montazka: {
        nadpis: TitleWidget<D>;
        company: SearchWidget<D, Company, true>;
        nebo: TextWidget<D>;
        ico: InputWidget<D>;
        chosen: TextWidget<D>;
        zastupce: InputWidget<D>;
        email: InputWidget<D>;
        telefon: InputWidget<D>;
    };
    uvedeni: {
        nadpis: TitleWidget<D>;
        jakoMontazka: CheckboxWidget<D, true>;
        company: SearchWidget<D, Company, true>;
        nebo: TextWidget<D>;
        ico: InputWidget<D>;
        chosen: TextWidget<D>;
        regulus: SearchWidget<D, Technician, true>;
        zastupce: InputWidget<D>;
        email: InputWidget<D>;
        telefon: InputWidget<D>;
    };
}

export interface FormIN extends UserForm<FormIN>, Form<FormIN> {
    ir: {
        typ: DoubleChooserWidget<FormIN, P<'IR RegulusBOX' | 'IR RegulusHBOX' | 'IR RegulusHBOX K' | 'IR 34' | 'IR 14' | 'IR 12' | 'SOREL'>, P<'RTC' | 'CTC' | 'SRS1 T' | 'SRS2 TE' | 'SRS3 E' | 'SRS6 EP' | 'STDC E' | 'TRS3' | 'TRS4' | 'TRS5' | 'TRS6 K'>>;
        cislo: InputWidget<FormIN>;
        cisloBox: InputWidget<FormIN>;
        boxType: TextWidget<FormIN>;
        chceVyplnitK: MultiCheckboxWidget<FormIN, `heatPump` | `solarCollector` | `ventilation` | 'photovoltaicPowerPlant' | 'otherDevice'>;
    };
    tc: {
        nadpis: TitleWidget<FormIN>;
        poznamka: TextWidget<FormIN>;
        typ: RadioWidget<FormIN, `airToWater` | `groundToWater`>;
        pocet: CounterWidget<FormIN, true>;
        model: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo: ScannerWidget<FormIN>;
        model2: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo2: ScannerWidget<FormIN>;
        model3: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo3: ScannerWidget<FormIN>;
        model4: ChooserWidget<FormIN, Products['heatPumps']>;
        cislo4: ScannerWidget<FormIN>;
    };
    sol: {
        title: TitleWidget<FormIN>;
        typ: InputWidget<FormIN>;
        pocet: InputWidget<FormIN>;
    };
    vetrani: {
        title: TitleWidget<FormIN>;
        typ: InputWidget<FormIN>;
    };
    fve: {
        title: TitleWidget<FormIN>;
        typ: ChooserWidget<FormIN, P<'DG-450-B'>>;
        pocet: InputWidget<FormIN>;
        typStridace: InputWidget<FormIN>;
        cisloStridace: InputWidget<FormIN>;
        akumulaceDoBaterii: CheckboxWidget<FormIN>;
        typBaterii: InputWidget<FormIN>;
        kapacitaBaterii: InputWidget<FormIN>;
        wallbox: CheckboxWidget<FormIN>;
    };
    jine: {
        title: TitleWidget<FormIN>;
        popis: InputWidget<FormIN>;
    };
    vzdalenyPristup: {
        nadpis: TitleWidget<FormIN>;
        chce: CheckboxWidget<FormIN>;
        pristupMa: MultiCheckboxWidget<FormIN, `endCustomer` | `assemblyCompany` | `commissioningCompany`>;
        plati: RadioWidget<FormIN, 'assemblyCompany' | 'endCustomer' | 'doNotInvoice' | P<'Později, dle protokolu'>>;
        zodpovednaOsoba: InputWidget<FormIN>;
    };
    ostatni: {
        poznamka: InputWidget<FormIN>;
    };
}

export const unknownCompany: Company = {
    companyName: 'Neznámá',
    email: 'neznama@montazni.fi',
    crn: '99999999',
    phone: '+420999999999',
    representative: 'Neznámý montážník',
};
