import { redirect, type Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event)
    if (response.status == 404)
        return redirect(302, '/new')
    else
        return response
}