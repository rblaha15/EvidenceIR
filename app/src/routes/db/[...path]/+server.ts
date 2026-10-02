import { getIsAdmin } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const proxy: RequestHandler = async ({ request, url, locals }) => {
    console.log(locals, getIsAdmin(locals))
    if (!getIsAdmin(locals)) return error(401);

    url.protocol = 'http';
    url.hostname = env.MONGO_EXPRESS_HOSTNAME;
    url.port = '8081';

    return await fetch(url, {
        method: request.method,
        body: ['GET', 'HEAD'].includes(request.method)
            ? undefined
            : request.body,
    });
};

export const GET: RequestHandler = proxy;
export const POST: RequestHandler = proxy;
export const PUT: RequestHandler = proxy;
export const PATCH: RequestHandler = proxy;
export const DELETE: RequestHandler = proxy;
export const HEAD: RequestHandler = proxy;