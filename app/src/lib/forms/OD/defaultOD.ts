import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '$lib/forms/Widget.svelte';
import type { FormOD } from './formOD';
import { cervenka, receiver } from '$lib/client/email';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';

export default (): FormOD => ({
    all: {
        documents: new FileWidget({ label: t => t.od.signedPdfDocuments, multiple: true, max: 5, accept: 'application/pdf' }),
        photos: new PhotoSelectorWidget({ label: t => t.od.photosFromTheInstallation, multiple: true, max: 5, required: false }),
        note: new InputWidget({ label: t => t.od.noteToEmail, required: false, textArea: true }),
        userEmail: new InputWidget({
            label: t => t.od.customerEmail, required: false, type: 'email',
            onError: t => t.wrong.email, regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
        }),
        info: new TextWidget({
            text: (t, d) =>
                t.od.info1(cervenka) +
                (d.all.userEmail.value
                    ? t.od.info2B({ user: get(currentUser)!.email!, customer: d.all.userEmail.value })
                    : t.od.info2A({ user: get(currentUser)!.email! })) +
                (d.all.userEmail.value ? t.od.info3 : ''),
        }),
    },
});