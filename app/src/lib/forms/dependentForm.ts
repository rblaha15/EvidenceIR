import type { OpenPdfOptions, Pdf } from '$lib/pdf/pdf';
import type { Form, Raw } from '$lib/forms/Form';
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
    R extends Raw<F> = Raw<F>,
>(formInfo: FormInfo<D, F, S, P, R>, irid: IRID): Promise<IndependentFormInfo<D, F, S, P, R>> => {
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
        storeName: `${storeName}_${irid}`,
        getEditData: async url => getEditData?.(ir, url),
        getViewData: async url => getViewData?.(ir, url),
        saveData: async (raw, edit, data, editResult, t, send) => {
            const result = await saveData(irid!, raw, edit, data, editResult, t, send, ir);
            return result != false;
        },
        redirectLink: async () => detailIrUrl(),
        openPdf: openPdf ? async () => ({
            ...openPdf(), irid,
        } as OpenPdfOptions<P>) : undefined,
        createWidgetData: data => createWidgetData(ir.evidence, data),
        hideBackButton: () => false,
        onMount: (d, f, m) => onMount?.(d, f, m, ir),
    };
};