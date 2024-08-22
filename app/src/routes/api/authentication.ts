import type { AuthTypes } from "./authentication/+server"

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