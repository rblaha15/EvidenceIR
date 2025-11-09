
import type { GetPdfData } from '$lib/pdf/pdf';
import { irWholeName, irName } from '$lib/helpers/ir';

const pdfNN: GetPdfData<'NNR'> = async ({ data: { evidence: e }, t }) => ({
/*          email */ Text1: e.koncovyUzivatel.email,
/*        hesloRR */ Text2: t.nnr.passwordRegulusRoute,
/*        hesloIR */ Text3: t.nnr.passwordController,
/*          email */ Text4: e.koncovyUzivatel.email,
/*        hesloRR */ Text5: t.nnr.passwordRegulusRoute,
/* regulatorJmeno */ Text6: irName(e.ir),
/*        hesloIR */ Text7: t.nnr.passwordController,
/*          email */ Text8: e.koncovyUzivatel.email,
/*        hesloRR */ Text9: t.nnr.passwordRegulusRoute,
/*       PLCjmeno */ Text10: irWholeName(e, false),
/*        hesloIR */ Text11: t.nnr.passwordController,
});
export default pdfNN