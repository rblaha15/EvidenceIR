import { evidence } from '$lib/server/firestore';
import { checkToken } from '$lib/server/auth';
import { nazevFirmy } from '$lib/constants';
import { generatePdf } from '$lib/server/pdf';
// import type { RequestHandler } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
	const lang = params.lang!
	const ir = params.ir
	const t = url.searchParams.get("token")

	const token = await checkToken(t)
	if (!token) error(401, "Unauthorized")

	return generatePdf({
		lang, ir, fetch,
		getFirebaseData: async () => evidence(ir),
		formLocation: '/rroute_cs.pdf',
		title: "Souhlas se zpřístupněním regulátoru IR službě RegulusRoute",
		fileName: "Formulář RegulusRoute.pdf",
		getFormData: async ({ evidence: e }) => ({
/*   icoMontaznik */ Text1: e.montazka.ico,
/* firmaMontaznik */ Text2: (await nazevFirmy(e.montazka.ico, fetch)) ?? '',
/* jmenoMontaznik */ Text3: e.montazka.zastupce,
/*      icoUvadec */ Text4: e.uvedeni.ico,
/*    firmaUvadec */ Text5: (await nazevFirmy(e.uvedeni.ico, fetch)) ?? '',
/*    jmenoUvadec */ Text6: e.uvedeni.zastupce,
/*   jmenoPrimeni */ Text7: `${e.koncovyUzivatel.jmeno} ${e.koncovyUzivatel.prijmeni}`,
/*       narozeni */ Text8: e.koncovyUzivatel.narozeni,
/*       bydliste */ Text9: `${e.bydliste.ulice}, ${e.bydliste.psc} ${e.bydliste.obec}`,
/*         adresa */ Text10: e.mistoRealizace.ulice,
/*        adresa2 */ Text11: `${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
/*          email */ Text12: e.koncovyUzivatel.email,
/*        telefon */ Text13: e.koncovyUzivatel.telefon,
/*          typIR */ Text14: e.ir.typ.first + ' ' + e.ir.typ.second,
/*         serCis */ Text15: e.ir.cislo.split(' ')[0],
/*        serCis2 */ Text16: e.ir.cislo.split(' ')[1],
/*       cisloBOX */ Text17: e.ir.cisloBOX,
/*        cisloTC */ Text18: e.tc.cislo,
/*      cenaRoute */ Text19: '1000',
/*          datum */ // Text20: '',
/*         podpis */ // Text21: '',
		}),
	})
}