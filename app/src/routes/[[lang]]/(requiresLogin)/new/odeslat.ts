import { dev } from "$app/environment";
import { sendEmail, SENDER } from "$lib/client/email";
import { existuje, novaEvidence, upravitEvidenci } from "$lib/client/firestore";
import { dataToRawData, nazevIR, type Data, type RawData } from "$lib/Data";
import { nazevFirmy } from "$lib/helpers/ares";
import type { Vec } from "$lib/Vec.svelte";
import { default as MailRRoute } from "$lib/emails/MailRRoute.svelte";
import { default as MailSDaty } from "$lib/emails/MailSDaty.svelte";
import { get } from "svelte/store";
import { page as pageStore } from "$app/stores";
import { relUrl as relUrlStore, storable } from "$lib/helpers/stores";
import { currentUser } from "$lib/client/auth";
import { getTranslations } from "$lib/translations";
import { getIsOnline } from "$lib/client/realtime";
import { mount } from "svelte";

const storedData = storable<RawData>('stored_data');

export default async (
    data: Data,
    progress: (vysledek: { red: boolean, text: string, load: boolean }) => void,
    doNotSend: boolean,
    editMode: boolean,
    zobrazitError: () => void
) => {
    try {
        if (editMode) doNotSend = true

        const page = get(pageStore)
        const relUrl = get(relUrlStore)
        const t = page.data.translations

        const ir = data.ir.cislo.value.replace(' ', '');

        if (!editMode && ir != '' && getIsOnline() && await existuje(ir as string)) {
            progress({
                red: true,
                text: t.irExistsHtml.parseTemplate({ link: relUrl(`/detail/${ir}`) }),
                load: false
            });
            return;
        }

        const seznam = (Object.values(data) as Data[keyof Data][]).flatMap(
            (obj) => Object.values(obj) as Vec<Data, any>[]
        );

        if (seznam.some((it) => {
            if (it.zpravaJeChybna(data)) console.log(it)
            return it.zpravaJeChybna(data)
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

        if (data.uvedeni.jakoMontazka.value) {
            data.uvedeni.ico.value = data.montazka.ico.value;
            data.uvedeni.email.value = data.montazka.email.value;
            data.uvedeni.telefon.value = data.montazka.telefon.value;
        }
        if (data.mistoRealizace.jakoBydliste.value) {
            data.mistoRealizace.ulice.value = data.bydliste.ulice.value;
            data.mistoRealizace.obec.value = data.bydliste.obec.value;
            data.mistoRealizace.psc.value = data.bydliste.psc.value;
        }
        const rawData = dataToRawData(data);

        const user = get(currentUser)!

        const div = document.createElement('div');
        mount(MailSDaty, {
            target: div,
            props: { data, t, user, host: page.url.host },
        })

        const html = div.innerHTML;

        if (editMode) {
            await upravitEvidenci(rawData);
        } else {
            await novaEvidence({ evidence: rawData, kontroly: {}, users: [user.email!] });
        }

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

            await sendEmail({
                from: SENDER,
                to: dev ? 'radek.blaha.15@gmail.com' : 'david.cervenka@regulus.cz',
                subject: `Založení RegulusRoute k ${nazevIR(t, rawData.ir.typ)} ${rawData.ir.cislo}`,
                html,
            });
        }

        const response = doNotSend ? undefined : await sendEmail({
            from: SENDER,
            to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
            cc: dev ? undefined : user.email!,
            subject: `Nově zaevidovaný regulátor ${nazevIR(t, rawData.ir.typ)} ${rawData.ir.cislo}`,
            html
        });

        if (doNotSend || response!.ok) {
            storedData.set(undefined)
            progress({
                text: t.redirecting,
                red: false,
                load: true
            });
            window.location.href = relUrl(`/detail/${ir}`);
            setTimeout(() => {
                progress({
                    text: t.redirectFailedHtml.parseTemplate({ link: page.url.origin + relUrl(`/detail/${ir}`) }),
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
        const page = get(pageStore)
        const t = page.data.translations
        console.log(e)
        progress({
            red: true,
            text: t.somethingWentWrongContactUsHtml,
            load: false
        });
    }
};