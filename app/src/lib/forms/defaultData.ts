import { DvojVybiratkova, MultiZaskrtavatkova, Nadpisova, p, Pisatkova, Radiova, SearchWidget, Textova, Vybiratkova, Zaskrtavatkova } from '../Vec.svelte.js';
import { type Data } from './Data';
import type { Company, Technician } from '$lib/client/realtime';
import { regulusCRN } from '$lib/helpers/ares';

const jeFO = (d: Data) => d.koncovyUzivatel.typ.value == `individual`;
const fo = (d: Data) => jeFO(d);
const po = (d: Data) => !jeFO(d);

export default (): Data => ({
    ir: {
        typ: new DvojVybiratkova({
            nazev: `controllerType`,
            moznosti1: [p`IR RegulusBOX`, p`IR RegulusHBOX`, p`IR RegulusHBOXK`, p`IR 14`, p`IR 12`],
            moznosti2: (d) => (d.ir.typ.value.first == p`IR 12` ? [p`CTC`] : [p`CTC`, p`RTC`])
        }),
        cislo: new Pisatkova({
            nazev: `serialNumber`,
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
        cisloBox: new Pisatkova({
            nazev: `serialNumberIndoor`,
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
            zobrazit: (data) => data.ir.typ.value.first?.includes(`BOX`) ?? false,
            required: (data) => data.ir.typ.value.first?.includes(`BOX`) ?? false
        }),
        chceVyplnitK: new MultiZaskrtavatkova({
            nazev: `whatToAddInfoTo`,
            moznosti: [
                `heatPump`,
                `solarCollector` //fve
            ],
            required: false, showInXML: false
        })
    },
    tc: {
        nadpis: new Nadpisova({
            nazev: (data) => (data.tc.model2.value != `noPump` ? `heatPumps` : `heatPump`),
            zobrazit: (data) => data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        poznamka: new Textova({
            nazev: `pleaseFillInIrType`,
            zobrazit: (data) =>
                data.ir.typ.value.second == null && data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        typ: new Radiova({
            nazev: (data) => (data.tc.model2.value != `noPump` ? `heatPumpsType` : `heatPumpType`),
            moznosti: [`airToWater`, `groundToWater`],
            required: (data) => data.ir.chceVyplnitK.value.includes(`heatPump`),
            zobrazit: (data) =>
                data.ir.typ.value.second == p`CTC` && data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model: new Vybiratkova({
            nazev: (data) => (data.tc.model2.value != `noPump` ? `heatPumpModel1` : `heatPumpModel`),
            moznosti: (data) =>
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
            required: (data) => data.ir.chceVyplnitK.value.includes(`heatPump`),
            zobrazit: (data) =>
                data.ir.typ.value.second != null &&
                (data.ir.typ.value.second == p`RTC` || data.tc.typ.value != null) &&
                data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        cislo: new Pisatkova({
            nazev: (data) =>
                data.tc.model2.value != `noPump`
                    ? `heatPumpManufactureNumber1`
                    : `heatPumpManufactureNumber`,
            onError: `wrongNumberFormat`,
            regex: (data) =>
                data.ir.typ.value.second == p`CTC`
                    ? /^\d{4}-\d{4}-\d{4}$/
                    : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
            capitalize: true,
            required: (data) => data.ir.chceVyplnitK.value.includes(`heatPump`),
            maskOptions: (data) => ({
                mask: data.ir.typ.value.second == p`CTC` ? `0000-0000-0000` : `AA0000-AA-0000`,
                definitions: {
                    A: /[A-Za-z]/
                }
            }),
            zobrazit: (data) =>
                data.ir.typ.value.second != null && data.ir.chceVyplnitK.value.includes(`heatPump`)
        }),
        model2: new Vybiratkova({
            nazev: `heatPumpModel2`,
            moznosti: (data) => [`noPump`, ...data.tc.model.moznosti(data)],
            required: false,
            vybrano: `noPump`,
            zobrazit: (data) => data.tc.model.zobrazit(data) && data.tc.model.value != null
        }),
        cislo2: new Pisatkova({
            nazev: `heatPumpManufactureNumber2`,
            onError: `wrongNumberFormat`,
            regex: (data) => data.tc.cislo.regex(data),
            capitalize: true,
            required: (data) => data.tc.cislo.zobrazit(data) && data.tc.model2.value != `noPump`,
            maskOptions: (data) => data.tc.cislo.maskOptions(data),
            zobrazit: (data) => data.tc.cislo.zobrazit(data) && data.tc.model2.value != `noPump`
        }),
        model3: new Vybiratkova({
            nazev: `heatPumpModel3`,
            moznosti: (data) => [`noPump`, ...data.tc.model.moznosti(data)],
            required: false,
            vybrano: `noPump`,
            zobrazit: (data) => data.tc.model.zobrazit(data) && data.tc.model2.value != `noPump`
        }),
        cislo3: new Pisatkova({
            nazev: `heatPumpManufactureNumber3`,
            onError: `wrongNumberFormat`,
            regex: (data) => data.tc.cislo.regex(data),
            capitalize: true,
            required: (data) => data.tc.cislo.zobrazit(data) && data.tc.model3.value != `noPump`,
            maskOptions: (data) => data.tc.cislo.maskOptions(data),
            zobrazit: (data) => data.tc.cislo.zobrazit(data) && data.tc.model3.value != `noPump`
        }),
        model4: new Vybiratkova({
            nazev: `heatPumpModel4`,
            moznosti: (data) => [`noPump`, ...data.tc.model.moznosti(data)],
            required: false,
            vybrano: `noPump`,
            zobrazit: (data) => data.tc.model.zobrazit(data) && data.tc.model3.value != `noPump`
        }),
        cislo4: new Pisatkova({
            nazev: `heatPumpManufactureNumber4`,
            onError: `wrongNumberFormat`,
            regex: (data) => data.tc.cislo.regex(data),
            capitalize: true,
            required: (data) => data.tc.cislo.zobrazit(data) && data.tc.model4.value != `noPump`,
            maskOptions: (data) => data.tc.cislo.maskOptions(data),
            zobrazit: (data) => data.tc.cislo.zobrazit(data) && data.tc.model4.value != `noPump`,
        })
    },
    sol: {
        title: new Nadpisova({
            nazev: `solarCollector`,
            zobrazit: (data) => data.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        typ: new Pisatkova({
            nazev: `solarCollectorType`,
            required: (data) => data.ir.chceVyplnitK.value.includes(`solarCollector`),
            zobrazit: (data) => data.ir.chceVyplnitK.value.includes(`solarCollector`)
        }),
        pocet: new Pisatkova({
            nazev: `solarCollectorCount`,
            type: `number`,
            required: (data) => data.ir.chceVyplnitK.value.includes(`solarCollector`),
            zobrazit: (data) => data.ir.chceVyplnitK.value.includes(`solarCollector`)
        })
    },
    koncovyUzivatel: {
        nadpis: new Nadpisova({ nazev: `endUser` }),
        typ: new Radiova({
            nazev: ``, vybrano: `individual`,
            moznosti: [`individual`, `company`]
        }),
        prijmeni: new Pisatkova({
            nazev: `surname`, autocomplete: `section-user billing family-name`, zobrazit: fo, required: fo,
        }),
        jmeno: new Pisatkova({
            nazev: `name`, zobrazit: fo, required: fo,
            autocomplete: `section-user billing given-name`
        }),
        narozeni: new Pisatkova({
            nazev: `birthday`, onError: `wrongDateFormat`,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, zobrazit: fo,
        }),
        nazev: new Pisatkova({ nazev: `companyName`, zobrazit: po, required: po }),
        pobocka: new Pisatkova({ nazev: `establishment`, required: false, zobrazit: po }),
        ico: new Pisatkova({
            nazev: `crn`, onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/, required: po, zobrazit: po,
            maskOptions: { mask: `00000000[00]` }
        }),
        telefon: new Pisatkova({
            nazev: `phone`, onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: new Pisatkova({
            nazev: `email`, onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            type: `email`, autocomplete: `section-user billing mobile email`
        })
    },
    bydliste: {
        nadpis: new Nadpisova({ nazev: d => jeFO(d) ? `residence` : `headquarters` }),
        ulice: new Pisatkova({
            nazev: `street`,
            autocomplete: `section-user billing street-address`
        }),
        obec: new Pisatkova({ nazev: `town`, autocomplete: `section-user billing address-level2` }),
        psc: new Pisatkova({
            nazev: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`
            },
            autocomplete: `section-user billing home postal-code`
        })
    },
    mistoRealizace: {
        nadpis: new Nadpisova({ nazev: `realizationLocation` }),
        jakoBydliste: new Zaskrtavatkova({
            nazev: d => jeFO(d) ? `samePlaceAsResidence` : `samePlaceAsHeadquarters`,
            required: false, showInXML: false,
        }),
        ulice: new Pisatkova({
            nazev: `street`,
            required: false,
            autocomplete: `section-realization shipping address-level2`,
            zobrazit: (data) => !data.mistoRealizace.jakoBydliste.value
        }),
        obec: new Pisatkova({
            nazev: `town`,
            autocomplete: `section-realization shipping address-level1`,
            zobrazit: (data) => !data.mistoRealizace.jakoBydliste.value,
            required: (data) => !data.mistoRealizace.jakoBydliste.value
        }),
        psc: new Pisatkova({
            nazev: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`
            },
            autocomplete: `section-realization shipping postal-code`,
            zobrazit: (data) => !data.mistoRealizace.jakoBydliste.value,
            required: (data) => !data.mistoRealizace.jakoBydliste.value
        })
    },
    montazka: {
        nadpis: new Nadpisova({ nazev: `assemblyCompany` }),
        company: new SearchWidget<Data, Company>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), showInXML: false,
        }),
        nebo: new Textova({ nazev: `or`, showInXML: false }),
        ico: new Pisatkova({
            nazev: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            }
        }),
        zastupce: new Pisatkova({
            nazev: `representativeName`,
            autocomplete: `section-assemblyRepr billing name`
        }),
        email: new Pisatkova({
            nazev: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            autocomplete: `section-assembly billing work email`
        }),
        telefon: new Pisatkova({
            nazev: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`
        })
    },
    uvedeni: {
        nadpis: new Nadpisova({ nazev: `commissioning` }),
        jakoMontazka: new Zaskrtavatkova({ nazev: `commissionedByAssemblyCompany`, required: false, showInXML: false }),
        company: new SearchWidget<Data, Company>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p`${i.crn}`, width: .2 },
                    { text: p`${i.companyName}`, width: .8 },
                ],
            }), show: d => !d.uvedeni.jakoMontazka.value, showInXML: false,
        }),
        nebo: new Textova({ nazev: `or`, showInXML: false, zobrazit: d => !d.uvedeni.jakoMontazka.value }),
        ico: new Pisatkova({
            nazev: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`
            },
            zobrazit: (data) => !data.uvedeni.jakoMontazka.value,
            required: (data) => !data.uvedeni.jakoMontazka.value
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
        zastupce: new Pisatkova({
            nazev: `representativeName`,
            autocomplete: `section-commissioningRepr billing name`,
            showInXML: true,
            zobrazit: d => d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => d.uvedeni.ico.value != regulusCRN.toString(),
        }),
        email: new Pisatkova({
            nazev: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            showInXML: true,
            zobrazit: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-commissioning billing work email`
        }),
        telefon: new Pisatkova({
            nazev: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            showInXML: true,
            zobrazit: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-assembly billing work tel`
        })
    },
    vzdalenyPristup: {
        nadpis: new Nadpisova({ nazev: `remoteAccess` }),
        chce: new Zaskrtavatkova({ nazev: `doYouWantRemoteAccess`, required: false }),
        pristupMa: new MultiZaskrtavatkova({
            nazev: `whoHasAccess`,
            moznosti: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            zobrazit: (data) => data.vzdalenyPristup.chce.value,
            required: (data) => data.vzdalenyPristup.chce.value
        }),
        plati: new Radiova({
            nazev: `whoWillBeInvoiced`,
            moznosti: ['assemblyCompany', 'endCustomer'],
            zobrazit: (data) => data.vzdalenyPristup.chce.value,
            required: (data) => data.vzdalenyPristup.chce.value
        })
    },
    ostatni: {
        zodpovednaOsoba: new Pisatkova({
            nazev: `responsiblePerson`,
            autocomplete: `section-resp billing name`
        }),
        poznamka: new Pisatkova({ nazev: `note`, required: false })
    }
});
