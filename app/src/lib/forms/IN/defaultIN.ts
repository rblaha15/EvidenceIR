import {
    newRadioWidget,
    newTitleWidget,
    type ChooserWidget,
    type ScannerWidget, newInputWidget, newButtonWidget, newHiddenValueWidget, newTextWidget, newSearchWidget, newChooserWidget,
    newScannerWidget,
    newDoubleChooserWidget,
    newMultiCheckboxWidget, newCounterWidget, newCheckboxWidget,
} from '../Widget';
import { type ContextIN, type FormIN, unknownCompany, unknownCRN, type UserForm, type UserFormContext } from './formIN';
import {
    accumulationTanks, batteries,
    type Company,
    inverters,
    solarCollectors,
    type Technician,
    techniciansList,
    waterTanks,
} from '$lib/client/realtime';
import ares, { regulusCRN } from '$lib/helpers/ares';
import {
    doesNotHaveIRNumber,
    doesNotSupportHeatPumps,
    extractIRIDFromParts,
    hasIndoorUnit,
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
import { type HeatPump, heatPumps } from '$lib/helpers/products';
import type { Translations } from '$lib/translations';
import { derived } from 'svelte/store';
import { assemblyCompanies, commissioningCompanies } from '$lib/helpers/companies';
import type { FormPlus } from '$lib/forms/Form';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import db from '$lib/Database';
import ruian from '$lib/helpers/ruian';
import { Search } from "@lucide/svelte";

const jeFO = (c: UserFormContext<never>) => c.v.koncovyUzivatel.typ == `individual`;
const fo = (c: UserFormContext<never>) => jeFO(c);
const po = (c: UserFormContext<never>) => !jeFO(c);

const tc = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`heatPump`);
const sol = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`solarCollector`);
const aku = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`accumulation`);
const zas = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`waterStorage`);
const rek = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`ventilation`);
const fve = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`photovoltaicPowerPlant`);
const other = (c: ContextIN) => c.v.ir.chceVyplnitK.includes(`other`);

const ctc = (c: ContextIN) => c.v.ir.typ.first == 'ctc' || c.v.ir.typ.second == 'CTC';
const rtc = (c: ContextIN) => c.v.ir.typ.second == 'RTC';
const thermona = (c: ContextIN) => c.v.ir.typ.first == 'Thermona';
const ecoHeat = (c: ContextIN) => c.v.ir.typ.second == 'EcoHeat';
const subType = (c: ContextIN) => c.v.ir.typ.second != null;

const supportsRemoteAccessC = (c: ContextIN) => supportsRemoteAccess(c.v.ir.typ.first);
const irOther = (c: ContextIN) => c.v.ir.typ.first == 'other';
const irCTC = (c: ContextIN) => c.v.ir.typ.first == 'ctc';
const fveReg = (c: ContextIN) => fve(c) && c.v.fve.typ == 'DG-450-B';
const akuDuo = (c: ContextIN) => aku(c) && c.v.tanks.accumulation.toUpperCase().startsWith('DUO');

export const separatorsRegExp = /[ ,;\/]/;
export const phoneRegExp = /(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}/;
export const emailRegExp = /[\w.-]+@([\w-]+\.)+[\w-]{2,4}/;
export const multiple = (r: RegExp) => new RegExp(`${r.source}(?: ?${separatorsRegExp.source} ?${r.source})*`);

export const userData = <C extends UserFormContext<C>>(): FormPlus<UserForm<C>> => ({
    koncovyUzivatel: {
        nadpis: newTitleWidget({ text: t => t.in.endUser, level: 2 }),
        typ: newRadioWidget({
            label: '', chosen: `individual`, showInXML: false,
            options: [`individual`, `company`], labels: t => t.in.userType,
        }),
        jmeno: newInputWidget({
            label: t => t.in.name, show: fo, required: fo,
            autocomplete: `section-user billing given-name`,
        }),
        prijmeni: newInputWidget({
            label: t => t.in.surname, autocomplete: `section-user billing family-name`, show: fo, required: fo,
        }),
        narozeni: newInputWidget({
            label: t => t.in.birthday, onError: t => t.wrong.date,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, show: fo,
        }),
        ico: newInputWidget({
            label: t => t.in.crn, onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/, required: po, show: po,
            maskOptions: { mask: `00000000[00]` },
        }),
        searchButton: newButtonWidget({
            text: t => t.in.searchInARES, color: 'secondary', icon: Search, show: po, showInXML: false,
            onClick: (c: C) => {
                c.v.koncovyUzivatel.searchFail = false;
                ares.getNameAndAddress(c.v.koncovyUzivatel.ico).then(ares => {
                    if (!ares) c.v.koncovyUzivatel.searchFail = true;
                    c.v.koncovyUzivatel.nazev = ares?.obchodniJmeno ?? '';
                    const s = ares?.sidlo;
                    c.v.bydliste.psc = s?.psc?.toString() ?? s?.pscTxt ?? '';
                    c.v.bydliste.obec = [s?.nazevObce, s?.nazevCastiObce].filterNotUndefined().join(' - ');
                    c.v.bydliste.ulice = [s?.nazevUlice, [s?.cisloDomovni, s?.cisloOrientacni?.let(o => o + (s?.cisloOrientacniPismeno ?? ''))].filterNotUndefined().join('/')].filterNotUndefined().join(' ');
                });
            },
        }),
        searchFail: newHiddenValueWidget(false, true),
        searchFailText: newTextWidget({
            text: t => t.in.notFound,
            showInXML: false,
            show: c => po(c) && c.v.koncovyUzivatel.searchFail,
        }),
        nazev: newInputWidget({ label: t => t.in.companyName, show: po, required: po }),
        wrongFormat: newTextWidget({
            text: t => t.wrong.company, showInXML: false,
            show: c => !jeFO(c) && isCompanyFormInvalid(c.v.koncovyUzivatel.nazev),
        }),
        pobocka: newInputWidget({ label: t => t.in.establishment, required: false, show: po }),
        kontaktniOsoba: newInputWidget({ label: t => t.in.contactPerson, required: false, show: po }),
        telefon: newInputWidget({
            label: t => t.in.phone, onError: t => t.wrong.phone,
            regex: multiple(phoneRegExp),
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: newInputWidget({
            label: t => t.in.email, onError: t => t.wrong.email,
            regex: multiple(emailRegExp),
            type: `email`, autocomplete: `section-user billing mobile email`,
        }),
    },
    bydliste: {
        _title: newTitleWidget<C>({ text: (t, c) => jeFO(c) ? t.in.residence : t.in.headquarters, level: 3, class: 'text-lg' }),
        search: newSearchWidget({
            label: t => t.in.searchAddress, hideInRawData: true, getSearchItem: i => ({
                pieces: [{ text: i.house, width: .5 }, { text: i.postalCode, width: .1 }, { text: i.city, width: .4 }],
            }), search: ruian.suggest, onValueSet: (c, a) => {
                c.v.bydliste.ulice = a?.house ?? '';
                c.v.bydliste.psc = a?.postalCode ?? '';
                c.v.bydliste.obec = a?.city ?? '';
            }, required: false, showInXML: false,
        }),
        ulice: newInputWidget({
            label: t => t.in.street,
            autocomplete: `section-user billing street-address`,
        }),
        obec: newInputWidget({ label: t => t.in.town, autocomplete: `section-user billing address-level2` }),
        psc: newInputWidget({
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
        _title: newTitleWidget({ text: t => t.in.realizationLocation, level: 3, class: 'text-lg' }),
        _setAsResidence: newButtonWidget<C>({
            text: (t, c) => jeFO(c) ? t.in.copyResidence : t.in.copyHeadquarters,
            color: 'secondary', onClick: c => {
                c.v.mistoRealizace.search = c.v.bydliste.search;
                c.v.mistoRealizace.obec = c.v.bydliste.obec;
                c.v.mistoRealizace.psc = c.v.bydliste.psc;
                c.v.mistoRealizace.ulice = c.v.bydliste.ulice;
            },
        }),
        search: newSearchWidget({
            label: t => t.in.searchAddress, hideInRawData: true, getSearchItem: i => ({
                pieces: [{ text: i.house, width: .5 }, { text: i.postalCode, width: .1 }, { text: i.city, width: .4 }],
            }), search: ruian.suggest, onValueSet: (c, a) => {
                c.v.mistoRealizace.ulice = a?.house ?? '';
                c.v.mistoRealizace.psc = a?.postalCode ?? '';
                c.v.mistoRealizace.obec = a?.city ?? '';
            }, required: false, showInXML: false,
        }),
        ulice: newInputWidget({
            label: t => t.in.street, required: false, showInXML: true,
            autocomplete: `section-realization shipping address-level2`,
        }),
        obec: newInputWidget({
            label: t => t.in.town, showInXML: true,
            autocomplete: `section-realization shipping address-level1`,
        }),
        psc: newInputWidget({
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
        _titleCompanies: newTitleWidget({ text: t => t.in.associatedCompanies, level: 2 }),
        _title: newTitleWidget({ text: t => t.in.assemblyCompany, level: 3, class: 'text-lg' }),
        company: newSearchWidget<C, Company, true>({
            items: t => derived(assemblyCompanies, c => [unknownCompany(t), ...c]),
            label: t => t.in.searchCompanyInList, getSearchItem: i => ({
                pieces: i.crn == unknownCRN ? [
                    { text: i.companyName },
                ] : [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ], otherSearchParts: [
                    i.representative || '',
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (c, company) => {
                c.v.montazka.ico = company?.crn ?? '';
                c.v.montazka.email = company?.email ?? '';
                c.v.montazka.telefon = company?.phone ?? '';
                c.v.montazka.zastupce = company?.representative ?? '';
            },
        }),
        _or: newTextWidget<C>({ text: t => t.in.or_CRN, showInXML: false, show: c => c.v.montazka.company?.crn != unknownCRN }),
        ico: newInputWidget({
            label: t => t.in.crnToARES,
            onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`,
            },
            required: false, showInXML: true,
            show: c => c.v.montazka.company?.crn != unknownCRN,
        }),
        chosen: newTextWidget({
            text: async (t, c) => {
                const company = await ares.getName(c.v.montazka.ico);
                return company ? `${t.in.chosenCompany}: ${company}` : '';
            }, showInXML: false, show: c => c.v.montazka.company?.crn != unknownCRN,
        }),
        zastupce: newInputWidget({
            label: t => t.in.representativeName, showInXML: true,
            autocomplete: `section-assemblyRepr billing name`,
            show: c => c.v.montazka.company?.crn != unknownCRN,
        }),
        email: newInputWidget({
            label: t => t.in.email,
            onError: t => t.wrong.email,
            regex: emailRegExp,
            autocomplete: `section-assembly billing work email`,
            show: c => c.v.montazka.company?.crn != unknownCRN,
            required: false, showInXML: true,
        }),
        telefon: newInputWidget({
            label: t => t.in.phone,
            onError: t => t.wrong.phone,
            regex: phoneRegExp,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`,
            show: c => c.v.montazka.company?.crn != unknownCRN,
            required: false, showInXML: true,
        }),
    },
    uvedeni: {
        _title: newTitleWidget({ text: t => t.in.commissioning, level: 3, class: 'text-lg' }),
        _setAsAssembly: newButtonWidget<C>({
            text: t => t.in.copyAssemblyCompany, color: 'secondary',
            onClick: c => {
                c.v.uvedeni.company = c.v.montazka.company;
                c.v.uvedeni.ico = c.v.montazka.ico;
                c.v.uvedeni.zastupce = c.v.montazka.zastupce;
                c.v.uvedeni.email = c.v.montazka.email;
                c.v.uvedeni.telefon = c.v.montazka.telefon;
            },
        }),
        company: newSearchWidget<C, Company, true>({
            items: t => derived(commissioningCompanies, c => [unknownCompany(t), ...c]),
            label: t => t.in.searchCompanyInList, getSearchItem: i => ({
                pieces: i.crn == unknownCRN ? [
                    { text: i.companyName },
                ] : [
                    { text: i.crn, width: .2 },
                    { text: i.companyName, width: .8 },
                ], otherSearchParts: [
                    i.representative || '',
                ],
            }), showInXML: false, required: false, hideInRawData: true,
            onValueSet: (c, company) => {
                c.v.uvedeni.ico = company?.crn ?? '';
                c.v.uvedeni.email = company?.email ?? '';
                c.v.uvedeni.telefon = company?.phone ?? '';
                c.v.uvedeni.zastupce = company?.representative ?? '';
            },
        }),
        _or: newTextWidget<C>({ text: t => t.in.or_CRN, showInXML: false, show: c => c.v.montazka.company?.crn != unknownCRN }),
        ico: newInputWidget({
            label: t => t.in.crnToARES,
            onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/,
            maskOptions: {
                mask: `00000000[00]`,
            }, showInXML: true,
            show: c => c.v.uvedeni.company?.crn != unknownCRN,
        }),
        chosen: newTextWidget({
            text: async (t, c) => {
                if (c.v.uvedeni.ico == unknownCRN) return '';
                const company = await ares.getName(c.v.uvedeni.ico);
                return company ? `${t.in.chosenCompany}: ${company}` : '';
            }, showInXML: false,
        }),
        _regulus: newSearchWidget<C, Technician, true>({
            items: derived(techniciansList, $technicians =>
                $technicians.filter(t => t.email.endsWith('cz')),
            ),
            label: t => t.in.searchRepresentative, showInXML: false, getSearchItem: i => ({
                pieces: [
                    { text: i.name },
                    { text: i.email },
                    { text: i.phone },
                ],
            }), show: c => c.v.uvedeni.ico == regulusCRN.toString(), required: false,
            hideInRawData: true, onValueSet: (c, technician) => {
                if (technician) {
                    c.v.uvedeni.email = technician.email ?? '';
                    c.v.uvedeni.telefon = technician.phone ?? '';
                    c.v.uvedeni.zastupce = technician.name ?? '';
                }
            },
        }),
        zastupce: newInputWidget({
            label: t => t.in.representativeName,
            autocomplete: `section-commissioningRepr billing name`,
            showInXML: true,
            show: c => c.v.uvedeni.company?.crn != unknownCRN,
        }),
        email: newInputWidget({
            label: t => t.in.email,
            onError: t => t.wrong.email,
            regex: emailRegExp,
            showInXML: true,
            show: c => c.v.uvedeni.company?.crn != unknownCRN,
            required: false,
            autocomplete: `section-commissioning billing work email`,
        }),
        telefon: newInputWidget({
            label: t => t.in.phone,
            onError: t => t.wrong.phone,
            regex: phoneRegExp,
            type: 'tel',
            showInXML: true,
            show: c => c.v.uvedeni.company?.crn != unknownCRN,
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

const modelWidget = <I>(c: ContextIN, i: I) => c.f.tc[`model${i == 1 ? '' : i as B}`];
const model = <I>(c: ContextIN, i: I) => c.v.tc[`model${i == 1 ? '' : i as B}`];
const setModel = <I>(c: ContextIN, i: I, v: null | HeatPump) => c.v.tc[`model${i == 1 ? '' : i as B}`] = v;

const heatPump = <const I extends TC>(i: I) => ({
    [`model${i == 1 ? '' : i as B}`]: newChooserWidget<ContextIN, HeatPump>({
        label: (t, c) => cap(t.in.heatPumpModel([c.v.tc.pocet == 1 ? '' : ordinal(t.countsGenitive, i) + ' '])),
        options: c =>
            thermona(c) ? ['airTHERM 10']
                : rtc(c) ? heatPumps.airToWaterRTC[0]
                    : ecoHeat(c) ? heatPumps.multiEnergyCTC[0]
                        : c.v.tc.typ == 'airToWater'
                            ? heatPumps.airToWaterCTC[0]
                            : heatPumps.groundToWaterCTC[0],
        otherOptions: c =>
            thermona(c) ? []
                : rtc(c) ? heatPumps.airToWaterRTC[1]
                    : ecoHeat(c) ? heatPumps.multiEnergyCTC[1]
                        : c.v.tc.typ == 'airToWater'
                            ? heatPumps.airToWaterCTC[1]
                            : heatPumps.groundToWaterCTC[1],
        required: c => tc(c) && i <= c.v.tc.pocet,
        show: c =>
            subType(c) &&
            (rtc(c) || c.v.tc.typ != null) &&
            tc(c) &&
            i <= c.v.tc.pocet,
        onValueSet: (c, v) => {
            if (v != null && ![...modelWidget(c, i).options(c), ...modelWidget(c, i).otherOptions(c)].includes(v)) {
                setModel(c, i, null);
            }
        }, lock: thermona,
        labels: t => ({ prototype: t.tc.prototype }),
    }),
    [`cislo${i == 1 ? '' : i as B}`]: newScannerWidget<ContextIN>({
        label: (t, c) => cap(t.in.heatPumpManufactureNumber([c.v.tc.pocet == 1 ? '' : ordinal(t.countsGenitive, i) + ' '])),
        onError: t => t.wrong.number,
        regex: c => model(c, i) == 'prototype' ? /.*/ : ctc(c)
            ? /^\d{4}-\d{4}-\d{4}$/
            : model(c, i) == 'airTHERM 10'
                ? /^\d{9}T$/
                : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
        capitalize: true,
        required: c => tc(c) && i <= c.v.tc.pocet && model(c, i) != 'prototype',
        maskOptions: c => model(c, i) == 'prototype' ? undefined : ({
            mask: ctc(c)
                ? `0000-0000-0000`
                : model(c, i) == 'airTHERM 10'
                    ? `000000000T`
                    : `AA0000-AA-0000`,
            definitions: {
                A: /[A-Za-z]/,
                T: /T/,
            },
        }), lock: ecoHeat,
        show: c =>
            subType(c) &&
            (rtc(c) || c.v.tc.typ != null) &&
            tc(c) &&
            i <= c.v.tc.pocet,
        processScannedText: (t, c) =>
            model(c, i) == 'prototype' ? t.replaceAll(/[^0-9A-Z]/g, '')
                : t.replaceAll(/[^0-9A-Z]/g, '').slice(-12),
    }),
}) as I extends 1 ? {
    model: ChooserWidget<ContextIN, HeatPump>;
    cislo: ScannerWidget<ContextIN>;
} : ({
    [K in `model${I}`]: ChooserWidget<ContextIN, HeatPump>;
} & {
    [K in `cislo${I}`]: ScannerWidget<ContextIN>;
});

export default (): FormPlus<FormIN> => ({
    ir: {
        nadpisSystem: newTitleWidget({ text: t => t.in.system, level: 2 }),
        nadpis: newTitleWidget({ text: t => t.in.controller, level: 3, class: 'text-lg' }),
        regulus: newHiddenValueWidget(false, true),
        typ: newDoubleChooserWidget({
            label: t => t.in.controllerType,
            options1: ['IR 14', 'IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K'],
            otherOptions1: c => [
                'IR 34', 'IR 30', 'IR 12', 'IR 10', 'SOREL', 'ctc',
                ...c.v.ir.regulus ? ['Thermona'] as const : [], 'other',
            ] as const, options2: ({ v: { ir: { typ: { first: f } } } }) => (
                f == 'SOREL' ? ['SRS1 T', 'SRS2 TE', 'SRS3 E', 'SRS6 EP', 'STDC E', 'TRS3', 'TRS4', 'TRS5', 'TRS6 K', 'DeltaSol BS, ES', 'DeltaSol M, MX']
                    : f == 'ctc' ? ['EcoEl', 'EcoZenith', 'EcoHeat', 'EcoLogic EXT']
                        : f == 'Thermona' ? ['inTHERM 10']
                            : supportsOnlyCTC(f) ? ['CTC']
                                : doesNotSupportHeatPumps(f) ? []
                                    : ['CTC', 'RTC']
            ),
            onValueSet: (c, v) => {
                if (v.second == 'RTC') {
                    c.v.tc.typ = 'airToWater';
                }
                if (v.second == 'CTC') {
                    c.v.tc.typ = 'airToWater';
                }
                if (v.second == 'EcoHeat') {
                    c.v.tc.typ = 'groundToWater';
                    c.v.tc.pocet = 1;
                }
                if (doesNotHaveIRNumber(v)) {
                    if (!c.f.ir.cislo.lock(c))
                        setTimeout(() => c.v.ir.cislo = `${dayISO()}T${time()}`);
                }
                if (!supportsRemoteAccess(v.first)) {
                    c.v.vzdalenyPristup.chce = false;
                    c.f.vzdalenyPristup.chce.onValueSet(c, false);
                }
                if (hasIndoorUnit(v.first)) {
                    c.v.ir.cisloBox = '';
                }
                if (v.second && !c.f.ir.typ.options2(c).includes(v.second)) {
                    c.v.ir.typ = { ...v, second: null };
                }
                if (v.first != 'ctc' && supportsOnlyCTC(v.first) && v.second != 'CTC') {
                    c.v.ir.typ = { ...v, second: 'CTC' };
                }
                if (v.first == 'Thermona' && v.second != 'inTHERM 10') {
                    c.v.ir.typ = { ...v, second: 'inTHERM 10' };
                }
                if (v.first == 'Thermona') {
                    c.v.ir.chceVyplnitK = ['heatPump'];
                    c.f.ir.chceVyplnitK.onValueSet(c, c.v.ir.chceVyplnitK);
                    c.v.tc.typ = 'airToWater';
                    c.v.tc.model = 'airTHERM 10';
                }
                if (doesNotSupportHeatPumps(v.first) && v.second) {
                    c.v.ir.typ = { ...v, second: null };
                }
                if (v.first == 'ctc') {
                    c.v.ir.chceVyplnitK = ['heatPump'];
                    c.f.ir.chceVyplnitK.onValueSet(c, c.v.ir.chceVyplnitK);
                }
                if (v.first == 'other') {
                    c.v.fve.typ = 'DG-450-B';
                }
                if (c.v.ir.typ.first) db.existsIR(extractIRIDFromParts(c.v.ir.typ.first, c.v.ir.cislo))
                    .then(e => c.v.ir.alreadyExists = e);
            },
            labels: t => t.in.ir,
        }),
        cislo: newInputWidget({
            label: t => t.in.serialNumber,
            onError: (t, c) => c.v.ir.alreadyExists ? t.in.irExists : t.wrong.number,
            regex: c => doesNotHaveIRNumber(c.v.ir.typ)
                ? /[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}/
                : isCTC(c.v.ir.typ.first)
                    ? /[0-9]{4}-[0-9]{4}-[0-9]{4}/
                    : isMACAddressTypeIR12(c.v.ir.typ.first)
                        ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:09:[0-9A-F]{2}:[0-9A-F]{2}/
                        : isMACAddressTypeIR10(c.v.ir.typ.first)
                            ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:06:[0-9A-F]{2}:[0-9A-F]{2}/
                            : /[A-Z][1-9OND] [0-9]{4}/,
            capitalize: true,
            maskOptions: c => ({
                mask: doesNotHaveIRNumber(c.v.ir.typ) ? `0000-00-00T00:00`
                    : isCTC(c.v.ir.typ.first) ? `0000-0000-0000`
                        : !supportsMACAddresses(c.v.ir.typ.first) ? 'Z8 0000'
                            : c.v.ir.cislo.length == 0 ? 'X'
                                : c.v.ir.cislo[0] == '0'
                                    ? isMACAddressTypeIR10(c.v.ir.typ.first)
                                        ? 'NN:NA:14:N6:FF:FF'
                                        : 'NN:NA:14:N9:FF:FF'
                                    : 'Z8 0000',
                definitions: {
                    X: /[0A-Za-z]/,
                    N: /0/,
                    A: /[Aa]/,
                    T: /[T ]/,
                    6: /6/,
                    9: /9/,
                    1: /1/,
                    4: /4/,
                    F: /[0-9A-Fa-f]/,
                    Z: /[A-Za-z]/,
                    8: /[1-9ONDond]/,
                },
            }), onValueSet: (c, v) => {
                if (ecoHeat(c)) {
                    c.v.tc.cislo = v;
                }
                if (c.v.ir.typ.first) db.existsIR(extractIRIDFromParts(c.v.ir.typ.first, c.v.ir.cislo))
                    .then(e => c.v.ir.alreadyExists = e);
            }, show: c => !doesNotHaveIRNumber(c.v.ir.typ),
        }),
        alreadyExists: newHiddenValueWidget(false, true),
        alreadyExistsWarning: newTextWidget({
            text: (t, c) => !c.v.ir.typ.first ? '' : t.in.irExistsHtml({
                link: detailIrUrl(extractIRIDFromParts(c.v.ir.typ.first, c.v.ir.cislo)),
            }), show: c => c.v.ir.alreadyExists, showInXML: false,
        }),
        cisloBox: newInputWidget({
            label: t => t.in.serialNumberIndoor,
            onError: t => t.wrong.number,
            regex: c => thermona(c) ? /^\d{9}T$/
                : c.v.ir.cisloBox.length < 6 ? /[0-9]{5}[0-9-]/
                    : c.v.ir.cisloBox[5] == '-' ? /[0-9]{5}-[0-9]-[0-9]{4}-[0-9]{3}/
                        : /[0-9]{7}-[0-9]{7}/,
            maskOptions: c => ({
                mask: thermona(c) ? '000000000T'
                    : c.v.ir.cisloBox.length < 6 ? `00000S`
                        : c.v.ir.cisloBox[5] == '-' ? `00000-0-0000-000`
                            : `0000000-0000000`,
                definitions: {
                    'S': /[0-9-]/,
                    'T': /T/,
                },
            }),
            show: c => hasIndoorUnit(c.v.ir.typ.first),
            required: c => hasIndoorUnit(c.v.ir.typ.first),
        }),
        boxType: newTextWidget({
            text: (t, c) => t.in.recognised_BOX([typBOX(c.v.ir.cisloBox) ?? '']), showInXML: false,
            show: c => isBox(c.v.ir.typ.first) && typBOX(c.v.ir.cisloBox) != undefined,
        }),
        chceVyplnitK: newMultiCheckboxWidget({
            label: t => t.in.whatToAddInfoTo,
            options: c => [
                ...irOther(c) || doesNotSupportHeatPumps(c.v.ir.typ.first) ? [] : ['heatPump'] as const,
                ...['solarCollector'] as const,
                ...['accumulation', 'waterStorage'] as const,
                ...irCTC(c) || irOther(c) ? [] : ['ventilation'] as const,
                ...irCTC(c) ? [] : ['photovoltaicPowerPlant'] as const,
                ...irCTC(c) ? [] : ['other'] as const,
            ],
            required: false, showInXML: false, onValueSet: (c, v) => {
                if (!v.includes('heatPump')) {
                    c.v.tc.typ = null;
                    c.v.tc.pocet = 0;
                } else {
                    c.v.tc.pocet = 1;
                }
                if (!v.includes('solarCollector')) {
                    c.v.sol.typ = '';
                    c.v.sol.pocet = '';
                }
                if (!v.includes('accumulation')) {
                    c.v.tanks.accumulation = '';
                }
                if (!v.includes('waterStorage')) {
                    c.v.tanks.water = '';
                }
                if (!v.includes('ventilation')) {
                    c.v.rek.typ = '';
                }
                if (!v.includes('photovoltaicPowerPlant')) {
                    c.v.fve.pocet = '';
                    c.v.fve.typStridace = '';
                    c.v.fve.cisloStridace = '';
                    c.v.fve.akumulaceDoBaterii = false;
                    c.v.fve.typBaterii = '';
                    c.v.fve.kapacitaBaterii = '';
                    c.v.fve.wallbox = false;
                    c.v.fve.spolupraceIR = false;
                }
                if (!v.includes('other')) {
                    c.v.jine.popis = '';
                }
            }, labels: t => t.in.device,
        }),
    },
    tc: {
        nadpis: newTitleWidget({
            text: (t, c) => c.v.tc.pocet > 1 ? t.in.heatPumps : t.in.device.heatPump,
            show: tc, level: 3, class: 'text-lg',
        }),
        poznamka: newTextWidget({
            text: t => t.in.pleaseFillInIrType, showInXML: false,
            show: c => !subType(c) && tc(c), class: 'text-warning',
        }),
        typ: newRadioWidget({
            label: (t, c) => c.v.tc.pocet > 1 ? t.in.heatPumpsType : t.in.heatPumpType,
            options: [`airToWater`, `groundToWater`], required: tc,
            lock: c => ecoHeat(c) || rtc(c) || thermona(c), show: tc,
            labels: t => t.in.tc, onValueSet: c => {
                TCNumbers.forEach(i => {
                    const w = c.f.tc[`model${i}`];
                    const v = c.v.tc[`model${i}`];
                    if (v && ![...w.options(c), ...w.otherOptions(c)].includes(v))
                        c.v.tc[`model${i}`] = null;
                });
            },
        }),
        pocet: newCounterWidget<ContextIN, true>({
            label: t => t.in.hpCount, min: 1, max: 10, chosen: 1, hideInRawData: true,
            onValueSet: (c, p) => {
                TCNumbers.slice(p).forEach(i =>
                    c.v.tc[`model${i}`] = null,
                );
            }, lock: c => ecoHeat(c) || thermona(c),
            show: c => subType(c) &&
                (rtc(c) || c.v.tc.typ != null) &&
                tc(c),
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
        title: newTitleWidget({
            text: t => t.in.device.solarCollector, show: sol, level: 3, class: 'text-lg',
        }),
        typ: newInputWidget({
            label: t => t.in.solarCollectorType, required: sol, show: sol, suggestions: solarCollectors,
        }),
        pocet: newInputWidget({
            label: t => t.in.solarCollectorCount, type: `number`, required: sol, show: sol,
        }),
    },
    tanks: {
        title: newTitleWidget({
            text: t => t.tc.tanks, level: 3, class: 'text-lg', show: c => aku(c) || zas(c),
        }),
        accumulation: newInputWidget({
            label: t => t.tc.typeOfAccumulationTank, show: aku, required: aku, suggestions: accumulationTanks,
        }),
        water: newInputWidget({
            label: t => t.tc.typeOfStorageTank, show: zas, required: zas, suggestions: waterTanks,
        }),
        anode: newRadioWidget({
            label: t => t.tc.anodeRod.label, show: c => zas(c) || akuDuo(c), required: c => zas(c) || akuDuo(c),
            options: ['magnesium', 'electronic', 'none'], labels: t => t.tc.anodeRod,
        }),
    },
    rek: {
        title: newTitleWidget({ text: t => t.in.device.ventilation, show: rek, level: 3, class: 'text-lg' }),
        typ: newInputWidget({
            label: t => t.in.recoveryVentilationUnitType,
            required: rek, show: rek,
        }),
    },
    fve: {
        title: newTitleWidget({
            text: t => t.in.photovoltaicSystem,
            show: fve, level: 3, class: 'text-lg',
        }),
        typ: newChooserWidget({
            label: t => t.in.panelType, chosen: 'DG-450-B',
            required: fve, show: fve, lock: irOther,
            options: c => irOther(c) ? ['DG-450-B'] : ['DG-450-B', 'otherNotRegulusPanels'],
            labels: t => t.in.fve,
        }),
        pocet: newInputWidget({
            label: t => t.in.panelCount, type: `number`, required: fveReg, show: fveReg,
        }),
        typStridace: newInputWidget({
            label: t => t.in.inverterType, required: fveReg, show: fveReg,
            suggestions: inverters,
        }),
        cisloStridace: newInputWidget({
            label: t => t.in.inverterManufactureNumber, required: fveReg, show: fveReg,
        }),
        akumulaceDoBaterii: newCheckboxWidget({
            label: t => t.in.accumulationToBatteries, required: false, show: fveReg,
        }),
        typBaterii: newInputWidget({
            label: t => t.in.batteryType,
            required: c => fveReg(c) && c.v.fve.akumulaceDoBaterii,
            show: c => fveReg(c) && c.v.fve.akumulaceDoBaterii,
            suggestions: batteries,
        }),
        kapacitaBaterii: newInputWidget({
            label: t => t.in.totalBatteryCapacity, type: 'number', suffix: t => t.units.kWh,
            required: c => fveReg(c) && c.v.fve.akumulaceDoBaterii,
            show: c => fveReg(c) && c.v.fve.akumulaceDoBaterii,
        }),
        wallbox: newCheckboxWidget({
            label: t => t.in.chargingStationWallbox, required: false, show: fveReg,
        }),
        spolupraceIR: newCheckboxWidget({
            label: t => t.in.irCooperation, required: false, show: fve,
        }),
    },
    jine: {
        title: newTitleWidget({
            text: t => t.in.device.other,
            show: other, level: 3, class: 'text-lg',
        }),
        popis: newInputWidget({
            label: t => t.in.description, required: other, show: other,
        }),
    },
    ...userData(),
    vzdalenyPristup: {
        nadpis: newTitleWidget({ text: t => t.in.remoteAccess.title, show: supportsRemoteAccessC, level: 2 }),
        chce: newCheckboxWidget({
            label: t => t.in.remoteAccess.doYouWantRemoteAccess, required: false, show: supportsRemoteAccessC,
            onValueSet: (c, v) => {
                if (!v) {
                    c.v.vzdalenyPristup.pristupMa = [];
                    c.v.vzdalenyPristup.plati = null;
                }
            },
        }),
        _pumpNotSelected: newTextWidget<ContextIN>({
            text: t => t.in.remoteAccess.warrantyWarning,
            show: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce && !tc(c), class: 'text-warning',
        }),
        pristupMa: newMultiCheckboxWidget({
            label: t => t.in.remoteAccess.whoHasAccess,
            options: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            show: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce,
            required: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce,
            labels: t => t.in.remoteAccess,
        }),
        plati: newRadioWidget({
            label: t => t.in.remoteAccess.whoWillBeInvoiced,
            options: c => !c.v.ir.regulus ? ['assemblyCompany', 'endCustomer']
                : ['laterAccordingToTheProtocol', 'doNotInvoice', 'assemblyCompany', 'endCustomer'],
            show: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce,
            required: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce,
            labels: t => t.in.remoteAccess,
        }),
        showResponsiblePerson: newHiddenValueWidget(true, true),
        zodpovednaOsoba: newInputWidget({
            label: t => t.in.remoteAccess.responsiblePerson,
            autocomplete: `section-resp billing name`,
            show: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce && c.v.vzdalenyPristup.showResponsiblePerson,
            required: c => supportsRemoteAccessC(c) && c.v.vzdalenyPristup.chce,
        }),
    },
    ostatni: {
        poznamka: newInputWidget({ label: t => t.in.note, required: false }),
    },
});
