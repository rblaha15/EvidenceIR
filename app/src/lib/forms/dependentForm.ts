import type { OpenPdfOptions, Pdf } from '$lib/pdf/pdf';
import type { Form } from '$lib/forms/Form';
import type { IRID } from '$lib/helpers/ir';
import db from '$lib/data';
import { detailIrUrl } from '$lib/helpers/runes.svelte.js';
import type { FormInfo, IndependentFormInfo } from '$lib/forms/FormInfo';
import { error } from '@sveltejs/kit';

export const removeDependency = async <
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf<'IR'> = Pdf<'IR'>,
    O extends Record<string, unknown> = Record<never, unknown>,
>(formInfo: FormInfo<D, F, S, P, O>, irid: IRID): Promise<IndependentFormInfo<D, F, S, P, O>> => {
    const {
        storeName,
        openPdf,
        saveData,
        createWidgetData,
        getEditData,
        getViewData,
        onMount,
    } = formInfo;

    const ir = await db.getIR(irid!) ?? error(400, { message: 'IR not found' });

    return {
        ...formInfo,
        type: '',
        storeName: (o) => `${storeName(o)}_${irid}`,
        getEditData: async (url, o) => getEditData?.(ir, url, o),
        getViewData: async url => getViewData?.(ir, url),
        saveData: async (raw, edit, data, editResult, t, send, _draft, other) => {
            const result = await saveData(irid!, raw, edit, data, editResult, t, send, ir, other);
            return result != false;
        },
        redirectLink: async () => detailIrUrl(),
        openPdf: openPdf ? async (_raw, other) => ({
            ...openPdf(other), irid,
        } as OpenPdfOptions<P>) : undefined,
        createWidgetData: (data, other) => createWidgetData(ir.evidence, data, ir, other),
        onMount: (d, f, m, o) => onMount?.(d, f, m, ir, o),
    };
};