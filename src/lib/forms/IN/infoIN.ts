import {
    getIsOnline,
    responsiblePerson,
    startTechniciansListening,
} from '$lib/client/realtime';
import defaultIN, { type TC, TCNumbers } from '$lib/forms/IN/defaultIN';
import { extractIRIDFromRawData, type IRID, irName } from '$lib/helpers/ir';
import db from '$lib/data';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { getTranslations } from '$lib/translations';
import ares from '$lib/helpers/ares';
import { generatePdf } from '$lib/pdf/pdfGeneration';
import { pdfInfo } from '$lib/pdf/pdf';
import { cervenka, defaultAddresses, sendEmail } from '$lib/client/email';
import { xmlIN } from '$lib/forms/IN/xmlIN';
import MailRRoute from '$lib/emails/MailRRoute.svelte';
import { page } from '$app/state';
import MailSDaty from '$lib/emails/MailSDaty.svelte';
import { cellsIN } from '$lib/forms/IN/cellsIN';
import { type FormIN } from '$lib/forms/IN/formIN';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import MailXML from '$lib/emails/MailXML.svelte';
import { dataToRawData, type Raw } from '$lib/forms/Form';

const infoIN: IndependentFormInfo<FormIN, FormIN, [[boolean], [boolean], [string | null]]> = {
    type: '',
    storeName: 'stored_data',
    defaultData: () => defaultIN(),
    saveData: async (raw, edit, data, editResult, t, send) => {
        const irid = extractIRIDFromRawData(raw);

        if (!edit && irid && getIsOnline() && await db.existsIR(irid)) {
            editResult({
                red: true, load: false,
                text: t.in.irExistsHtml({ link: detailIrUrl(irid) }),
            });
            return;
        }

        const user = get(currentUser)!;

        const newIr = { evidence: raw, kontrolyTC: {}, users: [user.email!], installationProtocols: [] };
        if (edit) await db.updateIRRecord(raw);
        else await db.addIR(newIr);

        const doNotSend = edit && !send;

        if (doNotSend) return true;

        const cs = getTranslations('cs');
        const montazka = (await ares.getName(raw.montazka.ico)) ?? null;
        const uvadec = (await ares.getName(raw.uvedeni.ico)) ?? null;

        const pdf = await generatePdf({ args: pdfInfo.RR, lang: 'cs', data: newIr });

        const response1 = raw.vzdalenyPristup.chce ? await sendEmail({
            ...defaultAddresses(cervenka),
            subject: `Založení RegulusRoute k ${irName(raw.ir)}`,
            attachments: [{
                content: [...pdf.pdfBytes],
                contentType: 'application/pdf',
                filename: pdf.fileName,
            }],
            component: MailRRoute,
            props: { e: raw, montazka, uvadec, t: cs, origin: page.url.origin },
        }) : null
        console.log(response1)

        const response2 = await sendEmail({
            ...defaultAddresses(),
            subject: edit
                ? `Úprava evidence regulátoru ${irName(raw.ir)}`
                : `Založení evidence regulátoru ${irName(raw.ir)}`,
            attachments: [{
                content: xmlIN(data, cs),
                contentType: 'application/xml',
                filename: `Evidence ${irid}.xml`,
            }],
            component: MailXML,
            props: { e: raw, origin: page.url.origin },
        });

        const response3 = await sendEmail({
            ...defaultAddresses('blahova@regulus.cz', true),
            subject: edit
                ? `Úprava evidence regulátoru ${irName(raw.ir)}`
                : `Nově zaevidovaný regulátor ${irName(raw.ir)}`,
            component: MailSDaty,
            props: { data, t: cs, user, origin: page.url.origin },
        });
        console.log(response3)

        if (!response2.ok) editResult({
            text: t.form.emailNotSent({ status: String(response1!.status), statusText: response1!.statusText }),
            red: true,
            load: false,
        });

        return true
    },
    redirectLink: async raw => detailIrUrl(extractIRIDFromRawData(raw)),
    createWidgetData: d => d,
    title: (t, mode) => mode == 'edit' ? t.in.editing : mode == 'view' ? t.detail.titleIR : t.in.title,
    getEditData: async url => {
        const irid = url.searchParams.get('edit-irid') as IRID | null;
        if (!irid) return undefined;

        const ir = await db.getIR(irid);
        return !ir ? undefined : ir.evidence;
    },
    getViewData: async url => {
        const irid = url.searchParams.get('view-irid') as IRID | null;
        if (!irid) return undefined;

        const ir = await db.getIR(irid);
        return !ir ? undefined : ir.evidence;
    },
    onMount: async (_, data, mode) => {
        await startTechniciansListening();

        data.ir.cislo.lock = () => mode == 'edit';
        data.ir.typ.lock1 = () => mode == 'edit';

        if (mode != 'create') {
            data.uvedeni.regulus.required = () => false;
            data.uvedeni.zastupce.show = () => true;
            data.uvedeni.email.show = d => !d.uvedeni.jakoMontazka.value;
            data.uvedeni.telefon.show = d => !d.uvedeni.jakoMontazka.value;
        }

        const count = cascadePumps(dataToRawData(data)).length;
        data.tc.pocet.setValue(data, count == 0 ? 1 : count);
    },
    storeEffects: [
        [(_, data, [$isUserRegulusOrAdmin]) => { // Also in NSP
            data.koncovyUzivatel.company.show = d => $isUserRegulusOrAdmin && d.koncovyUzivatel.typ.value == 'company';
            data.koncovyUzivatel.or.show = d => $isUserRegulusOrAdmin && d.koncovyUzivatel.typ.value == 'company';
        }, [isUserRegulusOrAdmin]],
        [(_, data, [$isUserRegulusOrAdmin]) => {
            data.vzdalenyPristup.plati.options = () => $isUserRegulusOrAdmin
                ? ['laterAccordingToTheProtocol', 'doNotInvoice', 'assemblyCompany', 'endCustomer']
                : ['assemblyCompany', 'endCustomer'];
            if ($isUserRegulusOrAdmin && !data.vzdalenyPristup.plati.value)
                data.vzdalenyPristup.plati.setValue(data, 'laterAccordingToTheProtocol');
        }, [isUserRegulusOrAdmin]],
        [(_, data, [$responsiblePerson]) => {
            if ($responsiblePerson != null) data.vzdalenyPristup.zodpovednaOsoba.setValue(data, $responsiblePerson);
            if ($responsiblePerson != null) data.vzdalenyPristup.zodpovednaOsoba.show = () => false;
        }, [responsiblePerson]],
    ],
    excelImport: {
        cells: cellsIN,
        sheet: 'ZADÁNÍ',
        onImport: () => {},
    },
    isSendingEmails: true,
    hideBackButton: edit => !edit,
};
export default infoIN;

export const cascadePumps = (e: Raw<FormIN>) =>
    TCNumbers
        .map(n => ({
            model: e.tc[`model${n}`],
            cislo: e.tc[`cislo${n}`],
        }))
        .filter(tc => tc.cislo?.length && tc.model)
        .map((tc, i) => ({
            model: tc.model!,
            cislo: tc.cislo,
            n: e.tc.model2 ? `${i + 1}` as `${TC}` : '' as const,
            N: i + 1 as TC,
        }));