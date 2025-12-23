import type { IndependentFormInfo } from '$lib/forms/FormInfo';
import type { FormOD } from '$lib/forms/OD/formOD';
import defaultOD from './defaultOD';
import { page } from '$app/state';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { cervenka, defaultAddresses, sendHtmlEmail, userAddress } from '$lib/client/email';
import { getFile, removeFile } from '$lib/components/widgets/File.svelte';
import { dev } from '$app/environment';
import { initialRouteLoggedIn } from '$lib/helpers/globals';
import { separatorsRegExp } from '$lib/forms/IN/defaultIN';

const infoOD: IndependentFormInfo<FormOD, FormOD> = {
    type: '',
    storeName: () => 'stored_documents_to_send',
    defaultData: defaultOD,
    onMount: async (d, f) => {
        const name = userAddress(get(currentUser)!)?.name;
        f.all.body.setValue(
            d, !name ? `Dobrý den,\nv příloze naleznete podepsané dokumenty ze servisního zásahu.`
                : `Dobrý den,\nv příloze naleznete podepsané dokumenty ze servisního zásahu.\nS pozdravem,\n${name}`,
        );
        f.all.userEmail.setValue(d, page.url.searchParams.get('user') ?? '');
    },
    saveData: async (raw, _1, _2, editResult, t) => {
        const user = userAddress(get(currentUser)!);

        const fileIds = [...raw.all.documents, ...raw.all.photos].map(photo => photo.uuid);

        const response = await sendHtmlEmail({
            ...defaultAddresses(cervenka, false, user.name || undefined),
            cc: dev ? undefined : [
                user,
                ...(raw.all.userEmail ? raw.all.userEmail.split(separatorsRegExp).map(t => t.trim()) : []),
                ...(raw.all.otherCopies ? raw.all.otherCopies.split(separatorsRegExp).map(t => t.trim()) : []),
            ],
            subject: `Podepsané dokumenty`,
            attachments:
                (await fileIds.map(getFile).awaitAll())
                    .filterNotUndefined(),
            text: raw.all.body,
        });

        if (response!.ok) {
            await fileIds.map(removeFile).awaitAll();
            return true;
        } else editResult({
            text: t.form.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false,
        });
    },
    createWidgetData: f => f,
    title: t => t.od.title,
    buttons: _ => ({
        hideSave: true,
        send: true,
    }),
    redirectLink: async _ => (page.url.searchParams.get('redirect') ?? initialRouteLoggedIn),
};

export default infoOD;