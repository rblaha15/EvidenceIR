import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getIsAdmin } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const proxy: RequestHandler = async ({ request, url, locals }) => {
    console.log(locals, getIsAdmin(locals));
    if (!getIsAdmin(locals) && !dev) return error(401);

    url.protocol = 'http';
    url.hostname = env.MONGO_EXPRESS_HOSTNAME;
    url.port = '8081';

    try {
        return await fetch(url, {
            method: request.method,
            body: ['GET', 'HEAD'].includes(request.method)
                ? undefined
                : request.body,
            // @ts-expect-error
            duplex: 'half',
            headers: request.headers,
        });
    } catch {
        return await fetch(url, {
            method: 'GET',
            headers: request.headers,
        });
    }
};

export const GET: RequestHandler = proxy;
export const POST: RequestHandler = proxy;
export const PUT: RequestHandler = proxy;
export const PATCH: RequestHandler = proxy;
export const DELETE: RequestHandler = proxy;
export const HEAD: RequestHandler = proxy;