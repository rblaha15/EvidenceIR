import { startLidiListening } from '$lib/client/realtime';
import defaultNK from '$lib/forms/NK/defaultNK';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { getTranslations } from '$lib/translations';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import xml from '$lib/forms/NK/xmlNK';
import { getFile, removeFile } from '$lib/components/widgets/File.svelte';
import type { Attachment } from 'nodemailer/lib/mailer';
import MailDemand from '$lib/emails/MailDemand.svelte';
import type { FormNK } from '$lib/forms/NK/formNK';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import { relUrl } from '$lib/helpers/runes.svelte';

const infoNK: IndependentFormInfo<FormNK, FormNK> = {
    type: '',
    storeName: 'stored_demand',
    defaultData: defaultNK,
    saveData: async (raw, _, __, editResult, t) => {
        const user = get(currentUser)!;

        const name = raw.contacts.name;
        const surname = raw.contacts.surname;

        const cs = getTranslations('cs');

        const photoIds = raw.other.photos
            .map(photo => photo.uuid);

        const response = await sendEmail({
            ...defaultAddresses(page.data.languageCode == 'sk' ? 'obchod@regulus.sk' : 'poptavky@regulus.cz', true),
            subject: `Poptávka z aplikace – OSOBA: ${name} ${surname}`,
            attachments: [{
                content: xml(raw, user, cs),
                contentType: 'application/xml',
                filename: `Dotazník ${name} ${surname}.xml`,
            }, ...(await photoIds
                .map(id => getFile(id))
                .awaitAll())
                .filterNotUndefined()
                .map((photo, i) => <Attachment>{
                    path: photo,
                    filename: `Fotka ${i + 1}`,
                })],
            component: MailDemand,
            props: { email: user.email! },
        });

        if (response!.ok) {
            await photoIds.map(removeFile).awaitAll()
            return true;
        }
        else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    redirectLink: async () => relUrl('/NK?sent'),
    createWidgetData: d => d,
    title: t => t.nk.demandForm,
    onMount: async () => {
        await startLidiListening();
    },
    isSendingEmails: true,
    showSaveAndSendButtonByDefault: true,
    requiredRegulus: true,
    hideBackButton: _ => true,
};
export default infoNK;