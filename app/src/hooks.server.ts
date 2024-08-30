import { redirect, type Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	console.log('hookefore')
    const response = await resolve(event)
	console.log('hookafter')
    if (response.status == 404)
        return redirect(302, '/new')
    else
        return response
}