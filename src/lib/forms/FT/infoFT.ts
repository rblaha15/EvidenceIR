import type { FormInfo } from '$lib/forms/FormInfo';
import type { DataFT, FormFT } from '$lib/forms/FT/formFT';
import defaultFT from '$lib/forms/FT/defaultFT';
import { fieldsFT } from '$lib/forms/FT/fieldsFT';
import db from '$lib/Database';

const infoFT: FormInfo<DataFT, FormFT, [], 'FT'> = {
    type: 'IR',
    storeName: () => 'stored_facetable',
    title: t => t.ft.title,
    defaultData: defaultFT,
    createWidgetData: e => e,
    openPdf: () => ({
        link: 'FT',
    }),
    saveData: async (irid, raw) => {
        await db.addFT(irid, raw);
    },
    pdfImport: {
        onImport: () => {},
        fields: fieldsFT,
    },
    onMount: async (data, form, _, ir) => {
        if (!form.info.setBy.value)
            form.info.setBy.setValue(data, ir.IN.uvedeni.zastupce)
    }
}

export default infoFT