import type { IRID, SPID } from '$lib/helpers/ir';
import { languageCodes } from '$lib/languages';
import { forms } from '$lib/forms/forms.js';

export const extractIDs = (url: URL) => ({
    irid: url.searchParams.get('irid') as IRID | null,
    spid: url.searchParams.get('spid') as SPID | null,
});

const langEntries = [...languageCodes, '', undefined] as const;
export const langAndFormEntryGenerator = () =>
    langEntries.flatMap(lang => forms.map(form => ({ lang, form })));
export const langEntryGenerator = () =>
    langEntries.map(lang => ({ lang } as const));