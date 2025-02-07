
import type { GetPdfData } from '$lib/server/pdf';
import { celyNazevIR, nazevIR } from '$lib/helpers/ir';

const guide: GetPdfData = async ({ evidence: e }) => ({
    fileName: `Návod IR.pdf`,
/*          email */ Text1: e.koncovyUzivatel.email,
/*        hesloRR */ Text2: `Regulusroute1`,
/*        hesloIR */ Text3: `uzivatel`,
/*          email */ Text4: e.koncovyUzivatel.email,
/*        hesloRR */ Text5: `Regulusroute1`,
/* regulatorJmeno */ Text6: nazevIR(e.ir),
/*        hesloIR */ Text7: `uzivatel`,
/*          email */ Text8: e.koncovyUzivatel.email,
/*        hesloRR */ Text9: `Regulusroute1`,
/*       PLCjmeno */ Text10: celyNazevIR(e),
/*        hesloIR */ Text11: `uzivatel`,
});
export default guide