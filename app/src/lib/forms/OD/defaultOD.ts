import type { ContextOD, FormOD } from './formOD';
import { cervenka } from '$lib/client/email';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';
import type { FormPlus } from '$lib/forms/Form';
import { emailRegExp, multiple, separatorsRegExp } from '$lib/forms/IN/defaultIN';
import { newFileWidget, newInputWidget, newPhotoSelectorWidget, newTextWidget } from '$lib/forms/Widget';

const joinWithLastAnd = (l: string[], and: string) =>
    [l.slice(0, -1).join(', '), l.at(-1)].filter(Boolean).join(and)

export default (): FormPlus<FormOD> => ({
    all: {
        _info: newTextWidget<ContextOD>({
            text: (t, c) => [
                t.od.info1(cervenka.map(e => e.address) as [string, string]),
                joinWithLastAnd([
                    c.v.all.userEmail ? t.od.info2A({
                        customer: joinWithLastAnd(c.v.all.userEmail.split(separatorsRegExp).map(t => t.trim()), t.od.and)
                    }) : '',
                    c.v.all.userEmail ? t.od.info2B({
                        assembly: joinWithLastAnd(c.v.all.assemblyEmail.split(separatorsRegExp).map(t => t.trim()), t.od.and)
                    }) : '',
                    !c.v.all.otherCopies ? '' : t.od.info2C({
                        ccs: joinWithLastAnd(c.v.all.otherCopies.split(separatorsRegExp).map(t => t.trim()), t.od.and)
                    }),
                    t.od.info2D({ user: get(currentUser)!.email! }),
                ].filter(Boolean), t.od.and),
                t.od.info3,
                c.v.all.userEmail ? t.od.info4 : '',
            ].join(''),
        }),
        documents: newFileWidget({ label: t => t.od.signedPdfDocuments, multiple: true, max: 5, accept: 'application/pdf' }),
        photos: newPhotoSelectorWidget({ label: t => t.od.photosFromTheInstallation, multiple: true, max: 5, required: false }),
        body: newInputWidget({ label: t => t.od.emailBody, required: false, textArea: true }),
        userEmail: newInputWidget({
            label: t => t.od.customerEmail, required: false, type: 'email',
            onError: t => t.wrong.email, regex: multiple(emailRegExp),
        }),
        assemblyEmail: newInputWidget({
            label: t => t.od.assemblyEmail, required: false, type: 'email',
            onError: t => t.wrong.email, regex: multiple(emailRegExp),
        }),
        otherCopies: newInputWidget({
            label: t => t.od.otherCopies, required: false, type: 'email',
            onError: t => t.wrong.email, regex: multiple(emailRegExp),
        }),
    },
});