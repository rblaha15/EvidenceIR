import { dev } from "$app/environment";
import { sendEmail, SENDER } from "$lib/client/email";
import { novaEvidence } from "$lib/client/firestore";
import { convertData, type Data } from "$lib/Data";
import { nazevFirmy } from "$lib/helpers/ares";
import type { Vec } from "$lib/Vec";
import { default as MailRRoute } from "$lib/emails/MailRRoute.svelte";
import { default as MailSDaty } from "$lib/emails/MailSDaty.svelte";
import { get } from "svelte/store";
import { page as pageStore } from "$app/stores";
import { relUrl as relUrlStore } from "$lib/helpers/stores";

export default async (
    data: Data,
    progress: (vysledek: { red: boolean, text: string, load: boolean}) => void,
    doNotSend: boolean,
) => {
    const seznam = (Object.values(data) as Data[keyof Data][]).flatMap(
		(obj) => Object.values(obj) as Vec<any>[]
	);

    const page = get(pageStore)
    const relUrl = get(relUrlStore)

    const t = page.data.translations
    const lang = page.data.languageCode

    if (seznam.some((it) => it.zpravaJeChybna({ t, data }))) {
        for (let i = 0; i < seznam.length; i++) {
            seznam[i].zobrazitErrorVeto = true;
        }
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

    if (data.uvedeni.jakoMontazka.zaskrtnuto) {
        data.uvedeni.ico.updateText(data.montazka.ico.text);
        data.uvedeni.zastupce.text = data.montazka.zastupce.text;
        data.uvedeni.email.text = data.montazka.email.text;
    }

    const rawData = convertData({ t, data, lang });

    const div = document.createElement('div');
    new MailSDaty({
        target: div,
        props: { data: rawData }
    });

    const html = div.innerHTML;

    await novaEvidence({ evidence: rawData, kontroly: {} });

    if (rawData.vzdalenyPristup.chce) {
        const montazka = (await nazevFirmy(rawData.montazka.ico)) ?? null;
        const uvadec = (await nazevFirmy(rawData.uvedeni.ico)) ?? null;
        const div = document.createElement('div');
        new MailRRoute({
            target: div,
            props: { data: rawData, montazka, uvadec }
        });
        const html = div.innerHTML;
        if (!doNotSend)
            await sendEmail({
                from: SENDER,
                to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
                subject: `Nově zaevidovaný regulátor ${rawData.ir.typ.first} ${rawData.ir.typ.second} (${rawData.ir.cislo})`,
                html,
            });
    }

    const response = doNotSend ? undefined : await sendEmail({
        from: SENDER,
        to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
        subject: `Nově zaevidovaný regulátor ${rawData.ir.typ.first} ${rawData.ir.typ.second} (${rawData.ir.cislo})`,
        html
    });

    if (doNotSend || response!.ok) {
        progress({
            text: 'Přesměrování...',
            red: false,
            load: true
        });
        const id = rawData.ir.cislo.replace(' ', '');
        window.location.href = (`/detail/${id}`);
        setTimeout(() => {
            progress({
                text: `Přesměrování se nezdařilo. Prosím, přejděte na tuto adresu: <a href="${relUrl(`/detail/${id}`)}">${page.url.origin}${relUrl(`/detail/${id}`)}</a>`,
                red: true,
                load: false
            });
        }, 1000);
    } else {
        progress({
            text: `Email se nepodařilo odeslat: ${response!.status} ${response!.statusText}`,
            red: true,
            load: false
        });
    }
};