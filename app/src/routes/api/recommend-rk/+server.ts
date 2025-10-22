import { dev } from '$app/environment';
import { changeCode, changeState, createRK, getIRs, getRK, removeRK } from '$lib/server/firestore';
import { endUserName, extractIRIDFromRawData, irName } from '$lib/helpers/ir';
import ares from '$lib/helpers/ares';
import { sendEmail } from '$lib/server/email';
import { cervenka, SENDER } from '$lib/client/email';
import { htmlToText } from 'html-to-text';
import type { RecommendationData } from '$lib/data';
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

export const GET: RequestHandler = async ({ request, fetch }) => {
    if (!dev && request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response(null, { status: 401 });
    }
    const appUrl = dev ? 'http://localhost:5001': 'https://evidenceir.vercel.app';

    const irs = await getIRs();

    for (const ir of irs) {
        if (!ir.yearlyHeatPumpCheckRecommendation)
            continue;

        const irid = extractIRIDFromRawData(ir.evidence);
        const state = ir.yearlyHeatPumpCheckRecommendation.state;

        const commission = new Date(ir.uvedeniTC!.uvadeni.date);
        const today = new Date(new Date().toISOString().split('T')[0]);
        // const today = new Date(Date.UTC(2025, 10, 6));

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
        const lastFilledCheck = Math.max(
            ...ir.kontrolyTC.getValues().flatMap(tc => tc?.keys().map(Number)).filterNotUndefined(),
        ).let(m => m == -Infinity ? 0 : m);

        console.log({
            irid,
            state,
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

        if (state == 'waiting') {
            const millisSinceAnniversary = today.valueOf() - lastOrThisAnniversary.valueOf();
            const daysSinceAnniversary = Math.floor(millisSinceAnniversary / (1000 * 60 * 60 * 24));

            if (daysSinceAnniversary >= 333 && lastFilledCheck < yearOfNextCheck) {
                const code = crypto.randomUUID();
                const companyType = ir.yearlyHeatPumpCheckRecommendation.executingCompany;
                const getCompany = async () => {
                    const crn = companyType == 'assembly' ? ir.evidence.montazka.ico : ir.evidence.uvedeni.ico;
                    const a = await ares.getName(crn, fetch);
                    return a ? `${a} (${crn})` : crn;
                };
                const user = endUserName(ir.evidence.koncovyUzivatel);
                const data = {
                    irid, user,
                    location: `${ir.evidence.mistoRealizace.ulice}, ${ir.evidence.mistoRealizace.psc} ${ir.evidence.mistoRealizace.obec}`,
                    company: companyType == 'regulus' ? 'Firma Regulus' : await getCompany(),
                    companyEmail: companyType == 'regulus' ? 'servis@regulus.cz' : companyType == 'assembly' ? ir.evidence.montazka.email : ir.evidence.uvedeni.email,
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
                    to: { name: user, address: dev ? 'radek.blaha.15@gmail.com' : ir.evidence.koncovyUzivatel.email },
                    replyTo: { name: 'David Červenka', address: 'david.cervenka@regulus.cz' },
                    subject: 'Upozornění na roční kontrolu tepelného čerpadla',
                    html, text: htmlToText(html),
                });
                await changeCode(irid, code);
                await changeState(irid, 'sentRecommendation');
            }
        } else if (state == 'sentRecommendation') {
            if (anniversaryThisYear <= today) {
                await removeRK(ir.yearlyHeatPumpCheckRecommendation.code!);
                await changeState(irid, 'waiting');
            }
        } else if (state == 'sentRequest') {
            if (anniversaryThisYear <= today) {
                if (lastFilledCheck == yearOfNextCheck - 2) {
                    const link = appUrl + detailIrUrl(irid, '?');
                    const html = reminderEmail(endUserName(ir.evidence.koncovyUzivatel), link);
                    await sendEmail({
                        from: SENDER(),
                        to: dev ? 'radek.blaha.15@gmail.com' : cervenka,
                        subject: `Neproběhla zažádaná roční kontrola TČ u ${irName(ir.evidence.ir)}`,
                        html, text: htmlToText(html),
                    });
                }
                await changeState(irid, 'waiting');
            }
        }
    }

    return new Response(null, { status: 200 });
};

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
            subject: 'Žádost o roční kontrolu TČ',
            html, text: htmlToText(html),
        });
        await removeRK(data.code);
        await changeCode(info.irid, '');
        await changeState(info.irid, 'sentRequest');
        return new Response(email.response, { status: 200 });
    }

    return new Response('Invalid action', { status: 403 });
};