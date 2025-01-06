import { nazevIR } from "$lib/Data";
import type { GetPdfData } from '$lib/server/pdf';

const guide: GetPdfData = async ({ evidence: e }, t) => ({
/*          email */ Text1: e.koncovyUzivatel.email,
/*        hesloRR */ Text2: `Regulusroute1`,
/*        hesloIR */ Text3: `uzivatel`,
/*          email */ Text4: e.koncovyUzivatel.email,
/*        hesloRR */ Text5: `Regulusroute1`,
/* regulatorJmeno */ Text6: `${nazevIR(t, e.ir.typ)} ${e.ir.cislo}`,
/*        hesloIR */ Text7: `uzivatel`,
/*          email */ Text8: e.koncovyUzivatel.email,
/*        hesloRR */ Text9: `Regulusroute1`,
/*       PLCjmeno */ Text10: `${nazevIR(t, e.ir.typ)} ${e.ir.cislo} : ${e.koncovyUzivatel.prijmeni} ${e.koncovyUzivatel.jmeno} - ${e.mistoRealizace.obec}`,
/*        hesloIR */ Text11: `uzivatel`,
});
export default guide