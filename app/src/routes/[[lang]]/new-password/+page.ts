import { browser } from '$app/environment';
import { loadNewPassword } from '$lib/features/auth/domain/loadNewPassword';
import { langEntryGenerator } from '$lib/helpers/paths';
import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => !browser
    ? { email: '', mode: 'loading' as const, redirect: '', token: '' }
    : loadNewPassword(url.searchParams);

export const entries: EntryGenerator = langEntryGenerator;
export const prerender = false;