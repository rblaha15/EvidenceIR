import { getIsAdmin, getIsLoggedIn, getIsRegulusOrAdmin } from '$lib/server/auth';
import { defaultEndpointOptions, type EndpointDefinition } from '$lib/server/defineEndpoints';
import { allEndpoints, type AllEndpoints } from '$lib/server/endpoints';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url, locals }) => {
    const actionName = url.searchParams.get('action') as keyof AllEndpoints;
    const action = allEndpoints[actionName] as EndpointDefinition<any, any>;
    if (!actionName || !action) return error(400, 'Invalid action');
    const options = { ...defaultEndpointOptions, ...action.options };
    const body = await request.text();
    const args = body ? JSON.parse(body) : {};

    if (options.requireLoggedIn && !getIsLoggedIn(locals)) {
        console.log('requireLoggedIn not met')
        return error(401);
    }
    if (options.requireRegulusOrAdmin && !getIsRegulusOrAdmin(locals)) {
        console.log('requireRegulusOrAdmin not met')
        return error(401);
    }
    if (options.requireAdmin && !getIsAdmin(locals)) {
        console.log('requireAdmin not met')
        return error(401);
    }
    const context = {
        locals, headers: request.headers, origin: url.origin,
        user: locals.user!, userEmail: locals.user?.email!,
        isLoggedIn: getIsLoggedIn(locals),
        isRegulusOrAdmin: getIsRegulusOrAdmin(locals),
        isAdmin: getIsAdmin(locals),
        timestamp: new Date(),
    };
    const result = await action.handler(args, context);
    console.log(actionName, args, result);

    return json(result);
};