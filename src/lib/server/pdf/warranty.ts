import { nazevAdresaFirmy } from "$lib/helpers/ares";
import type { LanguageCode } from "$lib/languages";
import { evidence } from "../firestore";
import { generatePdf } from "../pdf";

const node_fetch = fetch

export default ({ lang, ir, fetch }: { lang: LanguageCode, ir: string, fetch: typeof node_fetch }) => generatePdf({
    lang, ir, fetch,
    getFirebaseData: async () => evidence(ir),
    formLocation: '/warranty_cs.pdf',
    title: "Záruční list tepelného čerpadla",
    fileName: "Záruční list.pdf",
    getFormData: async ({ evidence: e }) => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        const date = `${dd}. ${mm}. ${yyyy}`;

        const uvedeni = await nazevAdresaFirmy(e.uvedeni.ico, fetch)
        const montazka = await nazevAdresaFirmy(e.montazka.ico, fetch)
        return {
    /*        tcModel */ Text1: e.tc.typ,
    /*        tcCislo */ Text2: e.tc.cislo,
    /*       montazka */ Text3: `${e.montazka.ico} — ${montazka?.obchodniJmeno ?? ''}`,
    /* adresaMontazka */ Text4: montazka?.sidlo?.textovaAdresa ?? '',
    /* detailMontazka */ Text5: `${e.montazka.email}		${e.montazka.zastupce}`,
    /*        uvedeni */ Text6: `${e.uvedeni.ico} — ${uvedeni?.obchodniJmeno ?? ''} — ${uvedeni?.sidlo?.textovaAdresa ?? ''}`,
    /*  detailUvedeni */ Text7: `${e.uvedeni.email}		${e.uvedeni.zastupce}`,
    /*       montazka */ Text9: montazka?.obchodniJmeno ?? '',
    /*  clovekUvedeni */ Text11: e.uvedeni.zastupce,
    /*  razitkoProdej */ Text12: '',
    /* razitkoUvedeni */ Text13: '',
    /*          datum */ Text14: date,
        };
    },
})