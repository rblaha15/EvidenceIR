import { dev } from '$app/environment';
import { changeCode, changeState, createRK, getIRs, getRK, removeRK } from '$lib/server/firestore';
import { endUserEmails, endUserName, extractIRIDFromRawData, type IRID, irName } from '$lib/helpers/ir';
import ares from '$lib/helpers/ares';
import { sendEmail } from '$lib/server/email';
import { cervenka, SENDER } from '$lib/client/email';
import { htmlToText } from 'html-to-text';
import type { IR, RecommendationData, RecommendationSettings } from '$lib/data';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import type { RequestHandler } from './$types';
import MailCheckReminder from '$lib/emails/MailCheckReminder.svelte';
import { render } from 'svelte/server';


const requestEmail = (info: RecommendationData, link: string) =>
    `<p>Dobrý den,</p>
<p>zákazník ${info.user} má zájem o provedení roční kontroly tepelného čerpadla.</p>
<p>Kontaktujte ho prosím pro domluvení termínu.</p>
<p />
<p>Místo instalace: ${info.location}</p>
<p>Odkaz na záznam v aplikaci Regulus SEIR: <a href="${link}">${link}</a></p>`;

const reminderEmail = (user: string, link: string) =>
    `<p>Zákazník ${user} si nedávno zažádal o provedení roční kontroly tepelného čerpadla, ale ta stále neproběhla.</p>
<p>Kontaktuj prosím kontrolora, zda ji udělá/zaznamená.</p>
<p><a href="${link}">Odkaz na záznam instalace</a></p>`;

const millisOfDay = 1000 * 60 * 60 * 24;

type DateArgs = {
    today: Date, commission: Date,
};
type SystemArgs = {
    ir: IR, irid: IRID, settings: RecommendationSettings, type: 'TČ' | 'SOL'
};
type AppArgs = {
    fetch: typeof window.fetch, appUrl: string,
};

export const GET: RequestHandler = async ({ request, fetch }) => {
    if (!dev && request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response(null, { status: 401 });
    }
    const appUrl = dev ? 'http://localhost:5001' : 'https://evidenceir.vercel.app';

    const irs = await getIRs();

    for (const ir of irs) {
        if (ir.deleted) continue
        const irid = extractIRIDFromRawData(ir.evidence);
        const today = new Date(new Date().toISOString().split('T')[0]);
        // const today = new Date(Date.UTC(2025, 10, 6));

        if (ir.yearlyHeatPumpCheckRecommendation) {
            const settings = ir.yearlyHeatPumpCheckRecommendation;
            const commission = new Date(ir.heatPumpCommissionDate!);
            await processRecommendations({ today, commission, ir, irid, settings, type: 'TČ', fetch, appUrl });
        }
        if (ir.yearlySolarSystemCheckRecommendation) {
            const settings = ir.yearlySolarSystemCheckRecommendation;
            const commission = new Date(ir.solarSystemCommissionDate!);
            await processRecommendations({ today, commission, ir, irid, settings, type: 'SOL', fetch, appUrl });
        }
    }

    return new Response(null, { status: 200 });
};

const processRecommendations = async ({ today, commission, ir, irid, settings, type, fetch, appUrl }: DateArgs & SystemArgs & AppArgs) => {
    const anniversaryThisYear =
        new Date(today.getFullYear(), commission.getMonth(), commission.getDate());
    const anniversaryLastYear =
        new Date(today.getFullYear() - 1, commission.getMonth(), commission.getDate());
    const anniversaryNextYear =
        new Date(today.getFullYear() + 1, commission.getMonth(), commission.getDate());

    const lastOrThisAnniversary =
        anniversaryThisYear <= today ? anniversaryThisYear : anniversaryLastYear;
    const nextAnniversary =
        today < anniversaryThisYear ? anniversaryThisYear : anniversaryNextYear;
    const yearOfNextCheck = nextAnniversary.getFullYear() - commission.getFullYear();
    const filledYears = type == 'TČ'
        ? ir.kontrolyTC.getValues().flatMap(tc => tc?.keys()).filterNotUndefined()
        : ir.kontrolySOL?.keys() ?? [];
    const lastFilledCheck = Math.max(...filledYears.map(Number))
        .let(max => max == -Infinity ? 0 : max);

    console.log({
        irid,
        ...settings,
        commission,
        today,
        anniversaryThisYear,
        anniversaryLastYear,
        anniversaryNextYear,
        lastOrThisAnniversary,
        nextAnniversary,
        yearOfNextCheck,
        lastFilledCheck,
    });

    if (settings.state == 'waiting') {
        const millisSinceAnniversary = today.valueOf() - lastOrThisAnniversary.valueOf();
        const daysSinceAnniversary = Math.floor(millisSinceAnniversary / millisOfDay);

        if (daysSinceAnniversary >= 333 && lastFilledCheck < yearOfNextCheck) {
            await sendRecommendation({ ir, irid, settings, type, fetch, appUrl });
        }
    } else if (settings.state == 'sentRecommendation') {
        if (anniversaryThisYear <= today) {
            await ignoreThisYear({ ir, irid, settings, type });
        }
    } else if (settings.state == 'sentRequest') {
        if (anniversaryThisYear <= today) {
            if (lastFilledCheck <= yearOfNextCheck - 2) {
                await sendReminder({ ir, irid, settings, type, fetch, appUrl });
            }
            await goToTheNextYear(irid, type);
        }
    }
};

const sendRecommendation = async ({ ir, irid, settings, type, fetch, appUrl }: SystemArgs & AppArgs) => {
    const code = crypto.randomUUID();
    const companyType = settings.executingCompany;
    if (companyType == 'regulus') {
        await changeState(irid, 'sentRequest', type);
        return;
    }

    const getCompany = async () => {
        const crn = companyType == 'assembly' ? ir.evidence.montazka.ico : ir.evidence.uvedeni.ico;
        const a = await ares.getName(crn, fetch);
        return a ? `${a} (${crn})` : crn;
    };
    const user = endUserName(ir.evidence.koncovyUzivatel);
    const data = {
        irid, user, type,
        location: `${ir.evidence.mistoRealizace.ulice}, ${ir.evidence.mistoRealizace.psc} ${ir.evidence.mistoRealizace.obec}`,
        company: await getCompany(),
        companyEmail: companyType == 'assembly' ? ir.evidence.montazka.email : ir.evidence.uvedeni.email,
    };
    await createRK(code, data);
    const link = `${appUrl}/request?code=${code}`;
    const { body: html } = render(MailCheckReminder, {
        props: {
            link, data,
        },
    });
    await sendEmail({
        from: SENDER(),
        to: dev ? 'radek.blaha.15@gmail.com' : endUserEmails(ir.evidence.koncovyUzivatel).map(address => ({ name: user, address  })),
        replyTo: { name: 'David Červenka', address: 'david.cervenka@regulus.cz' },
        subject: `Upozornění na roční kontrolu ${data.type === 'TČ' ? 'tepelného čerpadla' : 'solárního systému'} Regulus`,
        html, text: htmlToText(html),
    });
    await changeCode(irid, code, type);
    await changeState(irid, 'sentRecommendation', type);
};

const ignoreThisYear = async ({ irid, settings, type }: SystemArgs) => {
    await removeRK(settings.code!);
    await goToTheNextYear(irid, type);
};

const sendReminder = async ({ appUrl, irid, ir }: SystemArgs & AppArgs) => {
    const link = appUrl + detailIrUrl(irid, '?');
    const html = reminderEmail(endUserName(ir.evidence.koncovyUzivatel), link);
    await sendEmail({
        from: SENDER(),
        to: dev ? 'radek.blaha.15@gmail.com' : cervenka,
        subject: `Neproběhla zažádaná roční kontrola TČ u ${irName(ir.evidence.ir)}`,
        html, text: htmlToText(html),
    });
};

const goToTheNextYear = async (irid: IRID, type: 'TČ' | 'SOL') =>
    await changeState(irid, 'waiting', type);

export type Params = {
    code: string,
    action: 'getData' | 'sendRequest',
};

export const POST: RequestHandler = async ({ request, url }) => {
    const data: Params = await request.json();

    if (!data.code) return new Response(null, { status: 403 });

    const info = await getRK(data.code);

    if (!info) return new Response(null, { status: 403 });

    if (data.action == 'getData') {
        return new Response(JSON.stringify(info), { status: 200 });
    } else if (data.action == 'sendRequest') {
        const link = url.host + detailIrUrl(info.irid, '?');
        const html = requestEmail(info, link);
        const email = await sendEmail({
            from: SENDER(),
            to: { name: info.company, address: dev ? 'radek.blaha.15@gmail.com' : info.companyEmail },
            replyTo: { name: 'David Červenka', address: 'david.cervenka@regulus.cz' },
            subject: `Žádost o roční kontrolu ${info.type}`,
            html, text: htmlToText(html),
        });
        await removeRK(data.code);
        await changeCode(info.irid, '', info.type);
        await changeState(info.irid, 'sentRequest', info.type);
        return new Response(email.response, { status: 200 });
    }

    return new Response('Invalid action', { status: 403 });
};