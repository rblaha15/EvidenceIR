import defaultData from './defaultData';
import {
    CheckboxWidget,
    ChooserWidget,
    DoubleChooserWidget,
    InputWidget,
    MultiCheckboxWidget,
    p,
    RadioWidget,
    ScannerWidget,
    SearchWidget,
    TextWidget,
    TitleWidget
} from '../Widget.svelte.js';
import {
    type Company,
    type FriendlyCompanies,
    getIsOnline,
    responsiblePerson,
    startTechniciansListening,
    type Technician,
    techniciansList
} from '$lib/client/realtime';
import type { ExcelImport } from '$lib/forms/Import';
import { getTranslations, makePlain } from '$lib/translations';
import { type Form, type Raw } from '$lib/forms/Form';
import type { DetachedFormInfo } from '$lib/forms/forms.svelte';
import { dev } from '$app/environment';
import { page } from '$app/state';
import { evidence, existuje, extractIRIDFromRawData, type IRID, novaEvidence, upravitEvidenci } from '$lib/client/firestore';
import { currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { companies } from '$lib/helpers/companies';
import { relUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { nazevFirmy } from '$lib/helpers/ares';
import { sendEmail, SENDER } from '$lib/client/email';
import { nazevIR } from '$lib/helpers/ir';
import { generateXML } from '$lib/createXML';
import MailRRoute from '$lib/emails/MailRRoute.svelte';
import MailSDaty from '$lib/emails/MailSDaty.svelte';

export interface UserData<D extends UserData<D>> extends Form<D> {
    koncovyUzivatel: {
        nadpis: TitleWidget<D>;
        typ: RadioWidget<D>;
        prijmeni: InputWidget<D>;
        jmeno: InputWidget<D>;
        narozeni: InputWidget<D>;
        nazev: InputWidget<D>;
        wrongFormat: TextWidget<D>;
        pobocka: InputWidget<D>;
        ico: InputWidget<D>;
        telefon: InputWidget<D>;
        email: InputWidget<D>;
    };
    bydliste: {
        nadpis: TitleWidget<D>;
        obec: InputWidget<D>;
        ulice: InputWidget<D>;
        psc: InputWidget<D>;
    };
    mistoRealizace: {
        nadpis: TitleWidget<D>;
        jakoBydliste: CheckboxWidget<D, true>;
        obec: InputWidget<D>;
        ulice: InputWidget<D>;
        psc: InputWidget<D>;
    };
    montazka: {
        nadpis: TitleWidget<D>;
        company: SearchWidget<D, Company, true>;
        nebo: TextWidget<D>;
        ico: InputWidget<D>;
        chosen: TextWidget<D>;
        zastupce: InputWidget<D>;
        email: InputWidget<D>;
        telefon: InputWidget<D>;
    };
    uvedeni: {
        nadpis: TitleWidget<D>;
        jakoMontazka: CheckboxWidget<D, true>;
        company: SearchWidget<D, Company, true>;
        nebo: TextWidget<D>;
        ico: InputWidget<D>;
        chosen: TextWidget<D>;
        regulus: SearchWidget<D, Technician, true>;
        zastupce: InputWidget<D>;
        email: InputWidget<D>;
        telefon: InputWidget<D>;
    };
}

export interface Data extends UserData<Data>, Form<Data> {
    ir: {
        typ: DoubleChooserWidget<Data>;
        cislo: InputWidget<Data>;
        cisloBox: InputWidget<Data>;
        boxType: TextWidget<Data>;
        chceVyplnitK: MultiCheckboxWidget<Data>;
    };
    tc: {
        nadpis: TitleWidget<Data>;
        poznamka: TextWidget<Data>;
        typ: RadioWidget<Data>;
        model: ChooserWidget<Data>;
        cislo: ScannerWidget<Data>;
        model2: ChooserWidget<Data>;
        cislo2: ScannerWidget<Data>;
        model3: ChooserWidget<Data>;
        cislo3: ScannerWidget<Data>;
        model4: ChooserWidget<Data>;
        cislo4: ScannerWidget<Data>;
    };
    sol: {
        title: TitleWidget<Data>;
        typ: InputWidget<Data>;
        pocet: InputWidget<Data>;
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

const cells: ExcelImport<Raw<Data>>['cells'] = {
    koncovyUzivatel: {
        typ: { constant: `individual` },
        prijmeni: { address: [3, 2], transform: v => v.split(' ')[0] },
        jmeno: { address: [3, 2], transform: v => v.split(' ').toSpliced(0, 1).join(' ') },
        narozeni: { address: [3, 3] },
        telefon: { address: [2, 7] },
        email: { address: [2, 8] },
    },
    bydliste: {
        ulice: { getData: get => `${get([2, 5])} ${get([6, 5])}` },
        obec: { address: [2, 6] },
        psc: { address: [6, 6] },
    },
    montazka: {
        ico: { address: [2, 13] },
        zastupce: { address: [2, 14] },
        telefon: { address: [2, 16] },
        email: { address: [2, 17] },
    },
    uvedeni: {
        ico: { address: [2, 26] },
        zastupce: { address: [2, 27] },
        email: { address: [2, 28] },
        telefon: { address: [2, 29] },
    },
    tc: {
        typ: {
            address: [2, 33], transform: v => v == 'Vyberte typ' ? null
                : v.includes('EcoPart') || v.includes('EcoHeat') ? 'groundToWater' : 'airToWater'
        },
        model: { address: [2, 33], transform: v => v == 'Vyberte typ' ? null : makePlain(v)! },
        cislo: { address: [6, 33] },
        model2: { address: [2, 34], transform: v => v == 'Vyberte typ' ? 'noPump' : makePlain(v)! },
        cislo2: { address: [6, 34] },
        model3: { address: [2, 35], transform: v => v == 'Vyberte typ' ? 'noPump' : makePlain(v)! },
        cislo3: { address: [6, 35] },
        model4: { address: [2, 36], transform: v => v == 'Vyberte typ' ? 'noPump' : makePlain(v)! },
        cislo4: { address: [6, 36] },
    },
    ir: {
        typ: {
            getData: get => {
                const box = get([2, 39]) == 'Vyberte typ' ? null :
                    get([2, 39]).includes('Eco') ? null : get([2, 39]); // EcoZenith, EcoEl
                const ir = get([2, 41]) == 'Vyberte typ' ? box : get([2, 41]);
                return {
                    first: makePlain(ir?.split(' ')?.toSpliced(-1, 1)?.join(' ')) ?? null,
                    second: makePlain(ir?.split(' ')?.at(-1)) ?? null,
                };
            }
        },
        cislo: { getData: get => `${get([6, 41])} ${get([7, 41])}` },
        cisloBox: { address: [6, 39] },
        chceVyplnitK: {
            getData: get => [
                ...(get([2, 33]) != 'Vyberte typ' ? ['heatPump' as const] : []),
                ...(get([2, 40]) != 'Vyberte typ' ? ['solarCollector' as const] : []),
            ]
        },
    },
    sol: {
        typ: { address: [2, 40] },
        pocet: { address: [6, 40] },
    },
};

const data: DetachedFormInfo<Data, Data, [[Technician[]], [FriendlyCompanies], [boolean], [string | null]]> = {
    storeName: 'stored_data',
    defaultData: newData,
    saveData: async (raw, edit, data, editResult, t, send) => {
        const irid = extractIRIDFromRawData(raw);

        if (!edit && irid && getIsOnline() && await existuje(irid)) {
            editResult({
                red: true, load: false,
                text: t.irExistsHtml.parseTemplate({ link: relUrl(`/detail/${irid}`) }),
            });
            return;
        }
        if (!getIsOnline()) {
            editResult({ red: true, text: t.offline, load: false });
            return;
        }

        const user = get(currentUser)!;

        if (edit) await upravitEvidenci(raw);
        else await novaEvidence({ evidence: raw, kontroly: {}, users: [user.email!], installationProtocols: [] });

        const userAddress = {
            address: user.email!,
            name: user.displayName ?? '',
        };
        const doNotSend = edit && !send;

        if (raw.vzdalenyPristup.chce && !doNotSend) {
            const t = getTranslations('cs');
            const montazka = (await nazevFirmy(raw.montazka.ico)) ?? null;
            const uvadec = (await nazevFirmy(raw.uvedeni.ico)) ?? null;

            const response = await sendEmail({
                from: SENDER,
                replyTo: userAddress,
                to: dev ? 'radek.blaha.15@gmail.com' : ['david.cervenka@regulus.cz', 'jakub.cervenka@regulus.cz'],
                subject: `Založení RegulusRoute k ${nazevIR(raw.ir)}`,
                attachments: [{
                    content: generateXML(data, t),
                    contentType: 'application/xml',
                    filename: `Evidence ${irid}.xml`
                }],
                pdf: {
                    link: `/cs/detail/${irid}/pdf/rroute`,
                    title: 'Souhlas RegulusRoute.pdf',
                },
                component: MailRRoute,
                props: { e: raw, montazka, uvadec, t, origin: page.url.origin },
            });
            console.log(response);
        }

        const response = doNotSend ? undefined : await sendEmail({
            from: SENDER,
            replyTo: userAddress,
            to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
            cc: dev ? undefined : userAddress,
            subject: edit
                ? `Úprava evidence regulátoru ${nazevIR(raw.ir)}`
                : `Nově zaevidovaný regulátor ${nazevIR(raw.ir)}`,
            component: MailSDaty,
            props: { data, t, user, origin: page.url.origin },
        });

        if (doNotSend || response!.ok) return true
        else editResult({
            text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false
        });
    },
    redirectLink: async raw => relUrl(`/detail/${extractIRIDFromRawData(raw)}`),
    createWidgetData: d => d,
    title: (t, edit) => edit ? t.editation : t.controllerRegistration,
    getEditData: async () => {
        const irid = page.url.searchParams.get('edit-irid') as IRID | null;
        if (!irid) return undefined;

        const snapshot = await evidence(irid);
        if (!(snapshot.exists() && snapshot.data() != undefined)) return undefined;

        return snapshot.data()!.evidence;
    },
    onMount: async (_, data, edit) => {
        await startTechniciansListening();

        data.ir.cislo.lock = () => edit;
        data.ir.typ.lock1 = () => edit;
    },
    storeEffects: [
        [(_, data, [$technicians]) => {
            data.uvedeni.regulus.items = () => $technicians;
        }, [techniciansList]],
        [(_, data, [$companies]) => {
            data.uvedeni.company.items = () => $companies.commissioningCompanies;
            data.montazka.company.items = () => $companies.assemblyCompanies;
        }, [companies]],
        [(_, data, [$isUserRegulusOrAdmin]) => {
            data.vzdalenyPristup.plati.options = () => $isUserRegulusOrAdmin
                ? ['assemblyCompany', 'endCustomer', 'doNotInvoice', p`Později, dle protokolu`]
                : ['assemblyCompany', 'endCustomer'];
            if ($isUserRegulusOrAdmin) data.vzdalenyPristup.plati.setValue(data, p`Později, dle protokolu`)
        }, [isUserRegulusOrAdmin]],
        [(_, data, [$responsiblePerson]) => {
            data.ostatni.zodpovednaOsoba.show = () => $responsiblePerson == null;
            if ($responsiblePerson != null) data.ostatni.zodpovednaOsoba.setValue(data, $responsiblePerson);
        }, [responsiblePerson]],
    ],
    importOptions: {
        cells,
        sheet: 'ZADÁNÍ',
        onImport: () => {},
    },
    isSendingEmails: true,
};

export default data;