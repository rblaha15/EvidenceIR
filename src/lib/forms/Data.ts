import defaultData from './defaultData';
import {
    DoubleChooserWidget,
    MultiCheckboxWidget,
    TitleWidget,
    InputWidget,
    RadioWidget,
    SearchWidget,
    TextWidget,
    ChooserWidget,
    CheckboxWidget
} from '../Vec.svelte.js';
import type { Company, Technician } from '$lib/client/realtime';

export type Data = {
    ir: {
        typ: DoubleChooserWidget<Data>;
        cislo: InputWidget<Data>;
        cisloBox: InputWidget<Data>;
        chceVyplnitK: MultiCheckboxWidget<Data>;
    };
    tc: {
        nadpis: TitleWidget<Data>;
        poznamka: TextWidget<Data>;
        typ: RadioWidget<Data>;
        model: ChooserWidget<Data>;
        cislo: InputWidget<Data>;
        model2: ChooserWidget<Data>;
        cislo2: InputWidget<Data>;
        model3: ChooserWidget<Data>;
        cislo3: InputWidget<Data>;
        model4: ChooserWidget<Data>;
        cislo4: InputWidget<Data>;
    };
    sol: {
        title: TitleWidget<Data>;
        typ: InputWidget<Data>;
        pocet: InputWidget<Data>;
    };
    koncovyUzivatel: {
        nadpis: TitleWidget<Data>;
        typ: RadioWidget<Data>;
        prijmeni: InputWidget<Data>;
        jmeno: InputWidget<Data>;
        narozeni: InputWidget<Data>;
        nazev: InputWidget<Data>;
        pobocka: InputWidget<Data>;
        ico: InputWidget<Data>;
        telefon: InputWidget<Data>;
        email: InputWidget<Data>;
    };
    bydliste: {
        nadpis: TitleWidget<Data>;
        obec: InputWidget<Data>;
        ulice: InputWidget<Data>;
        psc: InputWidget<Data>;
    };
    mistoRealizace: {
        nadpis: TitleWidget<Data>;
        jakoBydliste: CheckboxWidget<Data>;
        obec: InputWidget<Data>;
        ulice: InputWidget<Data>;
        psc: InputWidget<Data>;
    };
    montazka: {
        nadpis: TitleWidget<Data>;
        company: SearchWidget<Data, Company>;
        nebo: TextWidget<Data>;
        ico: InputWidget<Data>;
        zastupce: InputWidget<Data>;
        email: InputWidget<Data>;
        telefon: InputWidget<Data>;
    };
    uvedeni: {
        nadpis: TitleWidget<Data>;
        jakoMontazka: CheckboxWidget<Data>;
        company: SearchWidget<Data, Company>;
        nebo: TextWidget<Data>;
        ico: InputWidget<Data>;
        regulus: SearchWidget<Data, Technician>;
        zastupce: InputWidget<Data>;
        email: InputWidget<Data>;
        telefon: InputWidget<Data>;
    };
    vzdalenyPristup: {
        nadpis: TitleWidget<Data>;
        chce: CheckboxWidget<Data>;
        pristupMa: MultiCheckboxWidget<Data>;
        plati: RadioWidget<Data>;
    };
    ostatni: {
        zodpovednaOsoba: InputWidget<Data>;
        poznamka: InputWidget<Data>;
    };
}

export const newData = () => defaultData();