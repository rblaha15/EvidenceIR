import { browser } from "$app/environment"
import { checkAuth, checkRegulusOrAdmin } from '$lib/client/auth';
import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
    if (browser && !await checkAuth()) error(401)
    if (browser && !await checkRegulusOrAdmin()) error(401)
}