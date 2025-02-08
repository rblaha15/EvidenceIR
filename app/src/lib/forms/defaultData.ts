import { DoubleChooserWidget, MultiCheckboxWidget, TitleWidget, p, InputWidget, RadioWidget, SearchWidget, TextWidget, ChooserWidget, CheckboxWidget } from '../Widget.svelte.js';
import { type Data } from './Data';
import type { Company, Technician } from '$lib/client/realtime';
import { regulusCRN } from '$lib/helpers/ares';

const jeFO = (d: Data) => d.koncovyUzivatel.typ.value == `individual`;
const fo = (d: Data) => jeFO(d);
const po = (d: Data) => !jeFO(d);

export default (): Data => ({
    ir: {
        typ: new DoubleChooserWidget({
            label: `controllerType`,
            options1: [p`IR RegulusBOX`, p`IR RegulusHBOX`, p`IR RegulusHBOXK`, p`IR 14`, p`IR 12`],
            options2: (d) => (d.ir.typ.value.first == p`IR 12` ? [p`CTC`] : [p`CTC`, p`RTC`])
        }),
        cislo: new InputWidget({
            label: `serialNumber`,
            onError: `wrongNumberFormat`,
            regex: /([A-Z][1-9OND]) ([0-9]{4})/,
            capitalize: true,
            maskOptions: {
                mask: `A1 0000`,
                definitions: {
                    A: /[A-Za-z]/,
                    '1': /[1-9ONDond]/
                }
            }
        }),
        cisloBox: new InputWidget({
            label: `serialNumberIndoor`,
            onError: `wrongNumberFormat`,
            regex: d => d.ir.cisloBox.value.length < 6 ? /[0-9]{5}[0-9-]/ : d.ir.cisloBox.value[5] == '-'
                ? /[0-9]{5}-[0-9]-[0-9]{4}-[0-9]{3}/
                : /[0-9]{7}-[0-9]{7}/,
            maskOptions: d => ({
                mask: d.ir.cisloBox.value.length < 6 ? `00000S` : d.ir.cisloBox.value[5] == '-'
                    ? `00000-0-0000-000`
                    : `0000000-0000000`,
                definitions: {
                    'S': /[0-9-]/
                },
            }),
            show: data => data.ir.typ.value.first?.includes(`BOX`) ?? false,
            required: data => data.ir.typ.value.first?.includes(`BOX`) ?? false
        }),
        chceVyplnitK: new MultiCheckboxWidget({
            label: `whatToAddInfoTo`,
            options: [
                `heatPump`,
                `solarCollector` //fve
            ],
            required: false, showInXML: false
        })
    },
    tc: {
        nadpis: new TitleWidget({
            label: data => (data.tc.model2.value != `noPump` ? `heatPumps` : `heatPump`),
            show: data => data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        poznamka: new TextWidget({
            label: `pleaseFillInIrType`,
            show: data =>
                data.ir.typ.value.second == null && data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        typ: new RadioWidget({
            label: data => (data.tc.model2.value != `noPump` ? `heatPumpsType` : `heatPumpType`),
            options: [`airToWater`, `groundToWater`],
            required: data => data.ir.chceVyplnitK.value.includes(`heatPump`),
            show: data =>
                data.ir.typ.value.second == p`CTC` && data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model: new ChooserWidget({
            label: data => (data.tc.model2.value != `noPump` ? `heatPumpModel1` : `heatPumpModel`),
            options: data =>
                data.ir.typ.value.second == p`RTC`
                    ? [p`RTC 6i`, p`RTC 13e`, p`RTC 20e`]
                    : data.tc.typ.value == 'airToWater'
                        ? [
                            p`EcoAir 614M`,
                            p`EcoAir 622M`,
                            p`EcoAir 406`,
                            p`EcoAir 408`,
                            p`EcoAir 410`,
                            p`EcoAir 415`,
                            p`EcoAir 420`
                        ]
                        : [
                            p`EcoPart 612M`,
                            p`EcoPart 616M`,
                            p`EcoPart 406`,
                            p`EcoPart 408`,
                            p`EcoPart 410`,
                            p`EcoPart 412`,
                            p`EcoPart 414`,
                            p`EcoPart 417`,
                            p`EcoPart 435`
                        ],
            required: data => data.ir.chceVyplnitK.value.includes(`heatPump`),
            show: data =>
                data.ir.typ.value.second != null &&
                (data.ir.typ.value.second == p`RTC` || data.tc.typ.value != null) &&
                data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        cislo: new InputWidget({
            label: data =>
                data.tc.model2.value != `noPump`
                    ? `heatPumpManufactureNumber1`
                    : `heatPumpManufactureNumber`,
            onError: `wrongNumberFormat`,
            regex: data =>
                data.ir.typ.value.second == p`CTC`
                    ? /^\d{4}-\d{4}-\d{4}$/
                    : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
            capitalize: true,
            required: data => data.ir.chceVyplnitK.value.includes(`heatPump`),
            maskOptions: data => ({
                mask: data.ir.typ.value.second == p`CTC` ? `0000-0000-0000` : `AA0000-AA-0000`,
                definitions: {
                    A: /[A-Za-z]/
                }
            }),
            show: data =>
                data.ir.typ.value.second != null && data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model2: new ChooserWidget({
            label: `heatPumpModel2`,
            options: data => [`noPump`, ...data.tc.model.options(data)],
            required: false,
            chosen: `noPump`,
            show: data => data.tc.model.show(data) && data.tc.model.value != null
        }),
        cislo2: new InputWidget({
            label: `heatPumpManufactureNumber2`,
            onError: `wrongNumberFormat`,
            regex: data => data.tc.cislo.regex(data),
            capitalize: true,
            required: data => data.tc.cislo.show(data) && data.tc.model2.value != `noPump`,
            maskOptions: data => data.tc.cislo.maskOptions(data),
            show: data => data.tc.cislo.show(data) && data.tc.model2.value != `noPump`
        }),
        model3: new ChooserWidget({
            label: `heatPumpModel3`,
            options: data => [`noPump`, ...data.tc.model.options(data)],
            required: false,
            chosen: `noPump`,
            show: data => data.tc.model.show(data) && data.tc.model2.value != `noPump`
        }),
        cislo3: new InputWidget({
            label: `heatPumpManufactureNumber3`,
            onError: `wrongNumberFormat`,
            regex: data => data.tc.cislo.regex(data),
            capitalize: true,
            required: data => data.tc.cislo.show(data) && data.tc.model3.value != `noPump`,
            maskOptions: data => data.tc.cislo.maskOptions(data),
            show: data => data.tc.cislo.show(data) && data.tc.model3.value != `noPump`
        }),
        model4: new ChooserWidget({
            label: `heatPumpModel4`,
            options: data => [`noPump`, ...data.tc.model.options(data)],
            required: false,
            chosen: `noPump`,
            show: data => data.tc.model.show(data) && data.tc.model3.value != `noPump`
        }),
        cislo4: new InputWidget({
            label: `heatPumpManufactureNumber4`,
            onError: `wrongNumberFormat`,
            regex: data => data.tc.cislo.regex(data),
            capitalize: true,
            required: data => data.tc.cislo.show(data) && data.tc.model4.value != `noPump`,
            maskOptions: data => data.tc.cislo.maskOptions(data),
            show: data => data.tc.cislo.show(data) && data.tc.model4.value != `noPump`,
        })
    },
    sol: {
        title: new TitleWidget({
            label: `solarCollector`,
            show: data => data.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        typ: new InputWidget({
            label: `solarCollectorType`,
            required: data => data.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: data => data.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        pocet: new InputWidget({
            label: `solarCollectorCount`,
            type: `number`,
            required: data => data.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: data => data.ir.chceVyplnitK.value.includes(`solarCollector`)
        })
    },
    koncovyUzivatel: {
        nadpis: new TitleWidget({ label: `endUser` }),
        typ: new RadioWidget({
            label: ``, chosen: `individual`,
            options: [`individual`, `company`]
        }),
        prijmeni: new InputWidget({
            label: `surname`, autocomplete: `section-user billing family-name`, show: fo, required: fo,
        }),
        jmeno: new InputWidget({
            label: `name`, show: fo, required: fo,
            autocomplete: `section-user billing given-name`
        }),
        narozeni: new InputWidget({
            label: `birthday`, onError: `wrongDateFormat`,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, show: fo,
        }),
        nazev: new InputWidget({ label: `companyName`, show: po, required: po }),
        pobocka: new InputWidget({ label: `establishment`, required: false, show: po }),
        ico: new InputWidget({
            label: `crn`, onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/, required: po, show: po,
            maskOptions: { mask: `00000000[00]` }
        }),
        telefon: new InputWidget({
            label: `phone`, onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: new InputWidget({
            label: `email`, onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            type: `email`, autocomplete: `section-user billing mobile email`
        })
    },
    bydliste: {
        nadpis: new TitleWidget({ label: d => jeFO(d) ? `residence` : `headquarters` }),
        ulice: new InputWidget({
            label: `street`,
            autocomplete: `section-user billing street-address`
        }),
        obec: new InputWidget({ label: `town`, autocomplete: `section-user billing address-level2` }),
        psc: new InputWidget({
            label: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`
            },
            autocomplete: `section-user billing home postal-code`
        })
    },
    mistoRealizace: {
        nadpis: new TitleWidget({ label: `realizationLocation` }),
        jakoBydliste: new CheckboxWidget({
            label: d => jeFO(d) ? `samePlaceAsResidence` : `samePlaceAsHeadquarters`,
            required: false, showInXML: false,
        }),
        ulice: new InputWidget({
            label: `street`,
            required: false,
            autocomplete: `section-realization shipping address-level2`,
            show: data => !data.mistoRealizace.jakoBydliste.value
        }),
        obec: new InputWidget({
            label: `town`,
            autocomplete: `section-realization shipping address-level1`,
            show: data => !data.mistoRealizace.jakoBydliste.value,
            required: data => !data.mistoRealizace.jakoBydliste.value
        }),
        psc: new InputWidget({
            label: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`
            },
            autocomplete: `section-realization shipping postal-code`,
            show: data => !data.mistoRealizace.jakoBydliste.value,
            required: data => !data.mistoRealizace.jakoBydliste.value
        })
    },
    montazka: {
        nadpis: new TitleWidget({ label: `assemblyCompany` }),
        company: new SearchWidget<Data, Company>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), showInXML: false, required: false,
        }),
        nebo: new TextWidget({ label: `or`, showInXML: false }),
        ico: new InputWidget({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            }
        }),
        zastupce: new InputWidget({
            label: `representativeName`,
            autocomplete: `section-assemblyRepr billing name`
        }),
        email: new InputWidget({
            label: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            autocomplete: `section-assembly billing work email`
        }),
        telefon: new InputWidget({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`
        })
    },
    uvedeni: {
        nadpis: new TitleWidget({ label: `commissioning` }),
        jakoMontazka: new CheckboxWidget({ label: `commissionedByAssemblyCompany`, required: false, showInXML: false }),
        company: new SearchWidget<Data, Company>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), show: d => !d.uvedeni.jakoMontazka.value, showInXML: false, required: false,
        }),
        nebo: new TextWidget({ label: `or`, showInXML: false, show: d => !d.uvedeni.jakoMontazka.value }),
        ico: new InputWidget({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            },
            show: data => !data.uvedeni.jakoMontazka.value,
            required: data => !data.uvedeni.jakoMontazka.value
        }),
        regulus: new SearchWidget<Data, Technician>({
            label: `searchRepresentative`, items: [], showInXML: false, getSearchItem: i => ({
                pieces: [
                    { text: p`${i.name}` },
                    { text: p`${i.email}` },
                    { text: p`${i.phone}` },
                ],
            }), show: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value == regulusCRN.toString(),
            required: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value == regulusCRN.toString(),
        }),
        zastupce: new InputWidget({
            label: `representativeName`,
            autocomplete: `section-commissioningRepr billing name`,
            showInXML: true,
            show: d => d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => d.uvedeni.ico.value != regulusCRN.toString(),
        }),
        email: new InputWidget({
            label: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            showInXML: true,
            show: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-commissioning billing work email`
        }),
        telefon: new InputWidget({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            showInXML: true,
            show: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-assembly billing work tel`
        })
    },
    vzdalenyPristup: {
        nadpis: new TitleWidget({ label: `remoteAccess` }),
        chce: new CheckboxWidget({ label: `doYouWantRemoteAccess`, required: false }),
        pristupMa: new MultiCheckboxWidget({
            label: `whoHasAccess`,
            options: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            show: data => data.vzdalenyPristup.chce.value,
            required: data => data.vzdalenyPristup.chce.value
        }),
        plati: new RadioWidget({
            label: `whoWillBeInvoiced`,
            options: ['assemblyCompany', 'endCustomer'],
            show: data => data.vzdalenyPristup.chce.value,
            required: data => data.vzdalenyPristup.chce.value
        })
    },
    ostatni: {
        zodpovednaOsoba: new InputWidget({
            label: `responsiblePerson`,
            autocomplete: `section-resp billing name`
        }),
        poznamka: new InputWidget({ label: `note`, required: false })
    }
});
