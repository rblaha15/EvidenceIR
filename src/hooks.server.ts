import { redirect, type Handle } from "@sveltejs/kit"
import { sequence } from '@sveltejs/kit/hooks';

export const redirectOldDetailUrls: Handle = ({ event, resolve }) => {
    const url = event.url
    const match = url.pathname.match(/(\/[a-z]+)?\/detail\/(S[0-9]{12}|[234B][A-Z][1-9OND][0-9]{4}|[A-Z]{2}-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2})(\/.*)?/);
    if (!match) return resolve(event);
    const lang = match[1]
    const id = match[2]
    const path = match[3] ?? '/detail'
    url.pathname = lang ? lang + path : path
    const type = id.includes('-') ? 'spid' : 'irid';
    url.searchParams.append(type, id)
    redirect(301, url.pathname + url.search + url.hash)
}

export const handle = sequence(redirectOldDetailUrls);