import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import type { FormOD } from '$lib/forms/OD/formOD';
import defaultOD from './defaultOD';
import { page } from '$app/state';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { cervenka, defaultAddresses, sendEmail, userAddress } from '$lib/client/email';
import { getFile, removeFile } from '$lib/components/widgets/File.svelte';
import MailSignedProtocol from '$lib/emails/MailSignedProtocol.svelte';
import { dev } from '$app/environment';
import { initialRouteLoggedIn } from '$lib/helpers/globals';

const infoOD: IndependentFormInfo<FormOD, FormOD> = {
    type: '',
    storeName: 'stored_documents_to_send',
    defaultData: defaultOD,
    onMount: async (d, f) => {
        f.all.userEmail.setValue(d, page.url.searchParams.get('user') ?? '')
    },
    saveData: async (raw, _1, _2, editResult, t) => {
        const user = userAddress(get(currentUser)!);

        const response = await sendEmail({
            ...defaultAddresses(cervenka, false, user.name || undefined),
            cc: dev ? undefined : raw.all.userEmail ? [user, raw.all.userEmail] : user,
            subject: `Podepsané dokumenty`,
            attachments: (await [...raw.all.documents, ...raw.all.photos]
                .map(async file => ({
                    filename: file.fileName,
                    path: await getFile(file.uuid),
                }))
                .awaitAll())
                .mapNotUndefined(file => file.path ? file : undefined),
            component: MailSignedProtocol,
            props: { email: user.address!, name: (user.name || undefined)?.split(' ')?.[0], note: raw.all.note },
        });

        if (response!.ok) {
            await [...raw.all.documents, ...raw.all.photos].map(photo => photo.uuid)
                .map(removeFile).awaitAll()
            return true;
        }
        else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    showSaveAndSendButtonByDefault: true,
    createWidgetData: f => f,
    title: t => t.od.title,
    isSendingEmails: true,
    redirectLink: async _ => (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn)
};

export default infoOD;