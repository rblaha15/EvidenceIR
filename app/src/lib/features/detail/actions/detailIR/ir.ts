import db from '$lib/client/db';
import { goto } from '$app/navigation';
import { localeDefaultLanguageCode } from '$lib/helpers/globals';
import { iridUrl } from '$lib/helpers/runes.svelte.js';
import { xmlIN } from '$lib/forms/IN/xmlIN';
import { rawDataToValues } from '$lib/forms/Form';
import defaultIN from '$lib/forms/IN/defaultIN';
import { getTranslations } from '$lib/translations';
import { createFileUrl, downloadFile } from '$lib/helpers/files';
import type { IRID } from '$lib/helpers/ir';
import type { ExistingIR } from '$lib/data';

export const removeIR = async (irid: IRID) => {
    await db.deleteIR(irid!);
    await goto(iridUrl(`/detail?deleted`), { replaceState: true, invalidateAll: true });
};

export const downloadXML = (ir: ExistingIR) => async () => {
    const xml = xmlIN({ v: rawDataToValues(defaultIN(), ir.IN), f: defaultIN() }, getTranslations(localeDefaultLanguageCode));
    const blob = new Blob([xml], {
        type: 'application/xml',
    });
    const url = await createFileUrl(blob);
    downloadFile(url, `Evidence ${ir.meta.id}.xml`);
};