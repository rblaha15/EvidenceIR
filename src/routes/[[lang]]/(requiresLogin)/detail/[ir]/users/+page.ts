import { browser } from "$app/environment"
import { checkAdmin, checkAuth, currentUser } from "$lib/client/auth"
import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { get } from "svelte/store"

export const load: PageLoad = async () => {

    if (browser && !await checkAuth()) error(401)
    if (
        browser
        && !get(currentUser)?.email?.endsWith("@regulus.cz")
        && !await checkAdmin()
    ) error(401)
}