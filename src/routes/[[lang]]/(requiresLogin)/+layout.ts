import { checkAuth, currentUser } from '$lib/client/auth';
import type { LayoutLoad } from "./$types";
import { get } from 'svelte/store';

export const load: LayoutLoad = async () => ({
    isLoggedIn: await checkAuth(),
    user: get(currentUser),
} as const)