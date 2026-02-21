import db from '$lib/Database';
import { goto } from '$app/navigation';
import { iridUrl } from '$lib/helpers/runes.svelte.js';
import { xmlIN } from '$lib/forms/IN/xmlIN';
import { rawDataToData } from '$lib/forms/Form';
import defaultIN from '$lib/forms/IN/defaultIN';
import { getTranslations } from '$lib/translations';
import { createFileUrl, downloadFile } from '$lib/helpers/files';
import type { IRID } from '$lib/helpers/ir';
import type { ExistingIR } from '$lib/data';

export const removeIR = (irid: IRID) => async () => {
    await db.deleteIR(irid!);
    await goto(iridUrl(`/detail?deleted`), { replaceState: true });
};

export const downloadXML = (ir: ExistingIR) => async () => {
    const xml = xmlIN(rawDataToData(defaultIN(), ir.IN), getTranslations('cs'));
    const blob = new Blob([xml], {
        type: 'application/xml',
    });
    const url = await createFileUrl(blob);
    downloadFile(url, `Evidence ${ir.meta.id}.xml`);
};