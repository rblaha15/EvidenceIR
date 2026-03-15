import {
    responsiblePerson,
    startAccumulationTanksListening,
    startSolarCollectorsListening,
    startTechniciansListening,
    startWaterTanksListening,
} from '$lib/client/realtime';
import defaultIN, { type TC, TCNumbers } from '$lib/forms/IN/defaultIN';
import { extractIRIDFromRawData, type IRID, irName } from '$lib/helpers/ir';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { getTranslations, type Translations } from '$lib/translations';
import ares from '$lib/helpers/ares';
import { generatePdf } from '$lib/pdf/pdfGeneration';
import { pdfInfo } from '$lib/pdf/pdf';
import { blahova, cervenka, defaultAddresses, sendEmail } from '$lib/client/email';
import { xmlIN } from '$lib/forms/IN/xmlIN';
import MailRRoute from '$lib/emails/MailRRoute.svelte';
import { page } from '$app/state';
import MailSDaty from '$lib/emails/MailSDaty.svelte';
import { cellsIN } from '$lib/forms/IN/cellsIN';
import { type FormIN } from '$lib/forms/IN/formIN';
import type { IndependentFormInfo, Result } from '$lib/forms/FormInfo';
import MailXML from '$lib/emails/MailXML.svelte';
import { dataToRawData, type Raw } from '$lib/forms/Form';
import { grantPoints } from '$lib/client/loyaltyProgram';
import { getIsOnline } from '$lib/client/realtimeOnline';
import db from '$lib/Database';
import { type ExistingIR, type IR, newIR } from '$lib/data';
import type { User } from 'firebase/auth';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

const sendEmails = async (
    edit: boolean, send: boolean, draft: boolean,
    raw: Raw<FormIN>, newIr: ExistingIR, data: FormIN, irid: IRID,
    user: User, editResult: (result: Result) => void, t: Translations,
) => {
    const doNotSend = (edit && !send) || draft;
    const edited = edit && !draft;

    if (doNotSend) return true;

    const cs = getTranslations('cs');
    const montazka = (await ares.getName(raw.montazka.ico)) ?? null;
    const uvadec = (await ares.getName(raw.uvedeni.ico)) ?? null;

    const pdf = await generatePdf({ args: pdfInfo.RR, lang: 'cs', data: newIr });

    const response1 = raw.vzdalenyPristup.chce ? await sendEmail({
        ...defaultAddresses(cervenka),
        subject: `Založení RegulusRoute k ${irName(raw.ir)}`,
        attachments: [new File(
            [pdf.pdfBytes],
            pdf.fileName,
            { type: 'application/pdf' },
        )],
        component: MailRRoute,
        props: { e: raw, montazka, uvadec, t: cs, origin: page.url.origin, user },
    }) : null;
    console.log(response1);

    const response2 = await sendEmail({
        ...defaultAddresses(),
        subject: edited
            ? `Úprava evidence regulátoru ${irName(raw.ir)}`
            : `Založení evidence regulátoru ${irName(raw.ir)}`,
        attachments: [new File(
            [xmlIN(data, cs)],
            `Evidence ${irid}.xml`,
            { type: 'application/xml' },
        )],
        component: MailXML,
        props: { e: raw, origin: page.url.origin, user },
    });

    const response3 = await sendEmail({
        ...defaultAddresses(blahova, true),
        subject: edited
            ? `Úprava evidence regulátoru ${irName(raw.ir)}`
            : `Nově zaevidovaný regulátor ${irName(raw.ir)}`,
        component: MailSDaty,
        props: { data, t: cs, user, origin: page.url.origin },
    });
    console.log(response3);

    if (!response2.ok) editResult({
        text: t.form.emailNotSent({ status: String(response1!.status), statusText: response1!.statusText }),
        red: true,
        load: false,
    });

    return true;
};

const checkForErrors = (data: FormIN, t: Translations, editResult: (result: Result) => void) => {
    const errors = [data.ir.cislo, data.ir.typ] // Is here, because it's required even in the draft mode
        .filter(w => w.isError(data))
        .map(w => w.label(t, data));
    if (errors.length) {
        data.ir.cislo.displayErrorVeto = true;
        data.ir.typ.displayErrorVeto = true;
        editResult({
            red: true,
            text: t.form.youHaveAMistake,
            load: false,
            error: errors.join('\n'),
        });
        return false;
    }
    return true;
};

const changeIRID = async (
    oldIR: IR, newIRID: IRID, raw: Raw<FormIN>, oldIRID: IRID,
    user: User, editResult: (result: Result) => void, t: Translations, draft: boolean,
) => {
    const newIR = oldIR;
    newIR.IN = raw;
    newIR.deleted = false;
    newIR.meta.id = newIRID;
    newIR.meta.createdAt = serverTimestamp() as Timestamp;
    newIR.meta.changedAt = serverTimestamp() as Timestamp;
    newIR.meta.keysChangedAt = serverTimestamp() as Timestamp;
    newIR.meta.createdBy = { uid: user.uid, email: user.email! };
    await db.addIR(newIR);

    const newRecord = await db.getIR(newIRID);
    if (!newRecord || newRecord.deleted || !newRecord.IN) {
        editResult({
            red: true, load: false, text: t.form.somethingWentWrongContactUsHtml,
            error: `Failed to create a new record: ${newRecord}`,
        });
        return false;
    }
    await db.deleteIR(oldIRID!, newIRID);
    if (!draft) await grantPoints({ type: 'disconnectRegulusRoute', irid: oldIRID });
    return true;
};
const infoIN: IndependentFormInfo<FormIN, FormIN, [[boolean], [boolean], [string | null]], never, {
    draft: boolean,
    editIR?: IR
}> = {
    type: '',
    storeName: () => 'storedIN',
    defaultData: () => defaultIN(),
    saveData: async (raw, edit, data, editResult, t, send, draft, { editIR }) => {
        console.log(editIR);
        if (!checkForErrors(data, t, editResult)) return false;

        const newIRID = extractIRIDFromRawData(raw);
        const oldIRID = editIR?.meta?.id ?? newIRID;
        const changeID = newIRID != oldIRID;
        console.log(oldIRID, newIRID, changeID)

        if ((!edit || changeID) && newIRID && getIsOnline() && await db.existsIR(newIRID)) {
            editResult({
                red: true, load: false,
                text: t.in.irExistsHtml({ link: detailIrUrl(newIRID) }),
            });
            return;
        }

        const user = get(currentUser)!;

        const newIr = newIR(raw, user, draft);
        if (edit) {
            if (!changeID) await db.updateIN(newIRID, raw, draft);
            else if (!await changeIRID(
                editIR!, newIRID, raw, oldIRID, user, editResult, t, draft,
            )) return false;
        } else
            await db.addIR(newIr);

        if (!draft) await grantPoints({ type: raw.vzdalenyPristup.chce ? 'connectRegulusRoute' : 'disconnectRegulusRoute', irid: newIRID });

        return await sendEmails(
            edit, send, draft,
            raw, newIr, data, newIRID,
            user, editResult, t,
        );
    },
    redirectLink: async raw => detailIrUrl(extractIRIDFromRawData(raw)),
    createWidgetData: d => d,
    title: (t, mode) => mode == 'edit' ? t.in.editing : mode == 'view' ? t.detail.titleIR : t.in.title,
    getEditData: async url => {
        const irid = url.searchParams.get('edit-irid') as IRID | null;
        if (!irid) return { other: { draft: false } };

        const ir = await db.getIR(irid);
        return !ir || ir.deleted ? { other: { draft: false } } : { raw: ir.IN, other: { draft: ir.isDraft, editIR: ir } };
    },
    getViewData: async url => {
        const irid = url.searchParams.get('view-irid') as IRID | null;
        if (!irid) return { other: { draft: false } };

        const ir = await db.getIR(irid);
        return !ir ? { other: { draft: false } } : { raw: ir.IN, other: { draft: ir.isDraft } };
    },
    onMount: async (_, data) => {
        await startTechniciansListening();
        await startSolarCollectorsListening();
        await startAccumulationTanksListening();
        await startWaterTanksListening();

        const count = cascadePumps(dataToRawData(data)).length;
        data.tc.pocet.setValue(data, count == 0 ? 1 : count);
    },
    storeEffects: [
        [(_, data, [$isUserRegulusOrAdmin]) => {
            let array = defaultIN().ir.typ.otherOptions1(data);
            data.ir.typ.otherOptions1 = () =>
                !$isUserRegulusOrAdmin ? array.filter(o => o != 'Thermona') : array;
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
        onImport: () => {
        },
    },
    buttons: (edit, { draft }) => ({
        hideBack: !edit,
        hideSave: !edit || draft,
        saveAndSendAgain: edit && !draft,
        saveAndSend: !edit || draft,
        saveAsDraft: !edit || draft,
    }),
};
export default infoIN;

export type PumpInfo = ReturnType<typeof cascadePumps>[number]
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