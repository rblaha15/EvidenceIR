import {
    ButtonWidget,
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
} from '../Widget.svelte.js';
import { type FormIN, type IRSubTypes, type IRTypes, unknownCompany, unknownCRN, type UserForm } from './formIN';
import { type Company, type Technician, techniciansList } from '$lib/client/realtime';
import ares, { regulusCRN } from '$lib/helpers/ares';
import {
    companyForms,
    doesNotHaveIRNumber,
    doesNotSupportHeatPumps,
    isBox,
    isCompanyFormInvalid,
    isCTC,
    isMACAddressTypeIR10,
    isMACAddressTypeIR12,
    supportsMACAddresses,
    supportsOnlyCTC,
    supportsRemoteAccess,
    typBOX,
} from '$lib/helpers/ir';
import { dayISO, time } from '$lib/helpers/date';
import products, { type Products } from '$lib/helpers/products';
import type { Translations } from '$lib/translations';
import { derived } from 'svelte/store';
import { assemblyCompanies, commissioningCompanies } from '$lib/helpers/companies';
import type { FormPlus } from '$lib/forms/Form';

const jeFO = (d: UserForm<never>) => d.koncovyUzivatel.typ.value == `individual`;
const fo = (d: UserForm<never>) => jeFO(d);
const po = (d: UserForm<never>) => !jeFO(d);

const tc = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`heatPump`);
const sol = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`solarCollector`);
const rek = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`ventilation`);
const fve = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`photovoltaicPowerPlant`);
const other = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`other`);

const ctc = (d: FormIN) => d.ir.typ.value.first == 'ctc' || d.ir.typ.value.second == 'CTC';
const rtc = (d: FormIN) => d.ir.typ.value.second == 'RTC';
const subType = (d: FormIN) => d.ir.typ.value.second != null;

const supportsRemoteAccessF = (f: FormIN) => supportsRemoteAccess(f.ir.typ.value.first);
const irOther = (d: FormIN) => d.ir.typ.value.first == 'other';
const irCTC = (d: FormIN) => d.ir.typ.value.first == 'ctc';
const fveReg = (d: FormIN) => fve(d) && d.fve.typ.value == 'DG-450-B';

export const userData = <D extends UserForm<D>>(): FormPlus<UserForm<D>> => ({
    koncovyUzivatel: {
        nadpis: new TitleWidget({ text: t => t.in.endUser, level: 2 }),
        typ: new RadioWidget({
            label: '', chosen: `individual`, showInXML: false,
            options: [`individual`, `company`], labels: t => t.in.userType,
        }),
        prijmeni: new InputWidget({
            label: t => t.in.surname, autocomplete: `section-user billing family-name`, show: fo, required: fo,
        }),
        jmeno: new InputWidget({
            label: t => t.in.name, show: fo, required: fo,
            autocomplete: `section-user billing given-name`,
        }),
        narozeni: new InputWidget({
            label: t => t.in.birthday, onError: t => t.wrong.date,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, show: fo,
        }),
        company: new SearchWidget<D, Company, true>({
            items: derived(assemblyCompanies, c => c.filter(c => companyForms.some(f => c.companyName.endsWith(f)))),
            label: t => t.in.searchCompanyInList, getSearchItem: i => ({
                pieces: [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true, show: false,
            onValueSet: (d, company) => {
                d.koncovyUzivatel.nazev.setValue(d, company?.companyName ?? '');
                d.koncovyUzivatel.ico.setValue(d, company?.crn ?? '');
                d.koncovyUzivatel.kontaktniOsoba.setValue(d, company?.representative ?? '');
                d.koncovyUzivatel.telefon.setValue(d, company?.phone ?? '');
                d.koncovyUzivatel.email.setValue(d, company?.email ?? '');
                if (company?.crn) ares.getNameAndAddress(company.crn).then(ares => {
                    const s = ares?.sidlo;
                    d.bydliste.psc.setValue(d, s?.psc?.toString() ?? s?.pscTxt ?? '');
                    d.bydliste.obec.setValue(d, [s?.nazevObce, s?.nazevCastiObce].filterNotUndefined().join(' - '));
                    d.bydliste.ulice.setValue(d, [s?.nazevUlice, [s?.cisloDomovni, s?.cisloOrientacni?.let(o => o + (s?.cisloOrientacniPismeno ?? ''))].filterNotUndefined().join('/')].filterNotUndefined().join(' '));
                }); else {
                    d.bydliste.psc.setValue(d, '');
                    d.bydliste.obec.setValue(d, '');
                    d.bydliste.ulice.setValue(d, '');
                }
            },
        }),
        or: new TextWidget({ text: t => t.in.or_CRN, showInXML: false, show: false }),
        nazev: new InputWidget({ label: t => t.in.companyName, show: po, required: po }),
        wrongFormat: new TextWidget({
            text: t => t.wrong.company, showInXML: false,
            show: d => !jeFO(d) && isCompanyFormInvalid(d.koncovyUzivatel.nazev.value),
        }),
        pobocka: new InputWidget({ label: t => t.in.establishment, required: false, show: po }),
        ico: new InputWidget({
            label: t => t.in.crn, onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/, required: po, show: po,
            maskOptions: { mask: `00000000[00]` },
        }),
        kontaktniOsoba: new InputWidget({ label: t => t.in.contactPerson, required: false, show: po }),
        telefon: new InputWidget({
            label: t => t.in.phone, onError: t => t.wrong.phone,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: new InputWidget({
            label: t => t.in.email, onError: t => t.wrong.email,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            type: `email`, autocomplete: `section-user billing mobile email`,
        }),
    },
    bydliste: {
        _title: new TitleWidget({ text: (t, d) => jeFO(d) ? t.in.residence : t.in.headquarters, level: 4 }),
        ulice: new InputWidget({
            label: t => t.in.street,
            autocomplete: `section-user billing street-address`,
        }),
        obec: new InputWidget({ label: t => t.in.town, autocomplete: `section-user billing address-level2` }),
        psc: new InputWidget({
            label: t => t.in.zip,
            onError: t => t.wrong.zip,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`,
            },
            autocomplete: `section-user billing home postal-code`,
        }),
    },
    mistoRealizace: {
        _title: new TitleWidget({ text: t => t.in.realizationLocation, level: 4 }),
        _setAsResidence: new ButtonWidget<D>({
            text: (t, d) => jeFO(d) ? t.in.copyResidence : t.in.copyHeadquarters,
            color: 'secondary', onClick: d => {
                d.mistoRealizace.obec.setValue(d, d.bydliste.obec.value);
                d.mistoRealizace.psc.setValue(d, d.bydliste.psc.value);
                d.mistoRealizace.ulice.setValue(d, d.bydliste.ulice.value);
            },
        }),
        ulice: new InputWidget({
            label: t => t.in.street, required: false, showInXML: true,
            autocomplete: `section-realization shipping address-level2`,
        }),
        obec: new InputWidget({
            label: t => t.in.town, showInXML: true,
            autocomplete: `section-realization shipping address-level1`,
        }),
        psc: new InputWidget({
            label: t => t.in.zip, showInXML: true,
            onError: t => t.wrong.zip,
            regex: /^\d{3} \d{2}$/,
            maskOptions: {
                mask: `000 00`,
            },
            autocomplete: `section-realization shipping postal-code`,
        }),
    },
    montazka: {
        _titleCompanies: new TitleWidget({ text: t => t.in.associatedCompanies, level: 2 }),
        _title: new TitleWidget({ text: t => t.in.assemblyCompany, level: 4 }),
        company: new SearchWidget<D, Company, true>({
            items: t => derived(assemblyCompanies, c => [unknownCompany(t), ...c]),
            label: t => t.in.searchCompanyInList, getSearchItem: i => ({
                pieces: i.crn == unknownCRN ? [
                    { text: i.companyName },
                ] : [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                d.montazka.ico.setValue(d, company?.crn ?? '');
                d.montazka.email.setValue(d, company?.email ?? '');
                d.montazka.telefon.setValue(d, company?.phone ?? '');
                d.montazka.zastupce.setValue(d, company?.representative ?? '');
            },
        }),
        _or: new TextWidget({ text: t => t.in.or_CRN, showInXML: false, show: d => d.montazka.company.value?.crn != unknownCRN }),
        ico: new InputWidget({
            label: t => t.in.crnToARES,
            onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`,
            },
            required: false, showInXML: true,
            show: d => d.montazka.company.value?.crn != unknownCRN,
        }),
        chosen: new TextWidget({
            text: async (t, d) => {
                const company = await ares.getName(d.montazka.ico.value);
                return company ? `${t.in.chosenCompany}: ${company}` : '';
            }, showInXML: false, show: d => d.montazka.company.value?.crn != unknownCRN,
        }),
        zastupce: new InputWidget({
            label: t => t.in.representativeName, showInXML: true,
            autocomplete: `section-assemblyRepr billing name`,
            show: d => d.montazka.company.value?.crn != unknownCRN,
        }),
        email: new InputWidget({
            label: t => t.in.email,
            onError: t => t.wrong.email,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            autocomplete: `section-assembly billing work email`,
            show: d => d.montazka.company.value?.crn != unknownCRN,
            required: false, showInXML: true,
        }),
        telefon: new InputWidget({
            label: t => t.in.phone,
            onError: t => t.wrong.phone,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`,
            show: d => d.montazka.company.value?.crn != unknownCRN,
            required: false, showInXML: true,
        }),
    },
    uvedeni: {
        _title: new TitleWidget({ text: t => t.in.commissioning, level: 4 }),
        _setAsAssembly: new ButtonWidget<D>({
            text: t => t.in.copyAssemblyCompany, color: 'secondary',
            onClick: d => {
                d.uvedeni.company.setValue(d, d.montazka.company.value);
                d.uvedeni.ico.setValue(d, d.montazka.ico.value);
                d.uvedeni.zastupce.setValue(d, d.montazka.zastupce.value);
                d.uvedeni.email.setValue(d, d.montazka.email.value);
                d.uvedeni.telefon.setValue(d, d.montazka.telefon.value);
            },
        }),
        company: new SearchWidget<D, Company, true>({
            items: t => derived(commissioningCompanies, c => [unknownCompany(t), ...c]),
            label: t => t.in.searchCompanyInList, getSearchItem: i => ({
                pieces: i.crn == unknownCRN ? [
                    { text: i.companyName },
                ] : [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (d, company) => {
                d.uvedeni.ico.setValue(d, company?.crn ?? '');
                d.uvedeni.email.setValue(d, company?.email ?? '');
                d.uvedeni.telefon.setValue(d, company?.phone ?? '');
                d.uvedeni.zastupce.setValue(d, company?.representative ?? '');
            },
        }),
        _or: new TextWidget({ text: t => t.in.or_CRN, showInXML: false, show: d => d.montazka.company.value?.crn != unknownCRN }),
        ico: new InputWidget({
            label: t => t.in.crnToARES,
            onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`,
            }, showInXML: true,
            show: d => d.uvedeni.company.value?.crn != unknownCRN,
        }),
        chosen: new TextWidget({
            text: async (t, d) => {
                if (d.uvedeni.ico.value == unknownCRN) return '';
                const company = await ares.getName(d.uvedeni.ico.value);
                return company ? `${t.in.chosenCompany}: ${company}` : '';
            }, showInXML: false,
        }),
        _regulus: new SearchWidget<D, Technician, true>({
            items: derived(techniciansList, $technicians =>
                $technicians.filter(t => t.email.endsWith('cz')),
            ),
            label: t => t.in.searchRepresentative, showInXML: false, getSearchItem: i => ({
                pieces: [
                    { text: i.name },
                    { text: i.email },
                    { text: i.phone },
                ],
            }), show: d => d.uvedeni.ico.value == regulusCRN.toString(), required: false,
            hideInRawData: true, onValueSet: (d, technician) => {
                if (technician) {
                    d.uvedeni.email.setValue(d, technician.email ?? '');
                    d.uvedeni.telefon.setValue(d, technician.phone ?? '');
                    d.uvedeni.zastupce.setValue(d, technician.name ?? '');
                }
            },
        }),
        zastupce: new InputWidget({
            label: t => t.in.representativeName,
            autocomplete: `section-commissioningRepr billing name`,
            showInXML: true,
            show: d => d.uvedeni.company.value?.crn != unknownCRN,
        }),
        email: new InputWidget({
            label: t => t.in.email,
            onError: t => t.wrong.email,
            regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            showInXML: true,
            show: d => d.uvedeni.company.value?.crn != unknownCRN,
            required: false,
            autocomplete: `section-commissioning billing work email`,
        }),
        telefon: new InputWidget({
            label: t => t.in.phone,
            onError: t => t.wrong.phone,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            showInXML: true,
            show: d => d.uvedeni.company.value?.crn != unknownCRN,
            required: false,
            autocomplete: `section-assembly billing work tel`,
        }),
    },
});


type B = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TC = 1 | B;
export const TCNumbers = ['', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

export const ordinal = (tg: Translations['countsGenitive'], i: TC) =>
    ['', tg.first, tg.second, tg.third, tg.fourth, tg.fifth, tg.sixth, tg.seventh, tg.eighth, tg.ninth, tg.tenth][i];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const heatPump = <const I extends TC>(i: I) => ({
    [`model${i == 1 ? '' : i as B}`]: new ChooserWidget<FormIN, Products['heatPumps']>({
        label: (t, d) => cap(t.in.heatPumpModel([d.tc.pocet.value == 1 ? '' : ordinal(t.countsGenitive, i) + ' '])),
        options: d =>
            rtc(d)
                ? products.heatPumpsRTC
                : d.tc.typ.value == 'airToWater'
                    ? products.heatPumpsAirToWaterCTC
                    : products.heatPumpsGroundToWater,
        required: d => tc(d) && i <= d.tc.pocet.value,
        show: d =>
            subType(d) &&
            (rtc(d) || d.tc.typ.value != null) &&
            tc(d) &&
            i <= d.tc.pocet.value,
        onValueSet: (d, v) => {
            if (v != null && !d.tc[`model${i == 1 ? '' : i as B}`].options(d).includes(v)) {
                d.tc[`model${i == 1 ? '' : i as B}`].setValue(d, null);
            }
        },
    }),
    [`cislo${i == 1 ? '' : i as B}`]: new ScannerWidget<FormIN>({
        label: (t, d) => cap(t.in.heatPumpManufactureNumber([d.tc.pocet.value == 1 ? '' : ordinal(t.countsGenitive, i) + ' '])),
        onError: t => t.wrong.number,
        regex: d => ctc(d)
            ? /^\d{4}-\d{4}-\d{4}$/
            : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
        capitalize: true,
        required: d => tc(d) && i <= d.tc.pocet.value,
        maskOptions: d => ({
            mask: ctc(d) ? `0000-0000-0000` : `AA0000-AA-0000`,
            definitions: {
                A: /[A-Za-z]/,
            },
        }),
        show: d =>
            subType(d) &&
            (rtc(d) || d.tc.typ.value != null) &&
            tc(d) &&
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

export const irTypeAndNumber = <D extends {
    ir: {
        typ: DoubleChooserWidget<D, IRTypes, IRSubTypes>,
        cislo: InputWidget<D>,
    }
}>(
    { setAirToWater, resetRemoteAccess, resetBoxNumber, setFVEType, setHP }: {
        setAirToWater?: (d: D) => void,
        resetRemoteAccess?: (d: D) => void,
        resetBoxNumber?: (d: D) => void,
        setFVEType?: (d: D) => void
        setHP?: (d: D) => void
    },
): {
    typ: DoubleChooserWidget<D, IRTypes, IRSubTypes>,
    cislo: InputWidget<D>,
} => ({
    typ: new DoubleChooserWidget({
        label: t => t.in.controllerType,
        options1: ['IR 14', 'IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K'],
        options2: ({ ir: { typ: { value: { first: f } } } }) => (
            f == 'SOREL' ? ['SRS1 T', 'SRS2 TE', 'SRS3 E', 'SRS6 EP', 'STDC E', 'TRS3', 'TRS4', 'TRS5', 'TRS6 K']
                : f == 'ctc' ? ['EcoEl', 'EcoZenith']
                    : supportsOnlyCTC(f) ? ['CTC']
                        : doesNotSupportHeatPumps(f) ? []
                            : ['CTC', 'RTC']
        ),
        otherOptions1: ['IR 34', 'IR 30', 'IR 12', 'IR 10', 'SOREL', 'ctc', 'other'],
        onValueSet: (d, v) => {
            if (v.second == 'RTC') {
                setAirToWater?.(d);
            }
            if (doesNotHaveIRNumber(v.first)) {
                d.ir.cislo.setValue(d, `${dayISO()} ${time()}`);
            }
            if (!supportsRemoteAccess(v.first)) {
                resetRemoteAccess?.(d);
            }
            if (isBox(v.first)) {
                resetBoxNumber?.(d);
            }
            if (v.second && !d.ir.typ.options2(d).includes(v.second)) {
                d.ir.typ.setValue(d, { ...v, second: null });
            }
            if (v.first != 'ctc' && supportsOnlyCTC(v.first) && v.second != 'CTC') {
                d.ir.typ.setValue(d, { ...v, second: 'CTC' });
            }
            if (doesNotSupportHeatPumps(v.first) && v.second) {
                d.ir.typ.setValue(d, { ...v, second: null });
            }
            if (v.first == 'ctc') {
                setHP?.(d);
            }
            if (v.first == 'other') {
                setFVEType?.(d);
            }
        },
        labels: t => t.in.ir,
    }),
    cislo: new InputWidget({
        label: t => t.in.serialNumber,
        onError: t => t.wrong.number,
        regex: d => doesNotHaveIRNumber(d.ir.typ.value.first)
            ? /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/
            : isCTC(d.ir.typ.value.first)
                ? /[0-9]{4}-[0-9]{4}-[0-9]{4}/
                : isMACAddressTypeIR12(d.ir.typ.value.first)
                    ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:09:[0-9A-F]{2}:[0-9A-F]{2}/
                    : isMACAddressTypeIR10(d.ir.typ.value.first)
                        ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:06:[0-9A-F]{2}:[0-9A-F]{2}/
                        : /[A-Z][1-9OND] [0-9]{4}/,
        capitalize: true,
        maskOptions: d => ({
            mask: doesNotHaveIRNumber(d.ir.typ.value.first) ? `0000-00-00T00:00`
                : isCTC(d.ir.typ.value.first) ? `0000-0000-0000`
                    : !supportsMACAddresses(d.ir.typ.value.first) ? 'Z8 0000'
                        : d.ir.cislo.value.length == 0 ? 'X'
                            : d.ir.cislo.value[0] == '0'
                                ? isMACAddressTypeIR10(d.ir.typ.value.first)
                                    ? 'NN:NA:14:N6:FF:FF'
                                    : 'NN:NA:14:N9:FF:FF'
                                : 'Z8 0000',
            definitions: {
                X: /[0A-Za-z]/,
                N: /0/,
                A: /[Aa]/,
                6: /6/,
                9: /9/,
                1: /1/,
                4: /4/,
                F: /[0-9A-Fa-f]/,
                Z: /[A-Za-z]/,
                8: /[1-9ONDond]/,
            },
        }),
        show: d => !doesNotHaveIRNumber(d.ir.typ.value.first),
    }),
});

export default (): FormIN => ({
    ir: {
        nadpisSystem: new TitleWidget({ text: t => t.in.system, level: 2 }),
        nadpis: new TitleWidget({ text: t => t.in.controller, level: 4 }),
        ...irTypeAndNumber<FormIN>({
            setAirToWater: d => d.tc.typ.setValue(d, 'airToWater'),
            resetBoxNumber: d => d.ir.cisloBox.setValue(d, ''),
            resetRemoteAccess: d => d.vzdalenyPristup.chce.setValue(d, false),
            setFVEType: d => d.fve.typ.setValue(d, 'DG-450-B'),
            setHP: d => d.ir.chceVyplnitK.setValue(d, ['heatPump']),
        }),
        cisloBox: new InputWidget({
            label: t => t.in.serialNumberIndoor,
            onError: t => t.wrong.number,
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
            show: d => isBox(d.ir.typ.value.first),
            required: d => isBox(d.ir.typ.value.first),
        }),
        boxType: new TextWidget({
            text: (t, d) => t.in.recognised_BOX([typBOX(d.ir.cisloBox.value) ?? '']), showInXML: false,
            show: d => isBox(d.ir.typ.value.first) && typBOX(d.ir.cisloBox.value) != undefined,
        }),
        chceVyplnitK: new MultiCheckboxWidget({
            label: t => t.in.whatToAddInfoTo,
            options: d => irOther(d) ? [`solarCollector`, 'photovoltaicPowerPlant']
                : irCTC(d) ? [`heatPump`]
                    : doesNotSupportHeatPumps(d.ir.typ.value.first)
                        ? ['solarCollector', 'ventilation', `photovoltaicPowerPlant`, 'other']
                        : [`heatPump`, `solarCollector`, `ventilation`, `photovoltaicPowerPlant`, 'other'] as const,
            required: false, showInXML: false, onValueSet: (d, v) => {
                if (!v.includes('heatPump')) {
                    d.tc.typ.setValue(d, null);
                    d.tc.pocet.setValue(d, 0);
                } else {
                    d.tc.pocet.setValue(d, 1);
                }
                if (!v.includes('solarCollector')) {
                    d.sol.typ.setValue(d, '');
                    d.sol.pocet.setValue(d, '');
                }
                if (!v.includes('ventilation')) {
                    d.rek.typ.setValue(d, '');
                }
                if (!v.includes('photovoltaicPowerPlant')) {
                    d.fve.pocet.setValue(d, '');
                    d.fve.typStridace.setValue(d, '');
                    d.fve.cisloStridace.setValue(d, '');
                    d.fve.akumulaceDoBaterii.setValue(d, false);
                    d.fve.typBaterii.setValue(d, '');
                    d.fve.kapacitaBaterii.setValue(d, '');
                    d.fve.wallbox.setValue(d, false);
                    d.fve.spolupraceIR.setValue(d, false);
                }
                if (!v.includes('other')) {
                    d.jine.popis.setValue(d, '');
                }
            }, labels: t => t.in.device, lock: irCTC,
        }),
    },
    tc: {
        nadpis: new TitleWidget({
            text: (t, d) => d.tc.pocet.value > 1 ? t.in.heatPumps : t.in.device.heatPump,
            show: tc, level: 4,
        }),
        poznamka: new TextWidget({
            text: t => t.in.pleaseFillInIrType, showInXML: false,
            show: d => !subType(d) && tc(d),
        }),
        typ: new RadioWidget({
            label: (t, d) => d.tc.pocet.value > 1 ? t.in.heatPumpsType : t.in.heatPumpType,
            options: [`airToWater`, `groundToWater`], required: tc,
            show: d => ctc(d) && tc(d),
            labels: t => t.in.tc,
        }),
        pocet: new CounterWidget({
            label: t => t.in.hpCount, min: 1, max: 10, chosen: 1, hideInRawData: true,
            onValueSet: (d, p) => {
                TCNumbers.slice(p).forEach(i =>
                    d.tc[`model${i}`].setValue(d, null),
                );
            },
            show: d => subType(d) &&
                (rtc(d) || d.tc.typ.value != null) &&
                tc(d),
        }),
        ...heatPump(1),
        ...heatPump(2),
        ...heatPump(3),
        ...heatPump(4),
        ...heatPump(5),
        ...heatPump(6),
        ...heatPump(7),
        ...heatPump(8),
        ...heatPump(9),
        ...heatPump(10),
    },
    sol: {
        title: new TitleWidget({
            text: t => t.in.device.solarCollector, show: sol, level: 4,
        }),
        typ: new InputWidget({
            label: t => t.in.solarCollectorType, required: sol, show: sol,
        }),
        pocet: new InputWidget({
            label: t => t.in.solarCollectorCount, type: `number`, required: sol, show: sol,
        }),
    },
    rek: {
        title: new TitleWidget({ text: t => t.in.device.ventilation, show: rek, level: 4 }),
        typ: new InputWidget({
            label: t => t.in.recoveryVentilationUnitType,
            required: rek, show: rek,
        }),
    },
    fve: {
        title: new TitleWidget({
            text: t => t.in.photovoltaicSystem,
            show: fve, level: 4,
        }),
        typ: new ChooserWidget({
            label: t => t.in.panelType, chosen: 'DG-450-B',
            required: fve, show: fve, lock: irOther,
            options: d => irOther(d) ? ['DG-450-B'] : ['DG-450-B', 'otherNotRegulusPanels'],
            labels: t => t.in.fve,
        }),
        pocet: new InputWidget({
            label: t => t.in.panelCount, type: `number`, required: fveReg, show: fveReg,
        }),
        typStridace: new InputWidget({
            label: t => t.in.inverterType, required: fveReg, show: fveReg,
        }),
        cisloStridace: new InputWidget({
            label: t => t.in.inverterManufactureNumber, required: fveReg, show: fveReg,
        }),
        akumulaceDoBaterii: new CheckboxWidget({
            label: t => t.in.accumulationToBatteries, required: false, show: fveReg,
        }),
        typBaterii: new InputWidget({
            label: t => t.in.batteryType,
            required: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
            show: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
        }),
        kapacitaBaterii: new InputWidget({
            label: t => t.in.totalBatteryCapacity, type: 'number', suffix: t => t.units.kWh,
            required: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
            show: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
        }),
        wallbox: new CheckboxWidget({
            label: t => t.in.chargingStationWallbox, required: false, show: fveReg,
        }),
        spolupraceIR: new CheckboxWidget({
            label: t => t.in.irCooperation, required: false, show: fve,
        }),
    },
    jine: {
        title: new TitleWidget({
            text: t => t.in.device.other,
            show: other, level: 4,
        }),
        popis: new InputWidget({
            label: t => t.in.description, required: other, show: other,
        }),
    },
    ...userData(),
    vzdalenyPristup: {
        nadpis: new TitleWidget({ text: t => t.in.remoteAccess.title, show: supportsRemoteAccessF, level: 2 }),
        chce: new CheckboxWidget({
            label: t => t.in.remoteAccess.doYouWantRemoteAccess, required: false, show: supportsRemoteAccessF,
            onValueSet: (d, v) => {
                if (!v) {
                    d.vzdalenyPristup.pristupMa.setValue(d, []);
                    d.vzdalenyPristup.plati.setValue(d, null);
                }
            },
        }),
        pristupMa: new MultiCheckboxWidget({
            label: t => t.in.remoteAccess.whoHasAccess,
            options: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            show: d => supportsRemoteAccessF(d) && d.vzdalenyPristup.chce.value,
            required: d => supportsRemoteAccessF(d) && d.vzdalenyPristup.chce.value,
            labels: t => t.in.remoteAccess,
        }),
        plati: new RadioWidget({
            label: t => t.in.remoteAccess.whoWillBeInvoiced,
            options: ['assemblyCompany', 'endCustomer'] as ReturnType<FormIN['vzdalenyPristup']['plati']['options']>,
            show: d => supportsRemoteAccessF(d) && d.vzdalenyPristup.chce.value,
            required: d => supportsRemoteAccessF(d) && d.vzdalenyPristup.chce.value,
            labels: t => t.in.remoteAccess,
        }),
        zodpovednaOsoba: new InputWidget({
            label: t => t.in.remoteAccess.responsiblePerson,
            autocomplete: `section-resp billing name`,
            show: d => supportsRemoteAccessF(d) && d.vzdalenyPristup.chce.value,
            required: d => supportsRemoteAccessF(d) && d.vzdalenyPristup.chce.value,
        }),
    },
    ostatni: {
        poznamka: new InputWidget({ label: t => t.in.note, required: false }),
    },
});
