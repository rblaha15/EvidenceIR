import { evidence } from '$lib/firebase';
import { nazevFirmy } from '$lib/constants';
import { generatePdf } from '$lib/pdf';
// import type { RequestHandler } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { RawData } from '$lib/Data';

export const GET: RequestHandler = async ({ url, fetch, params }) => {

	const lang = params.lang
	const ir = params.ir

	return generatePdf({
		lang, ir,
		getFirebaseData: async () => evidence(ir),
		formLocation: '/route.pdf',
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
/*       bydliste */ Text9: `${e.bydliste.ulice} ${e.bydliste.psc} ${e.bydliste.obec}`,
/*         adresa */ Text10: e.mistoRealizace.ulice,
/*        adresa2 */ Text11: `${e.mistoRealizace.psc} ${e.mistoRealizace.obec}`,
/*          email */ Text12: e.koncovyUzivatel.email,
/*        telefon */ Text13: e.koncovyUzivatel.telefon,
/*          typIR */ Text14: e.ir.typ[0] + ' ' + e.ir.typ[1],
/*         serCis */ Text15: e.ir.cislo.split(' ')[0] ?? '',
/*        serCis2 */ Text16: e.ir.cislo.split(' ')[1] ?? '',
/*       cisloBOX */ // Text17: '',
/*        cisloTC */ Text18: e.tc.cislo,
/*      cenaRoute */ Text19: '1000',
/*          datum */ // Text20: '',
/*         podpis */ // Text21: '',
		})
	})
}