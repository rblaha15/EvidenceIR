import type { OpenPdfOptions, Pdf } from '$lib/pdf/pdf';
import { relUrl } from '$lib/helpers/runes.svelte';
import { page } from '$app/state';

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

export const printFile = (objectUrl: string) =>
    document.createElement('iframe').also(iframe => {
        iframe.src = objectUrl;
        iframe.style.display = 'none';
        iframe.onload = () => {
            iframe.contentWindow!.focus();
            iframe.contentWindow!.print();
        };
        document.body.appendChild(iframe);
    })

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