import type { Pdf } from '$lib/client/pdf';
import type { Form, Raw } from '$lib/forms/Form';
import type { IRID } from '$lib/helpers/ir';
import db, { type IR } from '$lib/client/data';
import { detailIrUrl } from '$lib/helpers/runes.svelte.js';
import type { FormInfo, IndependentFormInfo, OpenPdfOptions } from '$lib/forms/FormInfo';

export const removeDependency = <
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf<'IR'> = Pdf<'IR'>,
    R extends Raw<F> = Raw<F>,
>(formInfo: FormInfo<D, F, S, P, R>, irid: IRID): IndependentFormInfo<D, F, S, P, R> => {
    const {
        storeName,
        openPdf,
        saveData,
        createWidgetData,
        getEditData,
        onMount,
    } = formInfo;

    let ir = $state() as IR;

    return {
        ...formInfo,
        type: '',
        storeName: `${storeName}_${irid}`,
        getEditData: async () => {
            const _ir = await db.getIR(irid!);
            if (!_ir) return undefined;
            ir = _ir;
            return getEditData?.(ir);
        },
        saveData: async (raw, edit, data, editResult, t, send) => {
            const result = await saveData(irid!, raw, edit, data, editResult, t, send, ir);
            return result != false;
        },
        redirectLink: async () => detailIrUrl(),
        openPdf: openPdf ? async () => ({
            ...openPdf(),
            data: (await db.getIR(irid))!,
        } as OpenPdfOptions<P>) : undefined,
        createWidgetData: data => createWidgetData(ir.evidence, data),
        showBackButton: () => true,
        onMount: (d, f, e) => onMount?.(d, f, e, ir),
    };
};