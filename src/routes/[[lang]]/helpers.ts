import type { IRID, SPID } from '$lib/helpers/ir';
import { languageCodes } from '$lib/languages';
import { forms } from '$lib/forms/forms.js';
import { type OpenPdfOptions, type Pdf, pdfInfo } from '$lib/client/pdf';
import db, { type IR } from '$lib/client/data';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import { relUrl } from '$lib/helpers/runes.svelte';
import { page } from '$app/state';
import { get, readable, type Readable } from 'svelte/store';

export const extractIDs = (url: URL) => ({
    irid: url.searchParams.get('irid') as IRID | null,
    spid: url.searchParams.get('spid') as SPID | null,
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
    spid: SPID | null
}): Promise<{
    irid: IRID | null, spid: SPID | null,
    ir: IR | undefined, sp: Raw<FormNSP> | undefined,
    success: boolean,
}> => {
    const base = { ...id, ir: undefined, sp: undefined, success: false };

    try {
        if (id.irid) {
            const ir = await db.getIR(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir, success: true };
        } else if (id.spid) {
            let sp = await db.getIndependentProtocol(id.spid);

            if (!sp) {
                id.spid = id.spid.split('-').slice(0, -1).join('-') as SPID;
                sp = await db.getIndependentProtocol(id.spid);
            }

            if (!sp) return { ...base };
            return { ...base, sp, success: true };
        }
    } catch (e) {
        console.log(e);
        return base;
    }

    return base;
};

export const getDataAsStore = async (id: {
    irid: IRID | null;
    spid: SPID | null
}): Promise<{
    irid: IRID | null, spid: SPID | null,
    ir: Readable<IR | undefined>, sp: Readable<Raw<FormNSP> | undefined>,
}> => {
    const base = { ...id, ir: readable(undefined), sp: readable(undefined) };

    try {
        if (id.irid) {
            const ir = await db.getIRAsStore(id.irid);

            if (!ir) return { ...base };
            return { ...base, ir };
        } else if (id.spid) {
            let sp = await db.getIndependentProtocolAsStore(id.spid);

            if (!get(sp)) {
                id.spid = id.spid.split('-').slice(0, -1).join('-') as SPID;
                sp = await db.getIndependentProtocolAsStore(id.spid);
            }

            if (!sp) return { ...base };
            return { ...base, sp };
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
    url.searchParams.append('lang', lang ?? '?');
    return url;
};