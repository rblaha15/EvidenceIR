import { nazevAdresaFirmy } from "$lib/helpers/ares";
import { type PdfArgs } from "$lib/client/pdf";
import { today } from '$lib/helpers/date'

export default {
    formName: 'warranty',
    supportedLanguages: ['cs', 'de'],
    title: `hpWarranty`,
    fileName: `warrantyFileName`,
    getFormData: async ({ evidence: e }, t) => {
        console.log(e.montazka)
        const uvedeni = await nazevAdresaFirmy(e.uvedeni.ico, fetch)
        const montazka = await nazevAdresaFirmy(e.montazka.ico, fetch)
        return {
    /*        tcModel */ Text1: t.get(e.tc.model!),
    /*        tcCislo */ Text2: e.tc.cislo,
    /*       montazka */ Text3: `${e.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
    /* adresaMontazka */ Text4: montazka?.sidlo?.textovaAdresa ?? null,
    /* detailMontazka */ Text5: `${e.montazka.email}		${e.montazka.zastupce}`,
    /*        uvedeni */ Text6: `${e.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
    /*  detailUvedeni */ Text7: `${e.uvedeni.email}		${e.uvedeni.zastupce}`,
    /*       montazka */ Text9: montazka?.obchodniJmeno ?? null,
    /*  clovekUvedeni */ Text11: e.uvedeni.zastupce,
    /*  razitkoProdej */ Text12: '',
    /* razitkoUvedeni */ Text13: '',
    /*          datum */ Text14: today(),
        };
    },
} as PdfArgs