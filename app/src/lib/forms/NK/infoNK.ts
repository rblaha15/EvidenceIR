import { startUsersListening } from '$lib/client/realtime';
import defaultNK from '$lib/forms/NK/defaultNK';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { getTranslations } from '$lib/translations';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import xml from '$lib/forms/NK/xmlNK';
import { getFile, removeFile } from '$lib/components/widgets/File.svelte';
import MailDemand from '$lib/emails/MailDemand.svelte';
import type { FormNK } from '$lib/forms/NK/formNK';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';

const infoNK: IndependentFormInfo<FormNK, FormNK> = {
    type: '',
    storeName: () => 'stored_demand',
    defaultData: defaultNK,
    saveData: async (raw, _1, form, editResult, t, _2, _3, _4, resetForm) => {
        const user = get(currentUser)!;

        const name = raw.contacts.name;
        const surname = raw.contacts.surname;

        const cs = getTranslations('cs');

        const photoIds = raw.other.photos
            .map(photo => photo.uuid);

        const response = await sendEmail({
            ...defaultAddresses(page.data.languageCode == 'sk' ? 'obchod@regulus.sk' : 'poptavky@regulus.cz', true, user.displayName || undefined),
            subject: `Poptávka z aplikace – OSOBA: ${name} ${surname}`,
            attachments: [new File(
                [xml(raw, user, cs)],
                `Dotazník ${name} ${surname}.xml`,
                { type: 'application/xml' },
            ), ...(
                await photoIds.map(getFile).awaitAll()
            ).filterNotUndefined().map((file, i) =>
                new File([file], `Fotka ${i + 1}`, { type: file.type }),
            )],
            component: MailDemand,
            props: { user: user.displayName || user.email!, t: cs, data: form },
        });

        if (response!.ok) {
            await photoIds.map(removeFile).awaitAll();
            editResult({
                text: t.form.successfullySent,
                red: false,
                load: false,
            });
            resetForm();
        } else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: await response!.text() }),
            red: true,
            load: false,
        });
    },
    createWidgetData: d => d,
    title: t => t.nk.demandForm,
    onMount: async () => {
        await startUsersListening();
    },
    requiredRegulus: true,
    buttons: _ => ({
        hideBack: true,
        hideSave: true,
        send: true,
    }),
};
export default infoNK;