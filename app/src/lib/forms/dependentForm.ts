import type { OpenPdfOptions, Pdf } from '$lib/pdf/pdf';
import type { Form } from '$lib/forms/Form';
import type { IRID } from '$lib/helpers/ir';
import { detailUrlIR } from '$lib/helpers/runes.svelte.js';
import type { FormInfo, IndependentFormInfo } from '$lib/forms/FormInfo';
import { error } from '@sveltejs/kit';
import db from '$lib/client/db';

export const removeDependency = async <
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf<'IR'> = Pdf<'IR'>,
    O extends Record<string, unknown> = Record<never, unknown>,
>(formInfo: FormInfo<D, F, S, P, O>, irid: IRID): Promise<IndependentFormInfo<D, F, S, P, O>> => {
    const {
        storeName,
        form,
        openPdf,
        saveData,
        createContext,
        getEditData,
        getViewData,
        onMount,
    } = formInfo;

    const ir = await db.getIR(irid!) ?? error(400, { message: 'IR not found' });

    return {
        ...formInfo,
        type: '',
        form: o => form(o, ir),
        storeName: o => `${storeName(o)}_${irid}`,
        getEditData: async (url, o) => getEditData?.(ir, url, o),
        getViewData: async url => getViewData?.(ir, url),
        saveData: async args => {
            const result = await saveData({ ...args, irid, ir });
            return result != false;
        },
        redirectLink: async () => detailUrlIR(),
        openPdf: openPdf ? async (raw, other) => ({
            ...openPdf(raw, other), irid,
        } as OpenPdfOptions<P>) : undefined,
        createContext: args => createContext({ ...args, ir, IN: ir.IN }),
        onMount: args => onMount?.({ ...args, ir }),
    };
};