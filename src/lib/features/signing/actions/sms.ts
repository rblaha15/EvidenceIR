import type { SigningStatus } from '../components/Signing.svelte';
import { getToken } from '$lib/client/auth';
import type { SendCodeParams } from '$lib/features/signing/domain/sms';
import { getReasonPhrase } from 'http-status-codes';

export const sendSMS = (
    params: SendCodeParams,
    setStatus: (s: SigningStatus, e?: string) => SigningStatus,
    again?: boolean,
) => async () => {
    const old = setStatus('sendingSMS');

    const token = await getToken();
    const response = await fetch(`/api/signing/send?token=${token}`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'content-type': 'application/json',
        },
    });

    if (response.ok)
        setStatus(again ? 'sentAgain' : 'sent');
    else if (response.status == 400)
        setStatus(old, 'Nesprávné údaje.');
    else if (response.status == 401)
        setStatus(old, 'Nejste přihlášen!');
    else if (response.status == 403)
        setStatus(old, 'K tomuto dokumentu nemáte přístup!');
    else if (response.status == 404)
        setStatus(old, 'Tento dokument neexistuje!');
    else if (response.status == 409)
        setStatus(old, 'Tento dokument je již podpsán nebo je podepisován jiným uživatelem!');
    else if (response.status == 429)
        setStatus(old, 'Moc požadavků. Počkejte prosím 2 minuty a zkuste to znovu.');
    else
        setStatus(old, response.statusText ?? getReasonPhrase(response.status));
};