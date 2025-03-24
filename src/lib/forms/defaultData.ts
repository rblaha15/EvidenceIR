import {
    CheckboxWidget,
    ChooserWidget,
    DoubleChooserWidget,
    InputWidget,
    MultiCheckboxWidget,
    p,
    RadioWidget,
    SearchWidget,
    TextWidget,
    TitleWidget
} from '../Widget.svelte.js';
import { type Data } from './Data';
import type { Company, Technician } from '$lib/client/realtime';
import { regulusCRN } from '$lib/helpers/ares';

const jeFO = (d: Pick<Data<never>, UserSections>) => d.koncovyUzivatel.typ.value == `individual`;
const fo = ({ d }: { d: Pick<Data<never>, UserSections> }) => jeFO(d);
const po = ({ d }: { d: Pick<Data<never>, UserSections> }) => !jeFO(d);

export type UserSections = 'koncovyUzivatel' | 'bydliste' | 'uvedeni' | 'montazka' | 'mistoRealizace'

export const userData = <D extends { d: Pick<Data<D>, UserSections> }>(): Pick<Data<D>, UserSections> => ({
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
        nadpis: new TitleWidget({ label: ({ d }) => jeFO(d) ? `residence` : `headquarters` }),
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
            label: ({ d }) => jeFO(d) ? `samePlaceAsResidence` : `samePlaceAsHeadquarters`,
            required: false, showInXML: false, hideInRawData: true,
        }),
        ulice: new InputWidget({
            label: `street`,
            required: false,
            autocomplete: `section-realization shipping address-level2`,
            show: ({ d }) => !d.mistoRealizace.jakoBydliste.value
        }),
        obec: new InputWidget({
            label: `town`,
            autocomplete: `section-realization shipping address-level1`,
            show: ({ d }) => !d.mistoRealizace.jakoBydliste.value,
            required: ({ d }) => !d.mistoRealizace.jakoBydliste.value
        }),
        psc: new InputWidget({
            label: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`
            },
            autocomplete: `section-realization shipping postal-code`,
            show: ({ d }) => !d.mistoRealizace.jakoBydliste.value,
            required: ({ d }) => !d.mistoRealizace.jakoBydliste.value
        })
    },
    montazka: {
        nadpis: new TitleWidget({ label: `assemblyCompany` }),
        company: new SearchWidget<{ d: Pick<Data<D>, UserSections> }, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
        }),
        nebo: new TextWidget({ label: `or`, showInXML: false }),
        ico: new InputWidget({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            },
            required: false,
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
        jakoMontazka: new CheckboxWidget({ label: `commissionedByAssemblyCompany`, required: false, showInXML: false, hideInRawData: true }),
        company: new SearchWidget<{ d: Pick<Data<D>, UserSections> }, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), show: ({ d }) => !d.uvedeni.jakoMontazka.value, showInXML: false, required: false, hideInRawData: true,
        }),
        nebo: new TextWidget({ label: `or`, showInXML: false, show: ({ d }) => !d.uvedeni.jakoMontazka.value }),
        ico: new InputWidget({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            },
            show: ({ d }) => !d.uvedeni.jakoMontazka.value,
            required: ({ d }) => !d.uvedeni.jakoMontazka.value
        }),
        regulus: new SearchWidget<{ d: Pick<Data<D>, UserSections> }, Technician, true>({
            label: `searchRepresentative`, items: [], showInXML: false, getSearchItem: i => ({
                pieces: [
                    { text: p`${i.name}` },
                    { text: p`${i.email}` },
                    { text: p`${i.phone}` },
                ],
            }), show: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value == regulusCRN.toString(),
            required: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value == regulusCRN.toString(),
            hideInRawData: true,
        }),
        zastupce: new InputWidget({
            label: `representativeName`,
            autocomplete: `section-commissioningRepr billing name`,
            showInXML: true,
            show: ({ d }) => d.uvedeni.ico.value != regulusCRN.toString(),
            required: ({ d }) => d.uvedeni.ico.value != regulusCRN.toString(),
        }),
        email: new InputWidget({
            label: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            showInXML: true,
            show: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-commissioning billing work email`
        }),
        telefon: new InputWidget({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            showInXML: true,
            show: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-assembly billing work tel`
        })
    },
});

export default (): Data => ({
    ir: {
        typ: new DoubleChooserWidget({
            label: `controllerType`,
            options1: [p`IR RegulusBOX`, p`IR RegulusHBOX`, p`IR RegulusHBOXK`, p`IR 14`, p`IR 12`],
            options2: ({ d }) => (d.ir.typ.value.first == p`IR 12` ? [p`CTC`] : [p`CTC`, p`RTC`])
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
            regex: ({ d }) => d.ir.cisloBox.value.length < 6 ? /[0-9]{5}[0-9-]/ : d.ir.cisloBox.value[5] == '-'
                ? /[0-9]{5}-[0-9]-[0-9]{4}-[0-9]{3}/
                : /[0-9]{7}-[0-9]{7}/,
            maskOptions: ({ d }) => ({
                mask: d.ir.cisloBox.value.length < 6 ? `00000S` : d.ir.cisloBox.value[5] == '-'
                    ? `00000-0-0000-000`
                    : `0000000-0000000`,
                definitions: {
                    'S': /[0-9-]/
                },
            }),
            show: ({ d }) => d.ir.typ.value.first?.includes(`BOX`) ?? false,
            required: ({ d }) => d.ir.typ.value.first?.includes(`BOX`) ?? false
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
            label: ({ d }) => (d.tc.model2.value != `noPump` ? `heatPumps` : `heatPump`),
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        poznamka: new TextWidget({
            label: `pleaseFillInIrType`,
            show: ({ d }) =>
                d.ir.typ.value.second == null && d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        typ: new RadioWidget({
            label: ({ d }) => (d.tc.model2.value != `noPump` ? `heatPumpsType` : `heatPumpType`),
            options: [`airToWater`, `groundToWater`],
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`heatPump`),
            show: ({ d }) =>
                d.ir.typ.value.second == p`CTC` && d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model: new ChooserWidget({
            label: ({ d }) => (d.tc.model2.value != `noPump` ? `heatPumpModel1` : `heatPumpModel`),
            options: ({ d }) =>
                d.ir.typ.value.second == p`RTC`
                    ? [p`RTC 6i`, p`RTC 13e`, p`RTC 20e`]
                    : d.tc.typ.value == 'airToWater'
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
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`heatPump`),
            show: ({ d }) =>
                d.ir.typ.value.second != null &&
                (d.ir.typ.value.second == p`RTC` || d.tc.typ.value != null) &&
                d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        cislo: new InputWidget({
            label: ({ d }) =>
                d.tc.model2.value != `noPump`
                    ? `heatPumpManufactureNumber1`
                    : `heatPumpManufactureNumber`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) =>
                d.ir.typ.value.second == p`CTC`
                    ? /^\d{4}-\d{4}-\d{4}$/
                    : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
            capitalize: true,
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`heatPump`),
            maskOptions: ({ d }) => ({
                mask: d.ir.typ.value.second == p`CTC` ? `0000-0000-0000` : `AA0000-AA-0000`,
                definitions: {
                    A: /[A-Za-z]/
                }
            }),
            show: ({ d }) => d.ir.typ.value.second != null && d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model2: new ChooserWidget({
            label: `heatPumpModel2`,
            options: ({ d }) => [`noPump`, ...d.tc.model.options({ d })],
            required: false,
            chosen: `noPump`,
            show: ({ d }) => d.tc.model.show({ d }) && d.tc.model.value != null
        }),
        cislo2: new InputWidget({
            label: `heatPumpManufactureNumber2`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) => d.tc.cislo.regex({ d }),
            capitalize: true,
            required: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model2.value != `noPump`,
            maskOptions: ({ d }) => d.tc.cislo.maskOptions({ d }),
            show: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model2.value != `noPump`
        }),
        model3: new ChooserWidget({
            label: `heatPumpModel3`,
            options: ({ d }) => [`noPump`, ...d.tc.model.options({ d })],
            required: false,
            chosen: `noPump`,
            show: ({ d }) => d.tc.model.show({ d }) && d.tc.model2.value != `noPump`
        }),
        cislo3: new InputWidget({
            label: `heatPumpManufactureNumber3`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) => d.tc.cislo.regex({ d }),
            capitalize: true,
            required: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model3.value != `noPump`,
            maskOptions: ({ d }) => d.tc.cislo.maskOptions({ d }),
            show: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model3.value != `noPump`
        }),
        model4: new ChooserWidget({
            label: `heatPumpModel4`,
            options: ({ d }) => [`noPump`, ...d.tc.model.options({ d })],
            required: false,
            chosen: `noPump`,
            show: ({ d }) => d.tc.model.show({ d }) && d.tc.model3.value != `noPump`
        }),
        cislo4: new InputWidget({
            label: `heatPumpManufactureNumber4`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) => d.tc.cislo.regex({ d }),
            capitalize: true,
            required: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model4.value != `noPump`,
            maskOptions: ({ d }) => d.tc.cislo.maskOptions({ d }),
            show: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model4.value != `noPump`,
        })
    },
    sol: {
        title: new TitleWidget({
            label: `solarCollector`,
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        typ: new InputWidget({
            label: `solarCollectorType`,
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        pocet: new InputWidget({
            label: `solarCollectorCount`,
            type: `number`,
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`)
        })
    },
    ...userData<{ d: Data }>(),
    vzdalenyPristup: {
        nadpis: new TitleWidget({ label: `remoteAccess` }),
        chce: new CheckboxWidget({ label: `doYouWantRemoteAccess`, required: false }),
        pristupMa: new MultiCheckboxWidget({
            label: `whoHasAccess`,
            options: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            show: ({ d }) => d.vzdalenyPristup.chce.value,
            required: ({ d }) => d.vzdalenyPristup.chce.value
        }),
        plati: new RadioWidget({
            label: `whoWillBeInvoiced`,
            options: ['assemblyCompany', 'endCustomer'],
            show: ({ d }) => d.vzdalenyPristup.chce.value,
            required: ({ d }) => d.vzdalenyPristup.chce.value
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
