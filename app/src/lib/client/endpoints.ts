import type { AllEndpoints } from '$lib/server/endpoints';

type Options<
    T extends keyof AllEndpoints,
    R extends boolean | undefined,
> = {
    fetch?: typeof window.fetch,
    returnError?: R,
} & (Params<T> extends File ? {
    isFileUpload: true,
} : {
    isFileUpload?: false,
});

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

type Params<T extends keyof AllEndpoints> =
    AllEndpoints[T]['params'];

export const call = async <
    T extends keyof AllEndpoints,
    R extends boolean | undefined = undefined,
>(
    action: T,
    ...other: Params<T> extends undefined ? [
        options?: Options<T, R>,
    ] : [
        args: Params<T>,
        ...Params<T> extends File ? [
            options: Options<T, R>,
        ] : [
            options?: Options<T, R>,
        ],
    ]
): Promise<Response<R, T>> => {
    const [arg1, arg2] = other as (object | undefined)[];
    const noArgs = arg1 && ('fetch' in arg1 || 'returnError' in arg1);
    const {
        fetch = window.fetch,
        returnError,
        isFileUpload,
    } = noArgs ? arg1 as Options<T, R> : arg2 as Options<T, R> | undefined ?? {};
    const args = noArgs ? undefined : arg1 as AllEndpoints[T]['params'];
    const init = isFileUpload ? {
        body: (new FormData()).also(d => d.set('file', args as File))
    } : {
        body: JSON.stringify(args),
        headers: {
            'content-type': 'application/json'
        },
    };
    const response = await fetch(`/api?action=${action}`, {
        method: 'POST',
        ...init,
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