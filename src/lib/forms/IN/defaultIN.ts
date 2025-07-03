import {
    CheckboxWidget,
    ChooserWidget, CounterWidget,
    DoubleChooserWidget,
    InputWidget,
    MultiCheckboxWidget,
    RadioWidget,
    ScannerWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '../Widget.svelte.js';
import { type FormIN, unknownCompany, type UserForm } from './formIN';
import type { Company, Technician } from '$lib/client/realtime';
import { nazevFirmy, regulusCRN } from '$lib/helpers/ares';
import { isCompanyFormInvalid, typBOX } from '$lib/helpers/ir';
import { time, todayISO } from '$lib/helpers/date';
import products, { type Products } from '$lib/helpers/products';
import { p, plainArray } from '$lib/translations';

const jeFO = (d: UserForm<never>) => d.koncovyUzivatel.typ.value == `individual`;
const fo = (d: UserForm<never>) => jeFO(d);
const po = (d: UserForm<never>) => !jeFO(d);

export const userData = <D extends UserForm<D>>(): UserForm<D> => ({
    koncovyUzivatel: {
        nadpis: new TitleWidget({ text: `endUser` }),
        typ: new RadioWidget({
            label: ``, chosen: `individual`, showInXML: false,
            options: [`individual`, `company`],
        }),
        prijmeni: new InputWidget({
            label: `surname`, autocomplete: `section-user billing family-name`, show: fo, required: fo,
        }),
        jmeno: new InputWidget({
            label: `name`, show: fo, required: fo,
            autocomplete: `section-user billing given-name`,
        }),
        narozeni: new InputWidget({
            label: `birthday`, onError: `wrongDateFormat`,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, show: fo,
        }),
        nazev: new InputWidget({ label: `companyName`, show: po, required: po }),
        wrongFormat: new TextWidget({
            text: `wrongCompanyType`, showInXML: false,
            show: d => !jeFO(d) && isCompanyFormInvalid(d.koncovyUzivatel.nazev.value),
        }),
        pobocka: new InputWidget({ label: `establishment`, required: false, show: po }),
        ico: new InputWidget({
            label: `crn`, onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/, required: po, show: po,
            maskOptions: { mask: `00000000[00]` },
        }),
        telefon: new InputWidget({
            label: `phone`, onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: new InputWidget({
            label: `email`, onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            type: `email`, autocomplete: `section-user billing mobile email`,
        }),
    },
    bydliste: {
        nadpis: new TitleWidget({ text: d => jeFO(d) ? `residence` : `headquarters` }),
        ulice: new InputWidget({
            label: `street`,
            autocomplete: `section-user billing street-address`,
        }),
        obec: new InputWidget({ label: `town`, autocomplete: `section-user billing address-level2` }),
        psc: new InputWidget({
            label: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`,
            },
            autocomplete: `section-user billing home postal-code`,
        }),
    },
    mistoRealizace: {
        nadpis: new TitleWidget({ text: `realizationLocation` }),
        jakoBydliste: new CheckboxWidget<D, true>({
            label: d => jeFO(d) ? `samePlaceAsResidence` : `samePlaceAsHeadquarters`,
            required: false, showInXML: false, hideInRawData: true,
            onValueSet: (d, v) => {
                if (v) {
                    d.mistoRealizace.obec.setValue(d, d.bydliste.obec.value);
                    d.mistoRealizace.psc.setValue(d, d.bydliste.psc.value);
                    d.mistoRealizace.ulice.setValue(d, d.bydliste.ulice.value);
                }
            },
        }),
        ulice: new InputWidget({
            label: `street`,
            required: false,
            autocomplete: `section-realization shipping address-level2`,
            show: d => !d.mistoRealizace.jakoBydliste.value,
        }),
        obec: new InputWidget({
            label: `town`,
            autocomplete: `section-realization shipping address-level1`,
            show: d => !d.mistoRealizace.jakoBydliste.value,
            required: d => !d.mistoRealizace.jakoBydliste.value,
        }),
        psc: new InputWidget({
            label: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`,
            },
            autocomplete: `section-realization shipping postal-code`,
            show: d => !d.mistoRealizace.jakoBydliste.value,
            required: d => !d.mistoRealizace.jakoBydliste.value,
        }),
    },
    montazka: {
        nadpis: new TitleWidget({ text: `assemblyCompany` }),
        company: new SearchWidget<D, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: i.crn == unknownCompany.crn ? [
                    { text: p(i.companyName) },
                ] : [
                    { text: p(i.crn), width: .2 },
                    { text: p(i.companyName), width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                d.montazka.ico.setValue(d, company?.crn ?? '');
                d.montazka.email.setValue(d, company?.email ?? '');
                d.montazka.telefon.setValue(d, company?.phone ?? '');
                d.montazka.zastupce.setValue(d, company?.representative ?? '');
            },
        }),
        nebo: new TextWidget({ text: `or`, showInXML: false, show: d => d.montazka.company.value?.crn != unknownCompany.crn }),
        ico: new InputWidget({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`,
            },
            required: false,
            show: d => d.montazka.company.value?.crn != unknownCompany.crn,
        }),
        chosen: new TextWidget({
            text: async (d, t) => {
                const company = await nazevFirmy(d.montazka.ico.value);
                return company ? p(`${t.chosenCompany}: ${company}`) : '';
            }, showInXML: false, show: d => d.montazka.company.value?.crn != unknownCompany.crn,
        }),
        zastupce: new InputWidget({
            label: `representativeName`,
            autocomplete: `section-assemblyRepr billing name`,
            show: d => d.montazka.company.value?.crn != unknownCompany.crn,
        }),
        email: new InputWidget({
            label: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            autocomplete: `section-assembly billing work email`,
            show: d => d.montazka.company.value?.crn != unknownCompany.crn,
            required: false,
        }),
        telefon: new InputWidget({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`,
            show: d => d.montazka.company.value?.crn != unknownCompany.crn,
            required: false,
        }),
    },
    uvedeni: {
        nadpis: new TitleWidget({ text: `commissioning` }),
        jakoMontazka: new CheckboxWidget<D, true>({
            label: `commissionedByAssemblyCompany`, required: false, showInXML: false, hideInRawData: true,
            onValueSet: (d, v) => {
                if (v) {
                    d.uvedeni.ico.setValue(d, d.montazka.ico.value);
                    d.uvedeni.zastupce.setValue(d, d.montazka.zastupce.value);
                    d.uvedeni.email.setValue(d, d.montazka.email.value);
                    d.uvedeni.telefon.setValue(d, d.montazka.telefon.value);
                }
            },
        }),
        company: new SearchWidget<D, Company, true>({
            label: `searchCompanyInList`, items: [], getSearchItem: i => ({
                pieces: [
                    { text: p(i.crn), width: .2 },
                    { text: p(i.companyName), width: .8 },
                ],
            }), show: d => !d.uvedeni.jakoMontazka.value, showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                d.uvedeni.ico.setValue(d, company?.crn ?? '');
                d.uvedeni.email.setValue(d, company?.email ?? '');
                d.uvedeni.telefon.setValue(d, company?.phone ?? '');
                d.uvedeni.zastupce.setValue(d, company?.representative ?? '');
            },
        }),
        nebo: new TextWidget({ text: `or`, showInXML: false, show: d => !d.uvedeni.jakoMontazka.value }),
        ico: new InputWidget({
            label: `crn`,
            onError: `wrongCRNFormat`,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`,
            },
            show: d => !d.uvedeni.jakoMontazka.value,
            required: d => !d.uvedeni.jakoMontazka.value,
        }),
        chosen: new TextWidget({
            text: async (d, t) => {
                const company = await nazevFirmy(d.uvedeni.ico.value);
                return company ? p(`${t.chosenCompany}: ${company}`) : '';
            }, showInXML: false,
        }),
        regulus: new SearchWidget<D, Technician, true>({
            label: `searchRepresentative`, items: [], showInXML: false, getSearchItem: i => ({
                pieces: [
                    { text: p(i.name) },
                    { text: p(i.email) },
                    { text: p(i.phone) },
                ],
            }), show: d => d.uvedeni.ico.value == regulusCRN.toString(),
            required: d => d.uvedeni.ico.value == regulusCRN.toString(),
            hideInRawData: true, onValueSet: (d, technician) => {
                if (technician) {
                    d.uvedeni.email.setValue(d, technician.email ?? '');
                    d.uvedeni.telefon.setValue(d, technician.phone ?? '');
                    d.uvedeni.zastupce.setValue(d, technician.name ?? '');
                }
            },
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
            autocomplete: `section-commissioning billing work email`,
        }),
        telefon: new InputWidget({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            showInXML: true,
            show: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            autocomplete: `section-assembly billing work tel`,
        }),
    },
});


const heatPump = <const I extends 1 | 2 | 3 | 4>(i: I) => ({
    [`model${i == 1 ? '' : i as 2 | 3 | 4}`]: new ChooserWidget<FormIN, Products['heatPumps']>({
        label: d => d.tc.pocet.value == 1 ? `heatPumpModel` : `heatPumpModel${i}`,
        options: d =>
            d.ir.typ.value.second == p('RTC')
                ? products.heatPumpsRTC
                : d.tc.typ.value == 'airToWater'
                    ? products.heatPumpsAirToWaterCTC
                    : products.heatPumpsGroundToWater,
        required: d => d.ir.chceVyplnitK.value.includes(`heatPump`) && i <= d.tc.pocet.value,
        show: d =>
            d.ir.typ.value.second != null &&
            (d.ir.typ.value.second == p('RTC') || d.tc.typ.value != null) &&
            d.ir.chceVyplnitK.value.includes(`heatPump`) &&
            i <= d.tc.pocet.value,
        onValueSet: (d, v) => {
            if (v != null && !d.tc[`model${i == 1 ? '' : i as 2 | 3 | 4}`].options(d).includes(v)) {
                d.tc[`model${i == 1 ? '' : i as 2 | 3 | 4}`].setValue(d, null);
            }
        },
    }),
    [`cislo${i == 1 ? '' : i as 2 | 3 | 4}`]: new ScannerWidget<FormIN>({
        label: d => d.tc.pocet.value == 1 ? `heatPumpManufactureNumber` : `heatPumpManufactureNumber${i}`,
        onError: `wrongNumberFormat`,
        regex: d =>
            d.ir.typ.value.second == p('CTC')
                ? /^\d{4}-\d{4}-\d{4}$/
                : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
        capitalize: true,
        required: d => d.ir.chceVyplnitK.value.includes(`heatPump`) && i <= d.tc.pocet.value,
        maskOptions: d => ({
            mask: d.ir.typ.value.second == p('CTC') ? `0000-0000-0000` : `AA0000-AA-0000`,
            definitions: {
                A: /[A-Za-z]/,
            },
        }),
        show: d =>
            d.ir.typ.value.second != null &&
            (d.ir.typ.value.second == p('RTC') || d.tc.typ.value != null) &&
            d.ir.chceVyplnitK.value.includes(`heatPump`) &&
            i <= d.tc.pocet.value,
        processScannedText: t => t.replaceAll(/[^0-9A-Z]/g, '').slice(-12),
    }),
}) as I extends 1 ? {
    model: ChooserWidget<FormIN, Products['heatPumps']>;
    cislo: ScannerWidget<FormIN>;
} : ({
    [K in `model${I}`]: ChooserWidget<FormIN, Products['heatPumps']>;
} & {
    [K in `cislo${I}`]: ScannerWidget<FormIN>;
});

export default (): FormIN => ({
    ir: {
        typ: new DoubleChooserWidget({
            label: `controllerType`,
            options1: plainArray(['IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K', 'IR 34', 'IR 14', 'IR 12', 'SOREL']),
            options2: ({ ir: { typ: { value: { first: f } } } }) => (
                plainArray(f == p('IR 12') ? ['CTC'] : f == p('SOREL') ? ['SRS1 T', 'SRS2 TE', 'SRS3 E', 'SRS6 EP', 'STDC E', 'TRS3', 'TRS4', 'TRS5'] : ['CTC', 'RTC'])
            ),
            onValueSet: (d, v) => {
                if (v.second == p('RTC')) {
                    d.tc.typ.setValue(d, 'airToWater');
                }
                if (v.first == p('SOREL')) {
                    d.ir.cislo.setValue(d, `${todayISO()} ${time()}`);
                    d.ir.cisloBox.setValue(d, '');
                    d.vzdalenyPristup.chce.setValue(d, false);
                }
                if (v.second && !d.ir.typ.options2(d).includes(v.second)) {
                    d.ir.typ.setValue(d, { ...v, second: null });
                }
                if (v.first == p('IR 12')) {
                    d.ir.typ.setValue(d, { ...v, second: p('CTC') });
                }
            },
        }),
        cislo: new InputWidget({
            label: `serialNumber`,
            onError: `wrongNumberFormat`,
            regex: d => d.ir.typ.value.first?.includes('SOREL') ? /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/ : /[A-Z][1-9OND] [0-9]{4}/,
            capitalize: true,
            maskOptions: d => ({
                mask: d.ir.typ.value.first?.includes('SOREL') ? `0000-00-00T00:00` : `A1 0000`,
                definitions: {
                    A: /[A-Za-z]/,
                    '1': /[1-9ONDond]/,
                },
            }),
            show: d => !d.ir.typ.value.first?.includes('SOREL'),
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
                    'S': /[0-9-]/,
                },
            }),
            show: d => d.ir.typ.value.first?.includes(`BOX`) ?? false,
            required: d => d.ir.typ.value.first?.includes(`BOX`) ?? false,
        }),
        boxType: new TextWidget({
            text: (d, t) => t.refFromTemplate('recognised', [typBOX(d.ir.cisloBox.value) ?? '']), showInXML: false,
            show: d => (d.ir.typ.value.first?.includes(`BOX`) ?? false) && typBOX(d.ir.cisloBox.value) != undefined,
        }),
        chceVyplnitK: new MultiCheckboxWidget({
            label: `whatToAddInfoTo`,
            options: d => d.ir.typ.value.first?.includes(`SOREL`)
                ? [`solarCollector`]
                : [`heatPump`, `solarCollector`],
            required: false, showInXML: false,
        }),
    },
    tc: {
        nadpis: new TitleWidget({
            text: d => (d.tc.pocet.value > 1 ? `heatPumps` : `heatPump`),
            show: d => d.ir.chceVyplnitK.value.includes(`heatPump`),
        }),
        poznamka: new TextWidget({
            text: `pleaseFillInIrType`, showInXML: false,
            show: d =>
                d.ir.typ.value.second == null && d.ir.chceVyplnitK.value.includes(`heatPump`),
        }),
        typ: new RadioWidget({
            label: d => (d.tc.pocet.value > 1 ? `heatPumpsType` : `heatPumpType`),
            options: [`airToWater`, `groundToWater`],
            required: d => d.ir.chceVyplnitK.value.includes(`heatPump`),
            show: d =>
                d.ir.typ.value.second == p('CTC') && d.ir.chceVyplnitK.value.includes(`heatPump`),
        }),
        pocet: new CounterWidget({
            label: 'hpCount', min: 1, max: 4, chosen: 1, hideInRawData: true,
            onValueSet: (d, p) => {
                (['', '2', '3', '4'] as const).slice(p).forEach(i =>
                    d.tc[`model${i}`].setValue(d, null)
                );
            },
            show: d => d.ir.typ.value.second != null &&
                (d.ir.typ.value.second == p('RTC') || d.tc.typ.value != null) &&
                d.ir.chceVyplnitK.value.includes(`heatPump`),
        }),
        ...heatPump(1),
        ...heatPump(2),
        ...heatPump(3),
        ...heatPump(4),
    },
    sol: {
        title: new TitleWidget({
            text: `solarCollector`,
            show: d => d.ir.chceVyplnitK.value.includes(`solarCollector`),
        }),
        typ: new InputWidget({
            label: `solarCollectorType`,
            required: d => d.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: d => d.ir.chceVyplnitK.value.includes(`solarCollector`),
        }),
        pocet: new InputWidget({
            label: `solarCollectorCount`,
            type: `number`,
            required: d => d.ir.chceVyplnitK.value.includes(`solarCollector`),
            show: d => d.ir.chceVyplnitK.value.includes(`solarCollector`),
        }),
    },
    ...userData(),
    vzdalenyPristup: {
        nadpis: new TitleWidget({ text: `remoteAccess`, show: d => !d.ir.typ.value.first?.includes('SOREL') }),
        chce: new CheckboxWidget({
            label: `doYouWantRemoteAccess`, required: false, show: d => !d.ir.typ.value.first?.includes('SOREL'),
            onValueSet: (d, v) => {
                if (!v) {
                    d.vzdalenyPristup.pristupMa.setValue(d, []);
                    d.vzdalenyPristup.plati.setValue(d, null);
                }
            },
        }),
        pristupMa: new MultiCheckboxWidget({
            label: `whoHasAccess`,
            options: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            show: d => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
            required: d => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
        }),
        plati: new RadioWidget({
            label: `whoWillBeInvoiced`,
            options: ['assemblyCompany', 'endCustomer'] as ReturnType<FormIN['vzdalenyPristup']['plati']['options']>,
            show: d => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
            required: d => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
        }),
        zodpovednaOsoba: new InputWidget({
            label: `responsiblePerson`,
            autocomplete: `section-resp billing name`,
            show: d => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
            required: d => !d.ir.typ.value.first?.includes('SOREL') && d.vzdalenyPristup.chce.value,
        }),
    },
    ostatni: {
        poznamka: new InputWidget({ label: `note`, required: false }),
    },
});
