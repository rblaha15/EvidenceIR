import { getUser } from '$lib/client/auth';
import { call } from '$lib/client/db/endpoints';
import { error } from '@sveltejs/kit';

export const loadNewPassword = async (
    searchParams: URLSearchParams,
) => {
    const token = searchParams.get('token') ?? '';
    const email = searchParams.get('email') ?? '';
    const mode = searchParams.get('mode') ?? '';
    const redirect = searchParams.get('redirect') ?? '';

    if (token) {
        const data = await call('auth/getTokenData', { token });
        if (!data) return error(401, 'Invalid token');

        return { email: data.email, mode: data.mode as 'register' | 'reset' | 'loading', redirect: data.redirect, token };
    } else if (mode == 'edit') {
        const user = await getUser();
        if (!user) return error(401);

        return { email: user.email, mode: 'edit' as const, redirect, token: '' };
    } else if (mode == 'resetSent')
        return { email: '', mode: 'resetSent' as const, redirect: '', token: '' };
    else if (mode == 'resetEmail')
        return { email, mode: 'resetEmail' as const, redirect, token: '' };
    else if (mode)
        return error(400, 'Invalid mode');
    else
        return error(400, 'No mode');
};

export type NewPasswordData = Awaited<ReturnType<typeof loadNewPassword>>;