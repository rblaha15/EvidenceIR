import { checkAuth } from "$lib/client/auth";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => ({
    isLoggedIn: await checkAuth()
})