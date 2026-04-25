import type { SigningStatus } from '../components/Signing.svelte';
import { getToken } from '$lib/client/auth';
import type { CodeAttemptParams } from '$lib/features/signing/domain/sms';
import { getReasonPhrase } from 'http-status-codes';

const sendEmails = (setStatus: (s: SigningStatus, e?: string) => SigningStatus) => {
    setStatus('sendingEmail');
};

export const confirmCode = (
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

    if (response.ok)
        sendEmails(setStatus);
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