import { type IRID, spids } from '$lib/helpers/ir';
import { forms } from '$lib/forms/forms';
import languageCodes from '$lib/languageCodes';
import { pdfInfo } from '$lib/pdf/pdf';

export const extractIDs = (url: URL) => ({
    irid: url.searchParams.get('irid') as IRID | null,
    spids: url.searchParams.get('spid')?.let(spids) ?? [],
});

const langEntries = [...languageCodes, '', undefined] as const;

export const langEntryGenerator = () =>
    langEntries.map(lang => ({ lang } as const));
export const langAndFormEntryGenerator = () =>
    langEntries.flatMap(lang => forms.map(form => ({ lang, form })));
export const langAndPdfEntryGenerator = () =>
    langEntries.flatMap(lang => pdfInfo.mapTo(pdf => ({ lang, pdf })));