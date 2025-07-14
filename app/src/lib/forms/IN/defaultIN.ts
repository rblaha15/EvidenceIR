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
} from '../Widget.svelte.js';
import { type FormIN, unknownCompany, type UserForm } from './formIN';
import type { Company, Technician } from '$lib/client/realtime';
import { nazevFirmy, regulusCRN } from '$lib/helpers/ares';
import { isCompanyFormInvalid, typBOX } from '$lib/helpers/ir';
import { time, todayISO } from '$lib/helpers/date';
import products, { type Products } from '$lib/helpers/products';
import { p } from '$lib/translations';

const jeFO = (d: UserForm<never>) => d.koncovyUzivatel.typ.value == `individual`;
const fo = (d: UserForm<never>) => jeFO(d);
const po = (d: UserForm<never>) => !jeFO(d);

const tc = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`heatPump`);
const sol = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`solarCollector`);
const rek = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`ventilation`);
const fve = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`photovoltaicPowerPlant`);
const other = (d: FormIN) => d.ir.chceVyplnitK.value.includes(`otherDevice`);

const ctc = (d: FormIN) => d.ir.typ.value.second == p('CTC');
const rtc = (d: FormIN) => d.ir.typ.value.second == p('RTC');
const subType = (d: FormIN) => d.ir.typ.value.second != null;

const sorel = (d: FormIN) => d.ir.typ.value.first == p('SOREL');

const irFVE = (d: FormIN) => d.ir.typ.value.first == 'irFVE';
const fveReg = (d: FormIN) => fve(d) && d.fve.typ.value == p('DG-450-B');

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
            required: false,
            autocomplete: `section-commissioning billing work email`,
        }),
        telefon: new InputWidget({
            label: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/,
            type: 'tel',
            showInXML: true,
            show: d => !d.uvedeni.jakoMontazka.value && d.uvedeni.ico.value != regulusCRN.toString(),
            required: false,
            autocomplete: `section-assembly billing work tel`,
        }),
    },
});


type B = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TC = 1 | B;
export const TCNumbers = ['', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

const heatPump = <const I extends TC>(i: I) => ({
    [`model${i == 1 ? '' : i as B}`]: new ChooserWidget<FormIN, Products['heatPumps']>({
        label: d => d.tc.pocet.value == 1 ? `heatPumpModel` : `heatPumpModel${i}`,
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
        label: d => d.tc.pocet.value == 1 ? `heatPumpManufactureNumber` : `heatPumpManufactureNumber${i}`,
        onError: `wrongNumberFormat`,
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

export default (): FormIN => ({
    ir: {
        typ: new DoubleChooserWidget({
            label: `controllerType`,
            options1: [...p('IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K', 'IR 34', 'IR 14', 'IR 12', 'SOREL'), 'irFVE'],
            options2: ({ ir: { typ: { value: { first: f } } } }) => (
                p(f == p('IR 12') ? ['CTC']
                    : f == p('SOREL') ? ['SRS1 T', 'SRS2 TE', 'SRS3 E', 'SRS6 EP', 'STDC E', 'TRS3', 'TRS4', 'TRS5', 'TRS6 K']
                        : f == 'irFVE' ? []
                            : ['CTC', 'RTC'])
            ),
            onValueSet: (d, v) => {
                if (v.second == p('RTC')) {
                    d.tc.typ.setValue(d, 'airToWater');
                }
                if (v.first == p('SOREL') || v.first == 'irFVE') {
                    d.ir.cislo.setValue(d, `${todayISO()} ${time()}`);
                    d.ir.cisloBox.setValue(d, '');
                    d.vzdalenyPristup.chce.setValue(d, false);
                }
                if (v.second && !d.ir.typ.options2(d).includes(v.second)) {
                    d.ir.typ.setValue(d, { ...v, second: null });
                }
                if (v.first == p('IR 12') && v.second != p('CTC')) {
                    d.ir.typ.setValue(d, { ...v, second: p('CTC') });
                }
                if (v.first == 'irFVE' && v.second) {
                    d.ir.typ.setValue(d, { ...v, second: null });
                }
                if (v.first == 'irFVE') {
                    d.ir.chceVyplnitK.setValue(d, ['photovoltaicPowerPlant']);
                    d.fve.typ.setValue(d, p('DG-450-B'));
                }
            },
        }),
        cislo: new InputWidget({
            label: `serialNumber`,
            onError: `wrongNumberFormat`,
            regex: d => sorel(d) || irFVE(d)
                ? /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/
                : d.ir.typ.value.first == p('IR 12')
                    ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:0[69]:[0-9A-F]{2}:[0-9A-F]{2}/
                    : /[A-Z][1-9OND] [0-9]{4}/,
            capitalize: true,
            maskOptions: d => ({
                mask: sorel(d) ? `0000-00-00T00:00` :
                    d.ir.typ.value.first != p('IR 12') ? 'Z9 0000'
                        : d.ir.cislo.value.length == 0 ? 'X'
                            : d.ir.cislo.value[0] == '0'
                                ? 'NN:NA:14:N6:FF:FF'
                                : 'Z9 0000',
                definitions: {
                    X: /[0A-Za-z]/,
                    N: /0/,
                    A: /[Aa]/,
                    6: /[69]/,
                    1: /1/,
                    4: /4/,
                    F: /[0-9A-Fa-f]/,
                    Z: /[A-Za-z]/,
                    9: /[1-9ONDond]/,
                },
            }),
            show: d => !sorel(d) && !irFVE(d),
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
            options: d => sorel(d)
                ? [`solarCollector`, `ventilation`, `photovoltaicPowerPlant`, 'otherDevice']
                : irFVE(d)
                    ? ['photovoltaicPowerPlant']
                    : [`heatPump`, `solarCollector`, `ventilation`, `photovoltaicPowerPlant`, 'otherDevice'] as const,
            lock: irFVE,
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
                if (!v.includes('otherDevice')) {
                    d.jine.popis.setValue(d, '');
                }
            },
        }),
    },
    tc: {
        nadpis: new TitleWidget({
            text: d => (d.tc.pocet.value > 1 ? `heatPumps` : `heatPump`),
            show: tc,
        }),
        poznamka: new TextWidget({
            text: `pleaseFillInIrType`, showInXML: false,
            show: d => !subType(d) && tc(d),
        }),
        typ: new RadioWidget({
            label: d => (d.tc.pocet.value > 1 ? `heatPumpsType` : `heatPumpType`),
            options: [`airToWater`, `groundToWater`], required: tc,
            show: d => ctc(d) && tc(d),
        }),
        pocet: new CounterWidget({
            label: 'hpCount', min: 1, max: 10, chosen: 1, hideInRawData: true,
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
            text: `solarCollector`, show: sol,
        }),
        typ: new InputWidget({
            label: `solarCollectorType`, required: sol, show: sol,
        }),
        pocet: new InputWidget({
            label: `solarCollectorCount`, type: `number`, required: sol, show: sol,
        }),
    },
    rek: {
        title: new TitleWidget({ text: `ventilation`, show: rek }),
        typ: new InputWidget({
            label: `recoveryVentilationUnitType`,
            required: rek, show: rek,
        }),
    },
    fve: {
        title: new TitleWidget({
            text: p('Fotovoltaický systém'),
            show: fve,
        }),
        typ: new ChooserWidget({
            label: p('Typ panelů'), chosen: p('DG-450-B'),
            required: fve, show: fve, lock: irFVE,
            options: d => irFVE(d) ? [p('DG-450-B')] : [p('DG-450-B'), 'fve.otherPanels'],
        }),
        pocet: new InputWidget({
            label: p('Počet panelů'), type: `number`, required: fveReg, show: fveReg,
        }),
        typStridace: new InputWidget({
            label: p('Typ střídače'), required: fveReg, show: fveReg,
        }),
        cisloStridace: new InputWidget({
            label: p('Výrobní číslo střídače'), required: fveReg, show: fveReg,
        }),
        akumulaceDoBaterii: new CheckboxWidget({
            label: p('Akumulace do baterií'), required: false, show: fveReg,
        }),
        typBaterii: new InputWidget({
            label: p('Typ baterií'),
            required: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
            show: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
        }),
        kapacitaBaterii: new InputWidget({
            label: p('Celková kapacita baterií'), type: 'number', suffix: 'units.kWh',
            required: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
            show: d => fveReg(d) && d.fve.akumulaceDoBaterii.value,
        }),
        wallbox: new CheckboxWidget({
            label: p('Dobíjecí stanice – wallbox'), required: false, show: fveReg,
        }),
        spolupraceIR: new CheckboxWidget({
            label: p('Spolupráce s IR'), required: false, show: fve,
        }),
    },
    jine: {
        title: new TitleWidget({
            text: p('Jiné zařízení'),
            show: other,
        }),
        popis: new InputWidget({
            label: p('Popis'), required: other, show: other,
        }),
    },
    ...userData(),
    vzdalenyPristup: {
        nadpis: new TitleWidget({ text: `remoteAccess`, show: d => !sorel(d) && !irFVE(d) }),
        chce: new CheckboxWidget({
            label: `doYouWantRemoteAccess`, required: false, show: d => !sorel(d) && !irFVE(d),
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
            show: d => !sorel(d) && !irFVE(d) && d.vzdalenyPristup.chce.value,
            required: d => !sorel(d) && !irFVE(d) && d.vzdalenyPristup.chce.value,
        }),
        plati: new RadioWidget({
            label: `whoWillBeInvoiced`,
            options: ['assemblyCompany', 'endCustomer'] as ReturnType<FormIN['vzdalenyPristup']['plati']['options']>,
            show: d => !sorel(d) && !irFVE(d) && d.vzdalenyPristup.chce.value,
            required: d => !sorel(d) && !irFVE(d) && d.vzdalenyPristup.chce.value,
        }),
        zodpovednaOsoba: new InputWidget({
            label: `responsiblePerson`,
            autocomplete: `section-resp billing name`,
            show: d => !sorel(d) && !irFVE(d) && d.vzdalenyPristup.chce.value,
            required: d => !sorel(d) && !irFVE(d) && d.vzdalenyPristup.chce.value,
        }),
    },
    ostatni: {
        poznamka: new InputWidget({ label: `note`, required: false }),
    },
});
