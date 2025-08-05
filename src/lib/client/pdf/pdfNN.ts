
import type { GetPdfData } from '$lib/client/pdf';
import { irWholeName, irName } from '$lib/helpers/ir';

const pdfNN: GetPdfData<'NN'> = async ({ data: { evidence: e }, t }) => ({
/*          email */ Text1: e.koncovyUzivatel.email,
/*        hesloRR */ Text2: t.nn.passwordRegulusRoute,
/*        hesloIR */ Text3: t.nn.passwordController,
/*          email */ Text4: e.koncovyUzivatel.email,
/*        hesloRR */ Text5: t.nn.passwordRegulusRoute,
/* regulatorJmeno */ Text6: irName(e.ir),
/*        hesloIR */ Text7: t.nn.passwordController,
/*          email */ Text8: e.koncovyUzivatel.email,
/*        hesloRR */ Text9: t.nn.passwordRegulusRoute,
/*       PLCjmeno */ Text10: irWholeName(e, false),
/*        hesloIR */ Text11: t.nn.passwordController,
});
export default pdfNN