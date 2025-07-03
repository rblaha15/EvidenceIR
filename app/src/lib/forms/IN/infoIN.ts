import {
    type FriendlyCompanies,
    getIsOnline,
    responsiblePerson,
    startTechniciansListening,
    type Technician,
    techniciansList,
} from '$lib/client/realtime';
import defaultIN from '$lib/forms/IN/defaultIN';
import { extractIRIDFromRawData, type IRID, irName } from '$lib/helpers/ir';
import db from '$lib/client/data';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { getTranslations, p } from '$lib/translations';
import { nazevFirmy } from '$lib/helpers/ares';
import { generatePdf } from '$lib/client/pdfGeneration';
import { pdfInfo } from '$lib/client/pdf';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { xmlIN } from '$lib/forms/createXML';
import MailRRoute from '$lib/emails/MailRRoute.svelte';
import { page } from '$app/state';
import MailSDaty from '$lib/emails/MailSDaty.svelte';
import { companies } from '$lib/helpers/companies';
import { cellsIN } from '$lib/forms/IN/cellsIN';
import { type FormIN, unknownCompany } from '$lib/forms/IN/formIN';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';

const infoIN: IndependentFormInfo<FormIN, FormIN, [[Technician[]], [FriendlyCompanies], [boolean], [string | null]]> = {
    type: '',
    storeName: 'stored_data',
    defaultData: () => defaultIN(),
    saveData: async (raw, edit, data, editResult, t, send) => {
        const irid = extractIRIDFromRawData(raw);

        if (!edit && irid && getIsOnline() && await db.existsIR(irid)) {
            editResult({
                red: true, load: false,
                text: t.irExistsHtml({ link: detailIrUrl(irid) }),
            });
            return;
        }

        const user = get(currentUser)!;

        const newIr = { evidence: raw, kontrolyTC: {}, users: [user.email!], installationProtocols: [] };
        if (edit) await db.updateIRRecord(raw);
        else await db.newIR(newIr);

        const doNotSend = edit && !send;

        if (raw.vzdalenyPristup.chce && !doNotSend) {
            const t = getTranslations('cs');
            const montazka = (await nazevFirmy(raw.montazka.ico)) ?? null;
            const uvadec = (await nazevFirmy(raw.uvedeni.ico)) ?? null;

            const pdf = await generatePdf(pdfInfo.RR, 'cs', newIr);

            const response = await sendEmail({
                ...defaultAddresses(),
                subject: `Založení RegulusRoute k ${irName(raw.ir)}`,
                attachments: [{
                    content: xmlIN(data, t),
                    contentType: 'application/xml',
                    filename: `Evidence ${irid}.xml`,
                }, {
                    content: Buffer.from(pdf.pdfBytes),
                    contentType: 'application/pdf',
                    filename: pdf.fileName,
                }],
                component: MailRRoute,
                props: { e: raw, montazka, uvadec, t, origin: page.url.origin },
            });
            console.log(response);
        }

        const response = doNotSend ? undefined : await sendEmail({
            ...defaultAddresses('blahova@regulus.cz', true),
            subject: edit
                ? `Úprava evidence regulátoru ${irName(raw.ir)}`
                : `Nově zaevidovaný regulátor ${irName(raw.ir)}`,
            component: MailSDaty,
            props: { data, t, user, origin: page.url.origin },
        });

        if (doNotSend || response!.ok) return true;
        else editResult({
            text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    redirectLink: async raw => detailIrUrl(extractIRIDFromRawData(raw)),
    createWidgetData: d => d,
    title: (t, edit) => edit ? t.editing : t.controllerRegistration,
    getEditData: async () => {
        const irid = page.url.searchParams.get('edit-irid') as IRID | null;
        if (!irid) return undefined;

        const ir = await db.getIR(irid);
        return !ir ? undefined : ir.evidence;
    },
    onMount: async (_, data, edit) => {
        await startTechniciansListening();

        data.ir.cislo.lock = () => edit;
        data.ir.typ.lock1 = () => edit;

        if (edit) {
            data.uvedeni.regulus.required = () => false;
            data.uvedeni.zastupce.show = () => true;
            data.uvedeni.email.show = d => !d.uvedeni.jakoMontazka.value;
            data.uvedeni.telefon.show = d => !d.uvedeni.jakoMontazka.value;
        }

        const count = (['', '2', '3', '4'] as const).findIndex(i => data.tc[`model${i}`].value == null);
        data.tc.pocet.setValue(data, count == -1 ? 4 : count == 0 ? 1 : count);
    },
    storeEffects: [
        [(_, data, [$technicians]) => {
            data.uvedeni.regulus.items = () => $technicians.filter(t => t.email.endsWith('cz'));
        }, [techniciansList]],
        [(_, data, [$companies]) => {
            data.uvedeni.company.items = () => $companies.commissioningCompanies;
            data.montazka.company.items = () => [unknownCompany, ...$companies.assemblyCompanies];
        }, [companies]],
        [(_, data, [$isUserRegulusOrAdmin]) => {
            data.vzdalenyPristup.plati.options = () => $isUserRegulusOrAdmin
                ? [p('Později, dle protokolu'), 'doNotInvoice', 'assemblyCompany', 'endCustomer']
                : ['assemblyCompany', 'endCustomer'];
            if ($isUserRegulusOrAdmin && !data.vzdalenyPristup.plati.value)
                data.vzdalenyPristup.plati.setValue(data, p('Později, dle protokolu'));
        }, [isUserRegulusOrAdmin]],
        [(_, data, [$responsiblePerson]) => {
            data.vzdalenyPristup.zodpovednaOsoba.show = () => $responsiblePerson == null;
            if ($responsiblePerson != null) data.vzdalenyPristup.zodpovednaOsoba.setValue(data, $responsiblePerson);
        }, [responsiblePerson]],
    ],
    importOptions: {
        cells: cellsIN,
        sheet: 'ZADÁNÍ',
        onImport: () => {
        },
    },
    isSendingEmails: true,
    showBackButton: edit => edit,
};
export default infoIN;