import { type IRID, type SPID, spids } from '$lib/helpers/ir';
import { forms } from '$lib/forms/forms.js';
import { type OpenPdfOptions, type Pdf, pdfInfo } from '$lib/pdf/pdf';
import db, { type IR } from '$lib/data';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { relUrl } from '$lib/helpers/runes.svelte';
import { page } from '$app/state';
import { derived, readable, type Readable } from 'svelte/store';
import languageCodes from '$lib/languageCodes';

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

export const getData = async (id: {
    irid: IRID | null;
    spids: SPID[];
}): Promise<{
    irid: IRID | null, spids: SPID[],
    ir: IR | undefined, sps: Raw<FormNSP>[],
    success: boolean,
}> => {
    const base = { ...id, ir: undefined, sps: [], success: false };

    try {
        if (id.irid) {
            const ir = await db.getIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir, success: true };
        } else if (id.spids) {
            const sps = await id.spids.map(db.getIndependentProtocol).awaitAll();
            return { ...base, sps: sps.filterNotUndefined(), success: true };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};

export const getDataAsStore = (id: {
    irid: IRID | null;
    spids: SPID[]
}): {
    irid: IRID | null, spids: SPID[],
    ir: Readable<IR | undefined | 'loading'>, sps: Readable<Raw<FormNSP>[] | 'loading'>,
} => {
    const base = { ...id, ir: readable(undefined), sps: readable([]) };

    try {
        if (id.irid) {
            const ir = db.getIRAsStore(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir };
        } else if (id.spids) {
            const sps = derived(
                id.spids.map(db.getIndependentProtocolAsStore),
                a => a.some(p => p == 'loading') ? 'loading' : a.filterNotUndefined() as Raw<FormNSP>[],
            );
            return { ...base, sps };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};

export const createFileUrl = (blob: Blob) => new Promise<string>(resolve => {
    const fr = new FileReader();

    fr.onloadend = () => {
        const url = fr.result as string;
        resolve(url);
    };

    fr.readAsDataURL(blob);
});

export const downloadFile = (url: string, fileName: string) =>
    document.createElement('a').also(a => {
        a.download = fileName;
        a.href = url;
    }).click();

export const generatePdfPreviewUrl = <P extends Pdf>(o: OpenPdfOptions<P>) => {
    const { link, irid, spid, lang, ...parameters } = o;

    const url = new URL(relUrl(`/pdf/${link}`), page.url.origin);
    for (const key in parameters) {
        url.searchParams.append(key, String(parameters[key as keyof typeof parameters]));
    }
    if (irid) url.searchParams.append('irid', irid);
    if (spid) url.searchParams.append('spid', spid);
    if (lang) url.searchParams.append('lang', lang);
    return url;
};