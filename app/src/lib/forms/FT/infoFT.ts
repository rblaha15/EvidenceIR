import type { FormInfo } from '$lib/forms/FormInfo';
import type { DataFT, FormFT } from '$lib/forms/FT/formFT';
import defaultFT from '$lib/forms/FT/defaultFT';
import type { User } from 'firebase/auth';
import { currentUser } from '$lib/client/auth';
import db from '$lib/data';
import type { PdfImport } from '$lib/forms/PdfImport';
import type { Raw } from '$lib/forms/Form';
import { fieldsFT } from '$lib/forms/FT/fieldsFT';

const infoFT: FormInfo<DataFT, FormFT, [], 'FT'> = {
    type: 'IR',
    storeName: 'stored_facetable',
    title: t => t.ft.title,
    defaultData: defaultFT,
    createWidgetData: e => e,
    openPdf: () => ({
        link: 'FT',
    }),
    saveData: async (irid, raw) => {
        await db.addFaceTable(irid, raw);
    },
    pdfImport: {
        onImport: () => {},
        fields: fieldsFT,
    },
    onMount: async (data, form, _, ir) => {
        if (!form.info.setBy.value)
            form.info.setBy.setValue(data, ir.evidence.uvedeni.zastupce)
    }
}

export default infoFT