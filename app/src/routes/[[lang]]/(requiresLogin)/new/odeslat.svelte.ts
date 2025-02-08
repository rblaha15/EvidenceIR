import { dev } from "$app/environment";
import { sendEmail, SENDER } from "$lib/client/email";
import { existuje, extractIRIDFromRawData, novaEvidence, upravitEvidenci } from '$lib/client/firestore';
import { type Data, newData } from '$lib/forms/Data';
import { nazevFirmy, regulusCRN } from '$lib/helpers/ares';
import type { Widget } from "$lib/Vec.svelte";
import { default as MailRRoute } from "$lib/emails/MailRRoute.svelte";
import { default as MailSDaty } from "$lib/emails/MailSDaty.svelte";
import { get } from "svelte/store";
import { page } from "$app/state";
import { storable } from "$lib/helpers/stores";
import { currentUser } from "$lib/client/auth";
import { getTranslations } from '$lib/translations';
import { getIsOnline } from '$lib/client/realtime';
import { mount } from "svelte";
import { generateXML } from '$lib/createXML';
import { typIR } from '$lib/helpers/ir';
import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
import { relUrl } from '$lib/helpers/runes.svelte';

const storedData = storable<Raw<Data>>('stored_data');

export default async (
    data: Data,
    progress: (vysledek: { red: boolean, text: string, load: boolean }) => void,
    doNotSend: boolean,
    editMode: boolean,
    zobrazitError: () => void
) => {
    try {
        if (editMode && !dev) doNotSend = true

        const t = page.data.translations

        const irid = extractIRIDFromRawData(dataToRawData(data));

        if (!editMode && irid && getIsOnline() && await existuje(irid)) {
            progress({
                red: true,
                text: t.irExistsHtml.parseTemplate({ link: relUrl(`/detail/${irid}`) }),
                load: false
            });
            return;
        }

        const seznam = (Object.values(data) as Data[keyof Data][]).flatMap(
            (obj) => Object.values(obj) as Widget<Data, unknown>[]
        );

        if (seznam.some((it) => {
            if (it.isError(data)) console.log(it)
            return it.isError(data)
        })) {
            zobrazitError()
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
            return
        }

        progress({
            red: false,
            text: t.saving,
            load: true
        });

        const dataToSend = rawDataToData(newData(), dataToRawData(data))

        if (dataToSend.uvedeni.jakoMontazka.value) {
            dataToSend.uvedeni.jakoMontazka.value = false;
            dataToSend.uvedeni.ico.value = dataToSend.montazka.ico.value;
            dataToSend.uvedeni.email.value = dataToSend.montazka.email.value;
            dataToSend.uvedeni.telefon.value = dataToSend.montazka.telefon.value;
        } else if (dataToSend.uvedeni.ico.value == regulusCRN.toString()) {
            dataToSend.uvedeni.email.value = dataToSend.uvedeni.regulus.value!.email;
            dataToSend.uvedeni.telefon.value = dataToSend.uvedeni.regulus.value!.phone;
            dataToSend.uvedeni.zastupce.value = dataToSend.uvedeni.regulus.value!.name;
        }
        if (dataToSend.mistoRealizace.jakoBydliste.value) {
            dataToSend.mistoRealizace.jakoBydliste.value = false;
            dataToSend.mistoRealizace.ulice.value = dataToSend.bydliste.ulice.value;
            dataToSend.mistoRealizace.obec.value = dataToSend.bydliste.obec.value;
            dataToSend.mistoRealizace.psc.value = dataToSend.bydliste.psc.value;
        }
        const rawData = dataToRawData(dataToSend);

        const user = get(currentUser)!

        const div = document.createElement('div');
        mount(MailSDaty, {
            target: div,
            props: { data: dataToSend, t, user, host: page.url.host },
        })

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
            const t = getTranslations('cs')
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
                subject: `Založení RegulusRoute k ${typIR(rawData.ir.typ)} ${rawData.ir.cislo}`,
                html,
                attachments: [
                    {
                        content: generateXML(dataToSend, t),
                        contentType: 'application/xml',
                        filename: `Evidence ${rawData.ir.cislo}.xml`
                    }
                ],
            });
            console.log(response);
        }

        const response = doNotSend ? undefined : await sendEmail({
            from: SENDER,
            replyTo: userAddress,
            to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
            cc: dev ? undefined : userAddress,
            subject: `Nově zaevidovaný regulátor ${typIR(rawData.ir.typ)} ${rawData.ir.cislo}`,
            html,
        });

        if (doNotSend || response!.ok) {
            if (!dev) storedData.set(undefined)
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
        const t = page.data.translations
        console.log(e)
        progress({
            red: true,
            text: t.somethingWentWrongContactUsHtml,
            load: false
        });
    }
};