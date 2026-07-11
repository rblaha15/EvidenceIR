import type { User } from '$lib/server/auth';

export type EndpointContext = {
    locals: App.Locals,
    headers: Headers,
    origin: string,
    user: User,
    userEmail: string,
    timestamp: Date,
    isLoggedIn: boolean,
    isRegulusOrAdmin: boolean,
    isAdmin: boolean,
};

export type EndpointHandler<
    P,
    R,
> = (args: P, context: EndpointContext) => R | Promise<R>;

export type EndpointDefinition<
    P,
    R = unknown,
> = {
    handler: EndpointHandler<P, R>,
    options?: EndpointOptions,
};

export type EndpointOptions = {
    requireLoggedIn?: boolean,
    requireRegulusOrAdmin?: boolean,
    requireAdmin?: boolean,
};
export const defaultEndpointOptions: EndpointOptions = {
    requireLoggedIn: false,
    requireRegulusOrAdmin: false,
    requireAdmin: false,
};

export const defineEndpoint = <
    P,
    R,
>(
    handler: EndpointHandler<P, R>,
    options?: EndpointOptions,
): EndpointDefinition<P, R> => ({
    handler,
    options,
});

export type EndpointsDefinition = Record<string, EndpointDefinition<any, any>>;

export type InferEndpoint<
    D extends EndpointDefinition<any, any>,
> = D extends EndpointDefinition<infer P, infer R> ? {
    params: P,
    result: Awaited<R>,
} : never;

export type InferEndpoints<
    N extends EndpointsDefinition,
> = {
    [K in keyof N]: InferEndpoint<N[K]>
};

export const prefixEndpoints = <D extends EndpointsDefinition, P extends string>(def: D, prefix: P):
    { [K in keyof D as `${P}/${K extends string ? K : never}`]: D[K] } =>
    def.mapEntries((k, v) => [`${prefix}/${String(k)}`, v]) as
        ReturnType<typeof prefixEndpoints<D, P>>;

export const addAuthRulesBasedOnPrefixes = <D extends EndpointsDefinition>(def: D): D =>
    def.mapValues((k, { handler }) => ({ handler,
        options: {
            requireAdmin: String(k).startsWith('admin/'),
            requireRegulusOrAdmin: String(k).startsWith('regulus/'),
            requireLoggedIn: !String(k).startsWith('open/'),
        },
    })) as D;