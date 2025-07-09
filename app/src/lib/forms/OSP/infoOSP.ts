import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import type { FormOSP } from '$lib/forms/OSP/formOSP';
import defaultOSP from './defaultOSP';
import { page } from '$app/state';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { cervenka, defaultAddresses, sendEmail } from '$lib/client/email';
import { getFile, removeFile } from '$lib/components/widgets/File.svelte';
import MailSignedProtocol from '$lib/emails/MailSignedProtocol.svelte';
import { startTechniciansListening, techniciansList } from '$lib/client/realtime';

const infoOSP: IndependentFormInfo<void, FormOSP> = {
    type: '',
    storeName: 'stored_service_protocol_to_send',
    defaultData: defaultOSP,
    onMount: async () => {
        await startTechniciansListening()
    },
    saveData: async (raw, _1, _2, editResult, t) => {
        const user = get(currentUser)!;

        const response = await sendEmail({
            ...defaultAddresses(cervenka, true),
            subject: `Podepsaný servisní protokol`,
            attachments: (await [...raw.all.file, ...raw.all.photos]
                .map(async file => ({
                    filename: file.fileName,
                    path: await getFile(file.uuid),
                }))
                .awaitAll())
                .mapNotUndefined(file => file.path ? file : undefined),
            component: MailSignedProtocol,
            props: { email: user.email!, name: user?.displayName?.split(' ')?.[0], note: raw.all.note },
        });

        if (response!.ok) {
            await [...raw.all.file, ...raw.all.photos].map(photo => photo.uuid)
                .map(removeFile).awaitAll()
            return true;
        }
        else editResult({
            text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    showSaveAndSendButtonByDefault: true,
    createWidgetData: () => {},
    title: _ => 'Odeslat podepsaný servisní protokol',
    isSendingEmails: true,
    requiredRegulus: true,
    redirectLink: async _ => (page.url.searchParams.get('redirect') ?? '/IN')
};

export default infoOSP;