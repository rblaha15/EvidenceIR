import { type FriendlyCompanies, type Person, startLidiListening, usersList } from '$lib/client/realtime';
import type { User } from 'firebase/auth';
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
import { companies } from '$lib/helpers/companies';
import type { FormNK } from '$lib/forms/NK/formNK';
import type { IndependentFormInfo } from '$lib/forms/FormInfo';

const infoNK: IndependentFormInfo<FormNK, FormNK, [[FriendlyCompanies], [Person[], User | null]]> = {
    type: '',
    storeName: 'stored_demand',
    defaultData: defaultNK,
    saveData: async (raw, _, data, editResult, t) => {
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
                content: xml(raw, user, cs, data),
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
    createWidgetData: d => d,
    title: t => t.demand.demandForm,
    onMount: async () => {
        await startLidiListening();
    },
    storeEffects: [
        [(_, d, [$companies]) => {
            d.contacts.assemblyCompanySearch.items = () => $companies.assemblyCompanies;
        }, [companies]],
        [(_, d, [$users, $currentUser]) => {
            const withKO = $users.filter(p => p.koNumber && p.responsiblePerson);
            const me = withKO.find(t => $currentUser?.email == t.email);
            d.other.representative.items = () => withKO
                .filter(p => p.email.endsWith('cz'))
                .toSorted((a, b) => a.responsiblePerson!.split(' ').at(-1)!
                    .localeCompare(b.responsiblePerson!.split(' ').at(-1)!));
            if (me) d.other.representative.setValue(d, me);
        }, [usersList, currentUser]],
    ],
    isSendingEmails: true,
    showSaveAndSendButtonByDefault: true,
    requiredRegulus: true,
    hideBackButton: _ => true,
};
export default infoNK;