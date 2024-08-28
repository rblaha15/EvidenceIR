import type { LanguageCode } from "$lib/languages"

export type AuthTypes = {
	createUser: {
		params: {
			email: string,
		}
		returns: {
			uid: string,
		}
	},
	checkEnabled: {
		params: {
			email: string,
		}
		returns: {
			enabled: boolean | null,
		}
	},
	getPasswordResetLink: {
		params: {
			email: string,
			redirect: string,
			lang: LanguageCode,
			mode: 'edit' | 'register',
		}
		returns: {
			link: string
		}
	},
	sendPasswordResetEmail: {
		params: {
			email: string,
			redirect: string,
			lang: LanguageCode,
		}
		returns: {}
	},
	enableUser: {
		params: {
			email: string,
		}
		returns: {}
	},
}

export default async <T extends keyof AuthTypes>(action: T, params: AuthTypes[T]['params']): Promise<AuthTypes[T]['returns']> => {
	const response = await fetch(`/api/authentication`, {
		method: 'POST',
		body: JSON.stringify({ ...params, action: action }),
		headers: {
			'content-type': 'application/json'
		}
	})
	console.log(response.status)
	console.log(response.statusText)
	return await response.json()
};