import { error } from '@sveltejs/kit';
import { GOSMS_CHANNEL_ID, GOSMS_CLIENT_ID, GOSMS_CLIENT_SECRET } from '$env/static/private';

const api = 'https://app.gosms.eu/';

const getToken = (
    fetch: typeof window.fetch,
) => fetch(
    api + `oauth/v2/token?client_id=${GOSMS_CLIENT_ID}&client_secret=${GOSMS_CLIENT_SECRET}&grant_type=client_credentials`,
    {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        },
    },
);

const send = (
    message: string,
    recipients: string | string[],
    token: string,
    fetch: typeof window.fetch,
) => fetch(
    api + 'api/v1/messages/test',
    {
        method: 'POST',
        body: JSON.stringify({
            message, recipients,
            channel: GOSMS_CHANNEL_ID,
        }),
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + token,
        },
    },
);

export const sendSMS = async (
    message: string,
    recipient: string,
    fetch: typeof window.fetch,
) => {
    const token = await getToken(fetch);
    if (!token.ok) {
        console.log(token.status, token.statusText, await token.text());
        error(500, 'Failed to get token');
    }
    const json = await token.json();
    console.log(json);
    if (!json.access_token) error(500, 'Failed to get token');
    const response = await send(message, recipient, json.access_token, fetch);
    console.log(response.status, response.statusText, await response.text());
    if (!response.ok) error(500, 'Failed to send SMS');
};