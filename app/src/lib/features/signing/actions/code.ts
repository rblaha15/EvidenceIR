import type { SigningStatus } from '../components/Signing.svelte';
import { currentUser, getToken } from '$lib/client/auth';
import type { CodeAttemptParams } from '$lib/features/signing/domain/sms';
import { getReasonPhrase } from 'http-status-codes';
import { cervenka, defaultAddresses, sendHtmlEmail, userAddress } from '$lib/client/email';
import { dev } from '$app/environment';
import { get } from 'svelte/store';
import { type DataOfPdf, type GeneratePdfOptions, pdfInfo, type PdfToSign } from '$lib/pdf/pdf';
import { getTranslations } from '$lib/translations';
import {  generatePdf } from '$lib/pdf/pdfGeneration';
import db from '$lib/client/db';
import type { IRID, NSPID } from '$lib/helpers/ir';

const emailBody = (title: string, user: string) =>
    `Dobrý den,\nv příloze naleznete dokument "${title}", který jste podepsali pomocí SMS kódu.\n${user}`;

const sendEmails = async (
    o: GeneratePdfOptions<PdfToSign>,
    params: CodeAttemptParams,
    setStatus: (s: SigningStatus, e?: string) => SigningStatus,
) => {
    setStatus('sendingEmail');

    const user = userAddress(get(currentUser)!);
    const pdf = pdfInfo[params.def.pdf];
    const title = pdf.title(getTranslations('cs'));

    const doc = await generatePdf(o);

    const response = await sendHtmlEmail({
        ...defaultAddresses(cervenka, false, user.name || undefined),
        cc: dev ? undefined : [
            user,
            params.signingBy.email,
        ],
        subject: `Podepsaný dokument ${title}`,
        attachments: [new File(
            [doc.pdfBytes],
            doc.fileName,
            { type: 'application/pdf' },
        )],
        text: emailBody(title, user.name || ''),
    });

    if (response!.ok) {
        setStatus('end');
        history.back();
    } else {
        setStatus('end', 'Email se nepodařilo odeslat, dokument byl ale úspěšně podepsán!');
    }
};

export const confirmCode = (
    o: Omit<GeneratePdfOptions<PdfToSign>, 'data'>,
    params: CodeAttemptParams,
    setStatus: (s: SigningStatus, e?: string) => SigningStatus,
) => async () => {
    const old = setStatus('confirming');

    const token = await getToken();
    const response = await fetch(`/api/signing/confirm?token=${token}`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'content-type': 'application/json',
        },
    });

    const data = pdfInfo[params.def.pdf].type == 'IR'
        ? await db.getIR(params.def.id as IRID)
        : await db.getNSP(params.def.id as NSPID);

    if (response.ok)
        await sendEmails({ ...o, data: data as DataOfPdf<PdfToSign> }, params, setStatus);
    else if (response.status == 400)
        setStatus(old, 'Nesprávné údaje.');
    else if (response.status == 401)
        setStatus(old, 'Kód je nesprávný! Počkejte prosím 30 sekund a zkuste to zovu.');
    else if (response.status == 403)
        setStatus(old, 'K tomuto dokumentu nemáte přístup!');
    else if (response.status == 404)
        setStatus(old, 'Tento dokument neexistuje!');
    else if (response.status == 409)
        setStatus(old, 'Tento dokument je již podpsán nebo je podepisován jiným uživatelem!');
    else if (response.status == 429)
        setStatus(old, 'Moc požadavků. Počkejte prosím 30 sekund a zkuste to zovu.');
    else
        setStatus(old, response.statusText ?? getReasonPhrase(response.status));
};