import type { AllEndpoints } from '$lib/server/endpoints';

type Options<R extends boolean | undefined> = { fetch?: typeof window.fetch, returnError?: R };

type Error = {
    ok: false,
    status: number,
    statusText: string,
    message: string | undefined,
    result?: undefined,
};
type Success<T extends keyof AllEndpoints> = {
    ok: true,
    status: number,
    statusText: string,
    message?: undefined,
    result: AllEndpoints[T]['result'],
};
type Response<R extends boolean | undefined, T extends keyof AllEndpoints> =
    R extends true ? Success<T> | Error : AllEndpoints[T]['result'];

export const call = async <T extends keyof AllEndpoints, R extends boolean | undefined = undefined>(
    action: T,
    ...other: AllEndpoints[T]['params'] extends undefined ? [
        options?: Options<R>,
    ] : [
        args: AllEndpoints[T]['params'],
        options?: Options<R>,
    ]
): Promise<Response<R, T>> => {
    const [arg1, arg2] = other as (object | undefined)[];
    const noArgs = arg1 && ('fetch' in arg1 || 'returnError' in arg1);
    const {
        fetch = window.fetch,
        returnError,
    } = noArgs ? arg1 as Options<R> : arg2 as Options<R> | undefined ?? {};
    const args = noArgs ? undefined : arg1 as AllEndpoints[T]['params'];
    const response = await fetch(`/api/db?action=${action}`, {
        method: 'POST',
        body: JSON.stringify(args),
        headers: {
            'content-type': 'application/json'
        }
    });
    const text = await response.text();
    if (!response.ok) {
        const error = {
            ok: false,
            status: response.status,
            statusText: response.statusText,
            message: text ? JSON.parse(text)?.message : undefined,
        };
        if (!returnError) throw error; else return error as Response<R, T>;
    }
    const result = text ? JSON.parse(text) : undefined;
    console.log(action, args, response.status, result);

    if (!returnError) return result as Response<R, T>; else return {
        ok: true,
        status: response.status,
        statusText: response.statusText,
        result,
    } as Response<R, T>;
};