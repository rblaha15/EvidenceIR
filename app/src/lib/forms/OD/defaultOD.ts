import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '$lib/forms/Widget.svelte';
import type { FormOD } from './formOD';
import { cervenka, receiver } from '$lib/client/email';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';
import type { FormGroupPlus, FormPlus } from '$lib/forms/Form';

const joinWithLastAnd = (l: string[], and: string) =>
    [l.slice(0, -1).join(', '), l.at(-1)].filter(Boolean).join(and)

export default (): FormPlus<FormOD> => ({
    all: {
        _info: new TextWidget({
            text: (t, d) =>
                t.od.info1(cervenka) +
                joinWithLastAnd([
                    d.all.userEmail.value ? t.od.info2A({ customer: d.all.userEmail.value }) : '',
                    !d.all.otherCopies.value ? '' : t.od.info2B({
                        ccs: joinWithLastAnd(d.all.otherCopies.value.split(',').map(t => t.trim()), t.od.and)
                    }), t.od.info2C({ user: get(currentUser)!.email! }),
                ].filter(Boolean), t.od.and) +
                t.od.info3 +
                (d.all.userEmail.value ? t.od.info4 : ''),
        }),
        documents: new FileWidget({ label: t => t.od.signedPdfDocuments, multiple: true, max: 5, accept: 'application/pdf' }),
        photos: new PhotoSelectorWidget({ label: t => t.od.photosFromTheInstallation, multiple: true, max: 5, required: false }),
        body: new InputWidget({ label: t => t.od.emailBody, required: false, textArea: true }),
        userEmail: new InputWidget({
            label: t => t.od.customerEmail, required: false, type: 'email',
            onError: t => t.wrong.email, regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
        }),
        otherCopies: new InputWidget({
            label: t => t.od.otherCopies, required: false, type: 'email',
        }),
    },
});