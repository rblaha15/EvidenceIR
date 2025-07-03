import type { EntryGenerator } from './$types';
import { langEntryGenerator } from '../../helpers';

export const entries: EntryGenerator = langEntryGenerator;

export const prerender = true;