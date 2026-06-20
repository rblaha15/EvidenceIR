import type { LanguageCode } from '$lib/languageCodes';

export type AuthTypes = {
    trySignUp: {
        params: {
            email: string,
            redirect: string,
            lang: LanguageCode,
        }
        returns: {
            result: 'emailInUse' | 'useNameSurnameEmail' | 'useBusinessEmail' | 'sent',
        }
    },
    sendPasswordResetEmail: {
        params: {
            email: string,
            redirect: string,
            lang: LanguageCode,
        }
        returns: Record<string, never>
    },
}

export default async <T extends keyof AuthTypes>(action: T, params: AuthTypes[T]['params']): Promise<AuthTypes[T]['returns']> => {
    const response = await fetch(`/api/authentication`, {
        method: 'POST',
        body: JSON.stringify({ ...params, action: action }),
        headers: {
            'content-type': 'application/json'
        }
    });
    return await response.json();
};