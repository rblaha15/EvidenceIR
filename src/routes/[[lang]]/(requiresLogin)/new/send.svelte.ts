import { dev } from '$app/environment';
import { sendEmail, SENDER } from '$lib/client/email';
import { existuje, extractIRIDFromRawData, novaEvidence, upravitEvidenci } from '$lib/client/firestore';
import { type Data, newData, type UDDA } from '$lib/forms/Data';
import { nazevFirmy, regulusCRN } from '$lib/helpers/ares';
import { default as MailRRoute } from '$lib/emails/MailRRoute.svelte';
import { default as MailSDaty } from '$lib/emails/MailSDaty.svelte';
import { get } from 'svelte/store';
import { page } from '$app/state';
import { storable } from '$lib/helpers/stores';
import { currentUser } from '$lib/client/auth';
import { getTranslations } from '$lib/translations';
import { getIsOnline } from '$lib/client/realtime';
import { mount } from 'svelte';
import { generateXML } from '$lib/createXML';
import { nazevIR } from '$lib/helpers/ir';
import { dataToRawData, type Form, type Raw, rawDataToData } from '$lib/forms/Form';
import { relUrl } from '$lib/helpers/runes.svelte';

const storedData = storable<Raw<Data>>('stored_data');

export default async (
    { data, progress, doNotSend, editMode, showError }: {
        data: Data,
        progress: (result: { red: boolean; text: string; load: boolean }) => void,
        doNotSend: boolean,
        editMode: boolean,
        showError: () => void,
    },
) => {
    try {
        const t = page.data.translations;

        const irid = extractIRIDFromRawData(dataToRawData(data));

        if (!editMode && irid && getIsOnline() && await existuje(irid)) {
            progress({
                red: true,
                text: t.irExistsHtml.parseTemplate({ link: relUrl(`/detail/${irid}`) }),
                load: false
            });
            return;
        }

        const list = (data as Form<UDDA>).getValues().flatMap(obj => obj.getValues());

        if (list.some(section => {
            const isError = section.isError({ d: data });
            if (isError) console.log(section);
            return isError;
        })) {
            showError();
            progress({
                red: true,
                text: t.youHaveAMistake,
                load: false
            });
            return;
        }

        if (!getIsOnline()) {
            progress({
                red: true,
                text: t.offline,
                load: false
            });
            return;
        }

        progress({
            red: false,
            text: t.saving,
            load: true
        });

        const rawData = dataToRawData(data);

        const user = get(currentUser)!;

        const div = document.createElement('div');
        mount(MailSDaty, {
            target: div,
            props: { data, t, user, origin: page.url.origin },
        });

        const html = div.innerHTML;

        if (editMode) {
            await upravitEvidenci(rawData);
        } else {
            await novaEvidence({ evidence: rawData, kontroly: {}, users: [user.email!], installationProtocols: [] });
        }

        const userAddress = {
            address: user.email!,
            name: user.displayName ?? '',
        };

        if (rawData.vzdalenyPristup.chce && !doNotSend) {
            const t = getTranslations('cs');
            const montazka = (await nazevFirmy(rawData.montazka.ico)) ?? null;
            const uvadec = (await nazevFirmy(rawData.uvedeni.ico)) ?? null;
            const div = document.createElement('div');
            mount(MailRRoute, {
                target: div,
                props: { e: rawData, montazka, uvadec, t }
            });
            const html = div.innerHTML;

            const response = await sendEmail({
                from: SENDER,
                replyTo: userAddress,
                to: dev ? 'radek.blaha.15@gmail.com' : 'david.cervenka@regulus.cz',
                subject: `Založení RegulusRoute k ${nazevIR(rawData.ir)}`,
                html,
                attachments: [{
                    content: generateXML(data, t),
                    contentType: 'application/xml',
                    filename: `Evidence ${extractIRIDFromRawData(rawData)}.xml`
                }],
                pdf: {
                    link: `/cs/detail/${irid}/pdf/rroute`,
                    title: 'Souhlas RegulusRoute.pdf',
                },
            });
            console.log(response);
        }

        const response = doNotSend ? undefined : await sendEmail({
            from: SENDER,
            replyTo: userAddress,
            to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
            cc: dev ? undefined : userAddress,
            subject: editMode
                ? `Úprava evidence regulátoru ${nazevIR(rawData.ir)}`
                : `Nově zaevidovaný regulátor ${nazevIR(rawData.ir)}`,
            html,
        });

        if (doNotSend || response!.ok) {
            if (!dev) storedData.set(undefined);
            progress({
                text: t.redirecting,
                red: false,
                load: true
            });
            if (!dev) window.location.href = relUrl(`/detail/${irid}`);
            setTimeout(() => {
                progress({
                    text: t.redirectFailedHtml.parseTemplate({ link: page.url.origin + relUrl(`/detail/${irid}`) }),
                    red: true,
                    load: false
                });
            }, 5000);
        } else {
            progress({
                text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
                red: true,
                load: false
            });
        }
    } catch (e) {
        const t = page.data.translations;
        console.log(e);
        progress({
            red: true,
            text: t.somethingWentWrongContactUsHtml,
            load: false
        });
    }
};