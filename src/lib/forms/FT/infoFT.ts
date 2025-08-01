import type { FormInfo } from '$lib/forms/FormInfo';
import type { DataFT, FormFT } from '$lib/forms/FT/formFT';
import defaultFT from '$lib/forms/FT/defaultFT';
import type { User } from 'firebase/auth';
import { currentUser } from '$lib/client/auth';
import db from '$lib/client/data';
import type { PdfImport } from '$lib/forms/PdfImport';
import type { Raw } from '$lib/forms/Form';
import { fieldsFT } from '$lib/forms/FT/fieldsFT';

const infoFT: FormInfo<DataFT, FormFT, [[User | null]], 'FT'> = {
    type: 'IR',
    storeName: 'stored_facetable',
    title: t => t.ft.title,
    defaultData: defaultFT,
    createWidgetData: () => {},
    openPdf: () => ({
        link: 'FT',
    }),
    saveData: async (irid, raw) => {
        await db.addFaceTable(irid, raw);
    },
    storeEffects: [[(data, form, [user]) => {
        if (!form.info.setBy.value)
            form.info.setBy.setValue(data, user?.displayName ?? '')
    }, [currentUser]]],
    pdfImport: {
        onImport: () => {},
        fields: fieldsFT,
    },
}

export default infoFT