import { type Handle, redirect } from "@sveltejs/kit"
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment'

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

export const handleAuth: Handle = async ({ event, resolve }) => {
    // Fetch current session from Better Auth
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    // Make session and user available on server
    event.locals.session = session?.session;
    event.locals.user = session?.user;

    return await svelteKitHandler({ event, resolve, auth, building });
}

export const handle = sequence(redirectOldDetailUrls, handleAuth);
