import {
    ButtonWidget,
    CheckboxWidget,
    ChooserWidget,
    CounterWidget,
    DoubleChooserWidget,
    InputWidget,
    InputWithSuggestionsWidget,
    MultiCheckboxWidget,
    RadioWidget,
    ScannerWidget,
    SearchWidget,
    TextWidget,
    TitleWidget,
} from '../Widget.svelte.js';
import { type FormIN, type IRSubTypes, type IRTypes, unknownCompany, unknownCRN, type UserForm } from './formIN';
import { accumulationTanks, type Company, solarCollectors, type Technician, techniciansList, waterTanks } from '$lib/client/realtime';
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
import db from '$lib/data';

const jeFO = (d: UserForm<never>) => d.koncovyUzivatel.typ.value == `individual`;
const fo = (d: UserForm<never>) => jeFO(d);
const po = (d: UserForm<never>) => !jeFO(d);

const tc = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`heatPump`);
const sol = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`solarCollector`);
const aku = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`accumulation`);
const zas = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`waterStorage`);
const rek = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`ventilation`);
const fve = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`photovoltaicPowerPlant`);
const other = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`other`);

const ctc = (d: FormIN) => d.ir.typ.value.first == 'ctc' || d.ir.typ.value.second == 'CTC';
const rtc = (d: FormIN) => d.ir.typ.value.second == 'RTC';
const thermona = (d: FormIN) => d.ir.typ.value.first == 'Thermona';
const ecoHeat = <D extends { ir: FormGroupIR<D>; }>(d: D) => d.ir.typ.value.second == 'EcoHeat';
const subType = (d: FormIN) => d.ir.typ.value.second != null;

const supportsRemoteAccessF = (f: FormIN) => supportsRemoteAccess(f.ir.typ.value.first);
const irOther = (d: FormIN) => d.ir.typ.value.first == 'other';
const irCTC = (d: FormIN) => d.ir.typ.value.first == 'ctc';
const fveReg = (d: FormIN) => fve(d) && d.fve.typ.value == 'DG-450-B';
const akuDuo = (d: FormIN) => aku(d) && d.tanks.accumulation.value.toUpperCase().startsWith('DUO');

export const separatorsRegExp = /[ ,;\/]/;
export const phoneRegExp = /(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}/;
export const emailRegExp = /[\w.-]+@([\w-]+\.)+[\w-]{2,4}/;
export const multiple = (r: RegExp) => new RegExp(`${r.source}(?: ?${separatorsRegExp.source} ?${r.source})*`);

export const userData = <D extends UserForm<D>>(): FormPlus<UserForm<D>> => ({
    koncovyUzivatel: {
        nadpis: new TitleWidget({ text: t => t.in.endUser, level: 2 }),
        typ: new RadioWidget({
            label: '', chosen: `individual`, showInXML: false,
            options: [`individual`, `company`], labels: t => t.in.userType,
        }),
        jmeno: new InputWidget({
            label: t => t.in.name, show: fo, required: fo,
            autocomplete: `section-user billing given-name`,
        }),
        prijmeni: new InputWidget({
            label: t => t.in.surname, autocomplete: `section-user billing family-name`, show: fo, required: fo,
        }),
        narozeni: new InputWidget({
            label: t => t.in.birthday, onError: t => t.wrong.date,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `bday`, required: false, show: fo,
        }),
        ico: new InputWidget({
            label: t => t.in.crn, onError: t => t.wrong.crn,
            regex: /^\d{8}(\d{2})?$/, required: po, show: po,
            maskOptions: { mask: `00000000[00]` },
        }),
        searchButton: new ButtonWidget({
            text: t => t.in.searchInARES, color: 'secondary', icon: 'search', show: po, showInXML: false,
            onClick: (d: D) => {
                d.koncovyUzivatel.searchFailText.show = () => false;
                ares.getNameAndAddress(d.koncovyUzivatel.ico.value).then(ares => {
                    if (!ares) d.koncovyUzivatel.searchFailText.show = po;
                    d.koncovyUzivatel.nazev.setValue(d, ares?.obchodniJmeno ?? '');
                    const s = ares?.sidlo;
                    d.bydliste.psc.setValue(d, s?.psc?.toString() ?? s?.pscTxt ?? '');
                    d.bydliste.obec.setValue(d, [s?.nazevObce, s?.nazevCastiObce].filterNotUndefined().join(' - '));
                    d.bydliste.ulice.setValue(d, [s?.nazevUlice, [s?.cisloDomovni, s?.cisloOrientacni?.let(o => o + (s?.cisloOrientacniPismeno ?? ''))].filterNotUndefined().join('/')].filterNotUndefined().join(' '));
                });
            },
        }),
        searchFailText: new TextWidget({ text: t => t.in.notFound, showInXML: false, show: false }),
        nazev: new InputWidget({ label: t => t.in.companyName, show: po, required: po }),
        wrongFormat: new TextWidget({
            text: t => t.wrong.company, showInXML: false,
            show: d => !jeFO(d) && isCompanyFormInvalid(d.koncovyUzivatel.nazev.value),
        }),
        pobocka: new InputWidget({ label: t => t.in.establishment, required: false, show: po }),
        kontaktniOsoba: new InputWidget({ label: t => t.in.contactPerson, required: false, show: po }),
        telefon: new InputWidget({
            label: t => t.in.phone, onError: t => t.wrong.phone,
            regex: multiple(phoneRegExp),
            type: `tel`, autocomplete: `section-user billing mobile tel`,
        }),
        email: new InputWidget({
            label: t => t.in.email, onError: t => t.wrong.email,
            regex: multiple(emailRegExp),
            type: `email`, autocomplete: `section-user billing mobile email`,
        }),
    },
    bydliste: {
        _title: new TitleWidget({ text: (t, d) => jeFO(d) ? t.in.residence : t.in.headquarters, level: 3, class: 'fs-4' }),
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
        _title: new TitleWidget({ text: t => t.in.realizationLocation, level: 3, class: 'fs-4' }),
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
        _title: new TitleWidget({ text: t => t.in.assemblyCompany, level: 3, class: 'fs-4' }),
        company: new SearchWidget<D, Company, true>({
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
            regex: emailRegExp,
            autocomplete: `section-assembly billing work email`,
            show: d => d.montazka.company.value?.crn != unknownCRN,
            required: false, showInXML: true,
        }),
        telefon: new InputWidget({
            label: t => t.in.phone,
            onError: t => t.wrong.phone,
            regex: phoneRegExp,
            type: 'tel',
            autocomplete: `section-assembly billing work tel`,
            show: d => d.montazka.company.value?.crn != unknownCRN,
            required: false, showInXML: true,
        }),
    },
    uvedeni: {
        _title: new TitleWidget({ text: t => t.in.commissioning, level: 3, class: 'fs-4' }),
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
                ], otherSearchParts: [
                    i.representative || '',
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
            regex: emailRegExp,
            showInXML: true,
            show: d => d.uvedeni.company.value?.crn != unknownCRN,
            required: false,
            autocomplete: `section-commissioning billing work email`,
        }),
        telefon: new InputWidget({
            label: t => t.in.phone,
            onError: t => t.wrong.phone,
            regex: phoneRegExp,
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

const model = <I>(d: FormIN, i: I) => {
    return d.tc[`model${i == 1 ? '' : i as B}`];
};
const heatPump = <const I extends TC>(i: I) => ({
    [`model${i == 1 ? '' : i as B}`]: new ChooserWidget<FormIN, HeatPump>({
        label: (t, d) => cap(t.in.heatPumpModel([d.tc.pocet.value == 1 ? '' : ordinal(t.countsGenitive, i) + ' '])),
        options: d =>
            thermona(d) ? ['airTHERM 10']
                : rtc(d) ? heatPumps.airToWaterRTC[0]
                    : ecoHeat(d) ? heatPumps.multiEnergyCTC[0]
                        : d.tc.typ.value == 'airToWater'
                            ? heatPumps.airToWaterCTC[0]
                            : heatPumps.groundToWaterCTC[0],
        otherOptions: d =>
            thermona(d) ? []
                : rtc(d) ? heatPumps.airToWaterRTC[1]
                    : ecoHeat(d) ? heatPumps.multiEnergyCTC[1]
                        : d.tc.typ.value == 'airToWater'
                            ? heatPumps.airToWaterCTC[1]
                            : heatPumps.groundToWaterCTC[1],
        required: d => tc(d) && i <= d.tc.pocet.value,
        show: d =>
            subType(d) &&
            (rtc(d) || d.tc.typ.value != null) &&
            tc(d) &&
            i <= d.tc.pocet.value,
        onValueSet: (d, v) => {
            if (v != null && ![...model(d, i).options(d), ...model(d, i).otherOptions(d)].includes(v)) {
                model(d, i).setValue(d, null);
            }
        }, lock: thermona,
        labels: t => ({ prototype: t.tc.prototype }),
    }),
    [`cislo${i == 1 ? '' : i as B}`]: new ScannerWidget<FormIN>({
        label: (t, d) => cap(t.in.heatPumpManufactureNumber([d.tc.pocet.value == 1 ? '' : ordinal(t.countsGenitive, i) + ' '])),
        onError: t => t.wrong.number,
        regex: d => model(d, i).value == 'prototype' ? /.*/ : ctc(d)
            ? /^\d{4}-\d{4}-\d{4}$/
            : model(d, i).value == 'airTHERM 10'
                ? /^\d{9}T$/
                : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
        capitalize: true,
        required: d => tc(d) && i <= d.tc.pocet.value && model(d, i).value != 'prototype',
        maskOptions: d => model(d, i).value == 'prototype' ? undefined : ({
            mask: ctc(d)
                ? `0000-0000-0000`
                : model(d, i).value == 'airTHERM 10'
                    ? `000000000T`
                    : `AA0000-AA-0000`,
            definitions: {
                A: /[A-Za-z]/,
                T: /T/,
            },
        }), lock: ecoHeat,
        show: d =>
            subType(d) &&
            (rtc(d) || d.tc.typ.value != null) &&
            tc(d) &&
            i <= d.tc.pocet.value,
        processScannedText: (t, d) =>
            model(d, i).value == 'prototype' ? t.replaceAll(/[^0-9A-Z]/g, '')
                : t.replaceAll(/[^0-9A-Z]/g, '').slice(-12),
    }),
}) as I extends 1 ? {
    model: ChooserWidget<FormIN, HeatPump>;
    cislo: ScannerWidget<FormIN>;
} : ({
    [K in `model${I}`]: ChooserWidget<FormIN, HeatPump>;
} & {
    [K in `cislo${I}`]: ScannerWidget<FormIN>;
});

export interface FormGroupIR<D extends { ir: FormGroupIR<D> }> {
    typ: DoubleChooserWidget<D, IRTypes, IRSubTypes>,
    cislo: InputWidget<D>,
    alreadyExists: TextWidget<D>,
}

export const irTypeAndNumber = <D extends { ir: FormGroupIR<D> }>(
    { setPumpType, setPumpModel, setPumpCount, setPumpNumber, resetRemoteAccess, resetBoxNumber, setFVEType, setHP }: {
        setPumpType?: (d: D, type: 'airToWater' | 'groundToWater') => void,
        setPumpModel?: (d: D, model: HeatPump) => void,
        setPumpCount?: (d: D, count: number) => void,
        setPumpNumber?: (d: D, number: string) => void,
        resetRemoteAccess?: (d: D) => void,
        resetBoxNumber?: (d: D) => void,
        setFVEType?: (d: D) => void
        setHP?: (d: D) => void
    },
): FormGroupIR<D> => ({
    typ: new DoubleChooserWidget({
        label: t => t.in.controllerType,
        options1: ['IR 14', 'IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K'],
        otherOptions1: ['IR 34', 'IR 30', 'IR 12', 'IR 10', 'SOREL', 'ctc', 'Thermona', 'other'],
        options2: ({ ir: { typ: { value: { first: f } } } }) => (
            f == 'SOREL' ? ['SRS1 T', 'SRS2 TE', 'SRS3 E', 'SRS6 EP', 'STDC E', 'TRS3', 'TRS4', 'TRS5', 'TRS6 K', 'DeltaSol BS, ES', 'DeltaSol M, MX']
                : f == 'ctc' ? ['EcoEl', 'EcoZenith', 'EcoHeat', 'EcoLogic EXT']
                    : f == 'Thermona' ? ['inTHERM 10']
                        : supportsOnlyCTC(f) ? ['CTC']
                            : doesNotSupportHeatPumps(f) ? []
                                : ['CTC', 'RTC']
        ),
        onValueSet: (d, v) => {
            if (v.second == 'RTC') {
                setPumpType?.(d, 'airToWater');
            }
            if (v.second == 'CTC') {
                setPumpType?.(d, 'airToWater');
            }
            if (v.second == 'EcoHeat') {
                setPumpType?.(d, 'groundToWater');
                setPumpCount?.(d, 1);
            }
            if (doesNotHaveIRNumber(v)) {
                if (!d.ir.cislo.lock(d))
                    setTimeout(() => d.ir.cislo.setValue(d, `${dayISO()}T${time()}`));
            }
            if (!supportsRemoteAccess(v.first)) {
                resetRemoteAccess?.(d);
            }
            if (hasIndoorUnit(v.first)) {
                resetBoxNumber?.(d);
            }
            if (v.second && !d.ir.typ.options2(d).includes(v.second)) {
                d.ir.typ.setValue(d, { ...v, second: null });
            }
            if (v.first != 'ctc' && supportsOnlyCTC(v.first) && v.second != 'CTC') {
                d.ir.typ.setValue(d, { ...v, second: 'CTC' });
            }
            if (v.first == 'Thermona' && v.second != 'inTHERM 10') {
                d.ir.typ.setValue(d, { ...v, second: 'inTHERM 10' });
            }
            if (v.first == 'Thermona') {
                setHP?.(d);
                setPumpCount?.(d, 1);
                setPumpType?.(d, 'airToWater');
                setPumpModel?.(d, 'airTHERM 10');
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
            if (d.ir.typ.value.first) db.existsIR(extractIRIDFromParts(d.ir.typ.value.first, d.ir.cislo.value))
                .then(e => d.ir.alreadyExists.show = () => e)
        },
        labels: t => t.in.ir,
    }),
    cislo: new InputWidget({
        label: t => t.in.serialNumber,
        onError: (t, d) => d.ir.alreadyExists.show(d) ? t.in.irExists : t.wrong.number,
        regex: d => doesNotHaveIRNumber(d.ir.typ.value)
            ? /[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}/
            : isCTC(d.ir.typ.value.first)
                ? /[0-9]{4}-[0-9]{4}-[0-9]{4}/
                : isMACAddressTypeIR12(d.ir.typ.value.first)
                    ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:09:[0-9A-F]{2}:[0-9A-F]{2}/
                    : isMACAddressTypeIR10(d.ir.typ.value.first)
                        ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:06:[0-9A-F]{2}:[0-9A-F]{2}/
                        : /[A-Z][1-9OND] [0-9]{4}/,
        capitalize: true,
        maskOptions: d => ({
            mask: doesNotHaveIRNumber(d.ir.typ.value) ? `0000-00-00T00:00`
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
                T: /[T ]/,
                6: /6/,
                9: /9/,
                1: /1/,
                4: /4/,
                F: /[0-9A-Fa-f]/,
                Z: /[A-Za-z]/,
                8: /[1-9ONDond]/,
            },
        }), onValueSet: (d, v) => {
            if (ecoHeat(d)) {
                setPumpNumber?.(d, v);
            }
            if (d.ir.typ.value.first) db.existsIR(extractIRIDFromParts(d.ir.typ.value.first, d.ir.cislo.value))
                .then(e => d.ir.alreadyExists.show = () => e)
        }, show: d => !doesNotHaveIRNumber(d.ir.typ.value),
    }),
    alreadyExists: new TextWidget({
        text: (t, d) => !d.ir.typ.value.first ? '' : t.in.irExistsHtml({
            link: detailIrUrl(extractIRIDFromParts(d.ir.typ.value.first, d.ir.cislo.value)),
        }), show: false, showInXML: false,
    }),
});

export default (): FormIN => ({
    ir: {
        nadpisSystem: new TitleWidget({ text: t => t.in.system, level: 2 }),
        nadpis: new TitleWidget({ text: t => t.in.controller, level: 3, class: 'fs-4' }),
        ...irTypeAndNumber<FormIN>({
            setPumpType: (d, t) => d.tc.typ.setValue(d, t),
            setPumpModel: (d, m) => d.tc.model.setValue(d, m),
            setPumpNumber: (d, n) => d.tc.cislo.setValue(d, n),
            setPumpCount: (d, c) => d.tc.pocet.setValue(d, c),
            resetBoxNumber: d => d.ir.cisloBox.setValue(d, ''),
            resetRemoteAccess: d => d.vzdalenyPristup.chce.setValue(d, false),
            setFVEType: d => d.fve.typ.setValue(d, 'DG-450-B'),
            setHP: d => d.ir.chceVyplnitK.setValue(d, ['heatPump']),
        }),
        cisloBox: new InputWidget({
            label: t => t.in.serialNumberIndoor,
            onError: t => t.wrong.number,
            regex: d => thermona(d) ? /^\d{9}T$/
                : d.ir.cisloBox.value.length < 6 ? /[0-9]{5}[0-9-]/
                    : d.ir.cisloBox.value[5] == '-' ? /[0-9]{5}-[0-9]-[0-9]{4}-[0-9]{3}/
                        : /[0-9]{7}-[0-9]{7}/,
            maskOptions: d => ({
                mask: thermona(d) ? '000000000T'
                    : d.ir.cisloBox.value.length < 6 ? `00000S`
                        : d.ir.cisloBox.value[5] == '-' ? `00000-0-0000-000`
                            : `0000000-0000000`,
                definitions: {
                    'S': /[0-9-]/,
                    'T': /T/,
                },
            }),
            show: d => hasIndoorUnit(d.ir.typ.value.first),
            required: d => hasIndoorUnit(d.ir.typ.value.first),
        }),
        boxType: new TextWidget({
            text: (t, d) => t.in.recognised_BOX([typBOX(d.ir.cisloBox.value) ?? '']), showInXML: false,
            show: d => isBox(d.ir.typ.value.first) && typBOX(d.ir.cisloBox.value) != undefined,
        }),
        chceVyplnitK: new MultiCheckboxWidget({
            label: t => t.in.whatToAddInfoTo,
            options: d => [
                ...irOther(d) || doesNotSupportHeatPumps(d.ir.typ.value.first) ? [] : ['heatPump'] as const,
                ...['solarCollector'] as const,
                ...['accumulation', 'waterStorage'] as const,
                ...irCTC(d) || irOther(d) ? [] : ['ventilation'] as const,
                ...irCTC(d) ? [] : ['photovoltaicPowerPlant'] as const,
                ...irCTC(d) || irOther(d) ? [] : ['other'] as const,
            ],
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
                if (!v.includes('accumulation')) {
                    d.tanks.accumulation.setValue(d, '');
                }
                if (!v.includes('waterStorage')) {
                    d.tanks.water.setValue(d, '');
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
            }, labels: t => t.in.device,
        }),
    },
    tc: {
        nadpis: new TitleWidget({
            text: (t, d) => d.tc.pocet.value > 1 ? t.in.heatPumps : t.in.device.heatPump,
            show: tc, level: 3, class: 'fs-4',
        }),
        poznamka: new TextWidget({
            text: t => t.in.pleaseFillInIrType, showInXML: false,
            show: d => !subType(d) && tc(d),
        }),
        typ: new RadioWidget({
            label: (t, d) => d.tc.pocet.value > 1 ? t.in.heatPumpsType : t.in.heatPumpType,
            options: [`airToWater`, `groundToWater`], required: tc,
            lock: d => ecoHeat(d) || rtc(d) || thermona(d), show: tc,
            labels: t => t.in.tc, onValueSet: d => {
                TCNumbers.forEach(i => {
                    const f = d.tc[`model${i}`];
                    if (f.value && ![...f.options(d), ...f.otherOptions(d)].includes(f.value))
                        f.setValue(d, null);
                });
            },
        }),
        pocet: new CounterWidget<FormIN, true>({
            label: t => t.in.hpCount, min: 1, max: 10, chosen: 1, hideInRawData: true,
            onValueSet: (d, p) => {
                TCNumbers.slice(p).forEach(i =>
                    d.tc[`model${i}`].setValue(d, null),
                );
            }, lock: d => ecoHeat(d) || thermona(d),
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
            text: t => t.in.device.solarCollector, show: sol, level: 3, class: 'fs-4',
        }),
        typ: new InputWithSuggestionsWidget({
            label: t => t.in.solarCollectorType, required: sol, show: sol, suggestions: solarCollectors,
        }),
        pocet: new InputWidget({
            label: t => t.in.solarCollectorCount, type: `number`, required: sol, show: sol,
        }),
    },
    tanks: {
        title: new TitleWidget({
            text: t => t.tc.tanks, level: 3, class: 'fs-4', show: d => aku(d) || zas(d),
        }),
        accumulation: new InputWithSuggestionsWidget({
            label: t => t.tc.typeOfAccumulationTank, show: aku, required: aku, suggestions: accumulationTanks,
        }),
        water: new InputWithSuggestionsWidget({
            label: t => t.tc.typeOfStorageTank, show: zas, required: zas, suggestions: waterTanks,
        }),
        anode: new RadioWidget({
            label: t => t.tc.anodeRod.label, show: d => zas(d) || akuDuo(d), required: d => zas(d) || akuDuo(d),
            options: ['magnesium', 'electronic', 'none'], labels: t => t.tc.anodeRod,
        }),
    },
    rek: {
        title: new TitleWidget({ text: t => t.in.device.ventilation, show: rek, level: 3, class: 'fs-4' }),
        typ: new InputWidget({
            label: t => t.in.recoveryVentilationUnitType,
            required: rek, show: rek,
        }),
    },
    fve: {
        title: new TitleWidget({
            text: t => t.in.photovoltaicSystem,
            show: fve, level: 3, class: 'fs-4',
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
            show: other, level: 3, class: 'fs-4',
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
