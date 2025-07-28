
import type { GetPdfData } from '$lib/client/pdf';
import { irWholeName, irName } from '$lib/helpers/ir';

const pdfNN: GetPdfData<'NN'> = async ({ data: { evidence: e } }) => ({
/*          email */ Text1: e.koncovyUzivatel.email,
/*        hesloRR */ Text2: `Regulusroute1`,
/*        hesloIR */ Text3: `uzivatel`,
/*          email */ Text4: e.koncovyUzivatel.email,
/*        hesloRR */ Text5: `Regulusroute1`,
/* regulatorJmeno */ Text6: irName(e.ir),
/*        hesloIR */ Text7: `uzivatel`,
/*          email */ Text8: e.koncovyUzivatel.email,
/*        hesloRR */ Text9: `Regulusroute1`,
/*       PLCjmeno */ Text10: irWholeName(e, false),
/*        hesloIR */ Text11: `uzivatel`,
});
export default pdfNN