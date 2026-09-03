import { getUser } from '$lib/client/auth';
import { call } from '$lib/client/endpoints';
import type { ExistingIR, ExistingNSP } from '$lib/data';
import { detailUrlIR, detailUrlNSP } from '$lib/helpers/runes.svelte';
import type { SigningStatus } from '../components/Signing.svelte';
import { type CodeAttemptParams, SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC } from '$lib/features/signing/domain/sms';
import { getReasonPhrase } from 'http-status-codes';
import { cervenka, defaultAddresses, sendHtmlEmail, userAddress } from '$lib/client/email';
import { dev } from '$app/environment';
import { type DataOfPdf, type GeneratePdfOptions, pdfInfo, type PdfToSign } from '$lib/pdf/pdf';
import { getTranslations } from '$lib/translations';
import {  generatePdf } from '$lib/pdf/pdfGeneration';
import db from '$lib/client/db';
import { type IRID, irName, type NSPID, spName } from '$lib/helpers/ir';

const email1BodyHtml = (title: string, name: string, link: string, user: string) => `Dobrý den,
v příloze naleznete podepsaný dokument "${title}" k instalaci ${name}.
Odkaz na evidenci instalace v SEIR: <a href="${link}">${link}</a>.

${user}`;
const email2Body = (title: string, user: string) => `Dobrý den,
v příloze naleznete dokument "${title}", který jste podepsali pomocí SMS kódu.
${user}`;

const sendEmails = async (
    o: GeneratePdfOptions<PdfToSign>,
    params: CodeAttemptParams,
    setStatus: (s: SigningStatus, e?: string) => SigningStatus,
) => {
    setStatus('sendingEmail');

    const user = userAddress((await getUser())!);
    const type = params.def.pdf == 'NSP' ? 'NSP' : 'IR';
    const name = type == 'NSP' ? spName((o.data as ExistingNSP).NSP.zasah) : irName((o.data as ExistingIR).IN.ir);
    const link = type == 'NSP' ? detailUrlNSP([params.def.id as NSPID], '?') : detailUrlIR(params.def.id as IRID, '?');
    const pdf = pdfInfo[params.def.pdf];
    const title = pdf.title(getTranslations('cs'));

    const doc = await generatePdf(o);
    const attachment = new File(
        [doc.pdfBytes],
        doc.fileName,
        { type: 'application/pdf' },
    );

    const response1 = await sendHtmlEmail({
        ...defaultAddresses(cervenka, true, user.name),
        subject: `Podepsaný dokument ${title}`,
        attachments: [attachment],
        html: email1BodyHtml(title, name, link, user.name),
    });

    const response2 = await sendHtmlEmail({
        ...defaultAddresses(params.signingBy.email, false, user.name),
        subject: `Podepsaný dokument ${title}`,
        attachments: [attachment],
        text: email2Body(title, user.name),
    });

    if (response1!.ok && response2!.ok) {
        setStatus('end');
        history.back();
    } else {
        setStatus('end', 'Email se nepodařilo odeslat, dokument byl ale úspěšně podepsán!');
    }
};

export const confirmCode = (
    o: Omit<GeneratePdfOptions<PdfToSign>, 'data'>,
    params: CodeAttemptParams,
    setStatus: (s: SigningStatus, e?: string, sec?: number) => SigningStatus,
) => async () => {
    const old = setStatus('confirming');

    const response = await call('signing/confirmCode', params, { returnError: true });

    const data = pdfInfo[params.def.pdf].type == 'IR'
        ? await db.getIR(params.def.id as IRID)
        : await db.getNSP(params.def.id as NSPID);

    if (response.ok)
        await sendEmails({ ...o, data: data as DataOfPdf<PdfToSign> }, params, setStatus);
    else if (response.status == 400)
        setStatus(old, 'Nesprávné údaje.');
    else if (response.status == 401 && response.message == 'wrong-code')
        setStatus(old, `Kód je nesprávný! Zkontrolujte si jeho správnost, počkejte ${SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC} sekund a zkuste to znovu.`, SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC);
    else if (response.status == 401 && response.message == 'too-late')
        setStatus('none', 'Platnost kódu vypršela. Zkuste odestal další kód.');
    else if (response.status == 403)
        setStatus(old, 'K tomuto dokumentu nemáte přístup!');
    else if (response.status == 404)
        setStatus(old, 'Tento dokument neexistuje!');
    else if (response.status == 409)
        setStatus(old, 'Tento dokument je již podpsán nebo je podepisován jiným uživatelem!');
    else if (response.status == 429)
        setStatus(old, `Moc požadavků. Počkejte prosím ${SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC} sekund a zkuste to znovu.`, SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC);
    else
        setStatus(old, response.statusText ?? getReasonPhrase(response.status));
};