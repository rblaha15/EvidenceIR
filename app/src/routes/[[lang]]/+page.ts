import { langEntryGenerator } from '$lib/helpers/paths';
import type { EntryGenerator } from './$types';

export const prerender = false;
export const entries: EntryGenerator = langEntryGenerator;