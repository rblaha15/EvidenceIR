import { nazevFirmy } from "$lib/helpers/ares";
import type { LanguageCode } from "$lib/languages";
import { p, type Pair } from "$lib/Vec";
import type { first } from "lodash-es";
import { evidence } from "../firestore";
import { generatePdf } from "../pdf";
import type { TranslationReference } from "$lib/translations";

const node_fetch = fetch

export default ({ lang, ir, fetch }: { lang: LanguageCode, ir: string, fetch: typeof node_fetch }) => generatePdf({
    lang, ir, fetch,
    getFirebaseData: async () => evidence(ir),
    formLocation: '/guide_cs.pdf',
    title: p`Souhlas se zpřístupněním regulátoru IR službě RegulusRoute`,
    fileName: p`Formulář RegulusRoute.pdf`,
    getFormData: async ({ evidence: e }, t) => {
        const nazevIR = ({first, second}: Pair) => first?.includes('BOX') ? t.getT`${<TranslationReference>first!.split(' ').slice(0, 2).join(' ')} ${second!}` : t.getT`${<TranslationReference>first!.replaceAll(' ', '')}${second!}`
        return {
        /*          email */ Text1: e.koncovyUzivatel.email,
        /*        hesloRR */ Text2: `Regulusroute1`,
        /*        hesloIR */ Text3: `uzivatel`,
        /*          email */ Text4: e.koncovyUzivatel.email,
        /*        hesloRR */ Text5: `Regulusroute1`,
        /* regulatorJmeno */ Text6: `${nazevIR(e.ir.typ)} ${e.ir.cislo}`,
        /*        hesloIR */ Text7: `uzivatel`,
        /*          email */ Text8: e.koncovyUzivatel.email,
        /*        hesloRR */ Text9: `Regulusroute1`,
        /*       PLCjmeno */ Text10: `${nazevIR(e.ir.typ)} ${e.ir.cislo} : ${e.koncovyUzivatel.prijmeni} ${e.koncovyUzivatel.jmeno} - ${e.mistoRealizace.obec}`,
        /*        hesloIR */ Text11: `uzivatel`,
        };
    },
})