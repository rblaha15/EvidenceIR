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
import { type Data, type UDDA, type UserData } from './Data';
import type { Company, Technician } from '$lib/client/realtime';
import { regulusCRN } from '$lib/helpers/ares';
import { formaSpolecnostiJeSpatne, typBOX } from '$lib/helpers/ir';

const jeFO = (d: UserData<never>) => d.koncovyUzivatel.typ.value == `individual`;
const fo = ({ d }: { d: UserData<never> }) => jeFO(d);
const po = ({ d }: { d: UserData<never> }) => !jeFO(d);

export const userData = <D extends { d: UserData<D> }>(): UserData<D> => ({
    koncovyUzivatel: {
        nadpis: new TitleWidget<D>({ label: `endUser` }),
        typ: new RadioWidget<D>({
            label: ``, chosen: `individual`,
            options: [`individual`, `company`]
        }),
        prijmeni: new InputWidget<D>({
            label: `surname`, autocomplete: `section-user billing family-name`, show: fo, required: fo,
        }),
        jmeno: new InputWidget<D>({
            label: `name`, show: fo, required: fo,
            autocomplete: `section-user billing given-name`
        }),
        narozeni: new InputWidget<D>({
            label: `birthday`, onError: `wrongDateFormat`,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, show: fo,
        }),
        nazev: new InputWidget<D>({ label: `companyName`, show: po, required: po }),
        wrongFormat: new TextWidget<D>({
            label: `wrongCompanyType`, show: ({ d }) => !jeFO(d) && formaSpolecnostiJeSpatne(d.koncovyUzivatel.nazev.value),
        }),
        pobocka: new InputWidget<D>({ label: `establishment`, required: false, show: po }),
        ico: new InputWidget<D>({
            label: `crn`, onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/, required: po, show: po,
            maskOptions: { mask: `00000000[00]` }
        }),
        telefon: new InputWidget<D>({
            label: `phone`, onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: new InputWidget<D>({
            label: `email`, onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            type: `email`, autocomplete: `section-user billing mobile email`
        })
    },
    bydliste: {
        nadpis: new TitleWidget<D>({ label: ({ d }) => jeFO(d) ? `residence` : `headquarters` }),
        ulice: new InputWidget<D>({
            label: `street`,
            autocomplete: `section-user billing street-address`
        }),
        obec: new InputWidget<D>({ label: `town`, autocomplete: `section-user billing address-level2` }),
        psc: new InputWidget<D>({
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
        nadpis: new TitleWidget<D>({ label: `realizationLocation` }),
        jakoBydliste: new CheckboxWidget<D, true>({
            label: ({ d }) => jeFO(d) ? `samePlaceAsResidence` : `samePlaceAsHeadquarters`,
            required: false, showInXML: false, hideInRawData: true,
            onValueSet: (d, v) => {
                if (v) {
                    d.d.mistoRealizace.obec.setValue(d, d.d.bydliste.obec.value);
                    d.d.mistoRealizace.psc.setValue(d, d.d.bydliste.psc.value);
                    d.d.mistoRealizace.ulice.setValue(d, d.d.bydliste.ulice.value);
                }
            }
        }),
        ulice: new InputWidget<D>({
            label: `street`,
            required: false,
            autocomplete: `section-realization shipping address-level2`,
            show: ({ d }) => !d.mistoRealizace.jakoBydliste.value
        }),
        obec: new InputWidget<D>({
            label: `town`,
            autocomplete: `section-realization shipping address-level1`,
            show: ({ d }) => !d.mistoRealizace.jakoBydliste.value,
            required: ({ d }) => !d.mistoRealizace.jakoBydliste.value
        }),
        psc: new InputWidget<D>({
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
        nadpis: new TitleWidget<D>({ label: `assemblyCompany` }),
        company: new SearchWidget<D, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                if (company) {
                    d.d.montazka.ico.setValue(d, company.crn);
                    d.d.montazka.email.setValue(d, company.email ?? '');
                    d.d.montazka.telefon.setValue(d, company.phone ?? '');
                    d.d.montazka.zastupce.setValue(d, company.representative ?? '');
                }
            }
        }),
        nebo: new TextWidget<D>({ label: `or`, showInXML: false }),
        ico: new InputWidget<D>({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            },
            required: false,
        }),
        zastupce: new InputWidget<D>({
            label: `representativeName`,
            autocomplete: `section-assemblyRepr billing name`
        }),
        email: new InputWidget<D>({
            label: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            autocomplete: `section-assembly billing work email`
        }),
        telefon: new InputWidget<D>({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`
        })
    },
    uvedeni: {
        nadpis: new TitleWidget<D>({ label: `commissioning` }),
        jakoMontazka: new CheckboxWidget<D, true>({
            label: `commissionedByAssemblyCompany`, required: false, showInXML: false, hideInRawData: true,
            onValueSet: (d, v) => {
                if (v) {
                    d.d.uvedeni.ico.setValue(d, d.d.montazka.ico.value);
                    d.d.uvedeni.email.setValue(d, d.d.montazka.email.value);
                    d.d.uvedeni.telefon.setValue(d, d.d.montazka.telefon.value);
                }
            }
        }),
        company: new SearchWidget<D, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), show: ({ d }) => !d.uvedeni.jakoMontazka.value, showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                if (company) {
                    d.d.uvedeni.ico.setValue(d, company.crn);
                    d.d.uvedeni.email.setValue(d, company.email ?? '');
                    d.d.uvedeni.telefon.setValue(d, company.phone ?? '');
                    d.d.uvedeni.zastupce.setValue(d, company.representative ?? '');
                }
            }
        }),
        nebo: new TextWidget<D>({ label: `or`, showInXML: false, show: ({ d }) => !d.uvedeni.jakoMontazka.value }),
        ico: new InputWidget<D>({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            },
            show: ({ d }) => !d.uvedeni.jakoMontazka.value,
            required: ({ d }) => !d.uvedeni.jakoMontazka.value
        }),
        regulus: new SearchWidget<D, Technician, true>({
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
        zastupce: new InputWidget<D>({
            label: `representativeName`,
            autocomplete: `section-commissioningRepr billing name`,
            showInXML: true,
            show: ({ d }) => d.uvedeni.ico.value != regulusCRN.toString(),
            required: ({ d }) => d.uvedeni.ico.value != regulusCRN.toString(),
        }),
        email: new InputWidget<D>({
            label: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            showInXML: true,
            show: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: ({ d }) => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-commissioning billing work email`
        }),
        telefon: new InputWidget<D>({
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
        typ: new DoubleChooserWidget<UDDA>({
            label: `controllerType`,
            options1: [p`IR RegulusBOX`, p`IR RegulusHBOX`, p`IR RegulusHBOXK`, p`IR 34`, p`IR 14`, p`IR 12`, p`SOREL`],
            options2: ({ d: { ir: { typ: { value: { first: f } } } } }) => (
                f == p`IR 12` ? [p`CTC`] : f == p`SOREL` ? [p`SRS1 T`, p`SRS2 TE`, p`SRS3 E`, p`SRS6 EP`, p`STDC E`, p`TRS3`, p`TRS4`, p`TRS5`] : [p`CTC`, p`RTC`]
            ),
        }),
        cislo: new InputWidget<UDDA>({
            label: `serialNumber`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) => d.ir.typ.value.first?.includes('SOREL') ? /[0-9]{4}-[0-9]{2}-[0-9]{2}/ : /[A-Z][1-9OND] [0-9]{4}/,
            capitalize: true,
            maskOptions: ({ d }) => ({
                mask: d.ir.typ.value.first?.includes('SOREL') ? `0000-00-00` : `A1 0000`,
                definitions: {
                    A: /[A-Za-z]/,
                    '1': /[1-9ONDond]/
                }
            }),
            show: ({ d }) => !d.ir.typ.value.first?.includes('SOREL'),
        }),
        cisloBox: new InputWidget<UDDA>({
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
        boxType: new TextWidget<UDDA>({
            label: ({ d }, t) => t.refFromTemplate('recognised', [typBOX(d.ir.cisloBox.value) ?? '']),
            show: ({ d }) => (d.ir.typ.value.first?.includes(`BOX`) ?? false) && typBOX(d.ir.cisloBox.value) != undefined,
        }),
        chceVyplnitK: new MultiCheckboxWidget<UDDA>({
            label: `whatToAddInfoTo`,
            options: ({ d }) => d.ir.typ.value.first?.includes(`SOREL`)
                ? [`heatPump`]
                : [`heatPump`, `solarCollector`],
            required: false, showInXML: false
        })
    },
    tc: {
        nadpis: new TitleWidget<UDDA>({
            label: ({ d }) => (d.tc.model2.value != `noPump` ? `heatPumps` : `heatPump`),
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        poznamka: new TextWidget<UDDA>({
            label: `pleaseFillInIrType`,
            show: ({ d }) =>
                d.ir.typ.value.second == null && d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        typ: new RadioWidget<UDDA>({
            label: ({ d }) => (d.tc.model2.value != `noPump` ? `heatPumpsType` : `heatPumpType`),
            options: [`airToWater`, `groundToWater`],
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`heatPump`),
            show: ({ d }) =>
                d.ir.typ.value.second == p`CTC` && d.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model: new ChooserWidget<UDDA>({
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
        cislo: new InputWidget<UDDA>({
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
        model2: new ChooserWidget<UDDA>({
            label: `heatPumpModel2`,
            options: ({ d }) => [`noPump`, ...d.tc.model.options({ d })],
            required: false,
            chosen: `noPump`,
            show: ({ d }) => d.tc.model.show({ d }) && d.tc.model.value != null
        }),
        cislo2: new InputWidget<UDDA>({
            label: `heatPumpManufactureNumber2`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) => d.tc.cislo.regex({ d }),
            capitalize: true,
            required: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model2.value != `noPump`,
            maskOptions: ({ d }) => d.tc.cislo.maskOptions({ d }),
            show: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model2.value != `noPump`
        }),
        model3: new ChooserWidget<UDDA>({
            label: `heatPumpModel3`,
            options: ({ d }) => [`noPump`, ...d.tc.model.options({ d })],
            required: false,
            chosen: `noPump`,
            show: ({ d }) => d.tc.model.show({ d }) && d.tc.model2.value != `noPump`
        }),
        cislo3: new InputWidget<UDDA>({
            label: `heatPumpManufactureNumber3`,
            onError: `wrongNumberFormat`,
            regex: ({ d }) => d.tc.cislo.regex({ d }),
            capitalize: true,
            required: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model3.value != `noPump`,
            maskOptions: ({ d }) => d.tc.cislo.maskOptions({ d }),
            show: ({ d }) => d.tc.cislo.show({ d }) && d.tc.model3.value != `noPump`
        }),
        model4: new ChooserWidget<UDDA>({
            label: `heatPumpModel4`,
            options: ({ d }) => [`noPump`, ...d.tc.model.options({ d })],
            required: false,
            chosen: `noPump`,
            show: ({ d }) => d.tc.model.show({ d }) && d.tc.model3.value != `noPump`
        }),
        cislo4: new InputWidget<UDDA>({
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
        title: new TitleWidget<UDDA>({
            label: `solarCollector`,
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        typ: new InputWidget<UDDA>({
            label: `solarCollectorType`,
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        pocet: new InputWidget<UDDA>({
            label: `solarCollectorCount`,
            type: `number`,
            required: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: ({ d }) => d.ir.chceVyplnitK.value.includes(`solarCollector`)
        })
    },
    ...userData(),
    vzdalenyPristup: {
        nadpis: new TitleWidget<UDDA>({ label: `remoteAccess`, show: ({ d }) => !d.ir.typ.value.first?.includes('SOREL') }),
        chce: new CheckboxWidget<UDDA>({ label: `doYouWantRemoteAccess`, required: false, show: ({ d }) => !d.ir.typ.value.first?.includes('SOREL') }),
        pristupMa: new MultiCheckboxWidget<UDDA>({
            label: `whoHasAccess`,
            options: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            show: ({ d }) => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
            required: ({ d }) => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value
        }),
        plati: new RadioWidget<UDDA>({
            label: `whoWillBeInvoiced`,
            options: ['assemblyCompany', 'endCustomer'],
            show: ({ d }) => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
            required: ({ d }) => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value
        })
    },
    ostatni: {
        zodpovednaOsoba: new InputWidget<UDDA>({
            label: `responsiblePerson`,
            autocomplete: `section-resp billing name`
        }),
        poznamka: new InputWidget<UDDA>({ label: `note`, required: false })
    }
});
