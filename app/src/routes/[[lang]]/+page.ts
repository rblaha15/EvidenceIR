// import type { PageLoad } from './$types';
// import { checkAuth } from '$lib/client/auth';
// import { initialRouteLoggedIn, initialRouteLoggedOut } from '$lib/helpers/globals';
// import type { PageLoad } from './help/$types';
// import { relUrl } from '$lib/helpers/runes.svelte';
// import { redirect } from '@sveltejs/kit';
// import { goto } from '$app/navigation';

// export const load: PageLoad = async ({ parent }) => {
    // const data = await parent()
    // console.log(data)
    //
    // const isLoggedIn = await checkAuth();
    // const route = isLoggedIn ? initialRouteLoggedIn : initialRouteLoggedOut;
    // const lang = data.isLanguageFromUrl ? data.languageCode : '?';
    // return await goto(relUrl(route, lang));
// }