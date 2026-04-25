import { langAndPdfEntryGenerator } from '$lib/helpers/paths';
import { type PdfToSign } from '$lib/pdf/pdf';
import type { EntryGenerator, PageLoad } from './$types';
import { loadSigning } from '$lib/features/signing/domain/load';
import { browser } from '$app/environment';
import { readable } from 'svelte/store';

export const entries: EntryGenerator = langAndPdfEntryGenerator;

export const load: PageLoad = async ({ params, url }) => !browser
    ? { def: undefined, ir: readable(undefined), sp: readable(undefined), args: undefined, settings: readable(undefined) } as const
    : loadSigning(params.pdf as PdfToSign, url);

export const prerender = true;