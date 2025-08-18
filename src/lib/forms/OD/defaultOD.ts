import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '$lib/forms/Widget.svelte';
import { p } from '$lib/translations';
import type { FormOD } from './formOD';
import { receiver } from '$lib/client/email';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';

export default (): FormOD => ({
    all: {
        documents: new FileWidget({ label: 'od.signedPdfDocuments', multiple: true, max: 5, accept: 'application/pdf' }),
        photos: new PhotoSelectorWidget({ label: 'od.photosFromTheInstallation', multiple: true, max: 5, required: false }),
        note: new InputWidget({ label: 'od.noteToEmail', required: false, textArea: true }),
        userEmail: new InputWidget({
            label: 'od.customerEmail', required: false, type: 'email',
            onError: `wrong.email`, regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
        }),
        info: new TextWidget({
            text: (d, t) => p(
                t.od.info1(receiver) +
                (d.all.userEmail.value
                    ? t.od.info2A({ user: get(currentUser)!.email! })
                    : t.od.info2B({ user: get(currentUser)!.email!, customer: d.all.userEmail.value })) +
                (d.all.userEmail.value ? t.od.info3 : '')),
        }),
    },
});