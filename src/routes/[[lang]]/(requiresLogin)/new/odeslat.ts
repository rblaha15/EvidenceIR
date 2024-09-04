import { dev } from "$app/environment";
import { sendEmail, SENDER } from "$lib/client/email";
import { existuje, novaEvidence, upravitEvidenci } from "$lib/client/firestore";
import { dataToRawData, nazevIR, type Data, type RawData } from "$lib/Data";
import { nazevFirmy } from "$lib/helpers/ares";
import type { Vec } from "$lib/Vec";
import { default as MailRRoute } from "$lib/emails/MailRRoute.svelte";
import { default as MailSDaty } from "$lib/emails/MailSDaty.svelte";
import { get } from "svelte/store";
import { page as pageStore } from "$app/stores";
import { relUrl as relUrlStore, storable } from "$lib/helpers/stores";
import { currentUser, getToken } from "$lib/client/auth";

const storedData = storable<RawData | null>(null, 'storedData');

export default async (
    data: Data,
    progress: (vysledek: { red: boolean, text: string, load: boolean }) => void,
    doNotSend: boolean,
    editMode: boolean,
    zobrazitError: () => void
) => {
    if (editMode) doNotSend = true

    const page = get(pageStore)
    const relUrl = get(relUrlStore)
    const t = page.data.translations

    const rawData = dataToRawData(data);
    const ir = rawData.ir.cislo.replace(' ', '');

    if (!editMode && await existuje(ir)) {
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

    progress({
        red: false,
        text: t.saving,
        load: true
    });

    if (data.uvedeni.jakoMontazka.value) {
        data.uvedeni.ico.updateText(data.montazka.ico.value);
        data.uvedeni.zastupce.value = data.montazka.zastupce.value;
        data.uvedeni.email.value = data.montazka.email.value;
    }

    const div = document.createElement('div');
    new MailSDaty({
        target: div,
        props: { data, t, user: get(currentUser)! }
    });

    const html = div.innerHTML;

    if (editMode) {
        await upravitEvidenci(rawData);
    } else {
        await novaEvidence({ evidence: rawData, kontroly: {} });
    }

    if (rawData.vzdalenyPristup.chce && !doNotSend) {
        const montazka = (await nazevFirmy(rawData.montazka.ico)) ?? null;
        const uvadec = (await nazevFirmy(rawData.uvedeni.ico)) ?? null;
        const div = document.createElement('div');
        new MailRRoute({
            target: div,
            props: { e: rawData, montazka, uvadec, t }
        });
        const html = div.innerHTML;

        await sendEmail({
            from: SENDER,
            to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
            subject: `Založení RegulusRoute k ${nazevIR(t, rawData.ir.typ)} ${rawData.ir.cislo}`,
            html,
        });
    }

    const response = doNotSend ? undefined : await sendEmail({
        from: SENDER,
        to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
        subject: `Nově zaevidovaný regulátor ${nazevIR(t, rawData.ir.typ)} ${rawData.ir.cislo}`,
        html
    });

    if (doNotSend || response!.ok) {
        // storedData.set(null)
        progress({
            text: t.redirecting,
            red: false,
            load: true
        });
        // window.location.href = relUrl(`/detail/${ir}`);
        setTimeout(() => {
            progress({
                text: t.redirectFailedHtml.parseTemplate({ link: page.url.origin + relUrl(`/detail/${ir}`) }),
                red: true,
                load: false
            });
        }, 1000);
    } else {
        progress({
            text: t.emailNotSent.parseTemplate({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false
        });
    }
};