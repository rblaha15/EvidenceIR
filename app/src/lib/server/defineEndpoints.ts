import type { User } from '$lib/server/auth';
import type { Extends } from '$lib/utils';

export type EndpointContext = {
    locals: App.Locals,
    headers: Headers,
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
    options?: EndpointOptions<Extends<P, File>>,
};

export type EndpointOptions<F extends boolean> = {
    requireLoggedIn?: boolean,
    requireRegulusOrAdmin?: boolean,
    requireAdmin?: boolean,
} & (F extends true ? {
    isFileUpload: true,
} : {
    isFileUpload?: false,
});

export const defaultEndpointOptions: EndpointOptions<false> = {
    requireLoggedIn: false,
    requireRegulusOrAdmin: false,
    requireAdmin: false,
    isFileUpload: false,
};

type DefineEndpoint = <
    P,
    R,
>(
    handler: EndpointHandler<P, R>,
    ...options: P extends File ? [
        options: EndpointOptions<Extends<P, File>>,
    ] : [
        options?: EndpointOptions<Extends<P, File>>,
    ]
) => EndpointDefinition<P, R>;

export const defineEndpoint: DefineEndpoint =
    (handler, ...rest) => ({ handler, options: rest[0] });

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
    def.mapValues((k, { handler, options }) => ({ handler,
        options: {
            ...options,
            requireAdmin: String(k).startsWith('admin/'),
            requireRegulusOrAdmin: String(k).startsWith('regulus/'),
            requireLoggedIn: !String(k).startsWith('open/'),
        },
    })) as D;