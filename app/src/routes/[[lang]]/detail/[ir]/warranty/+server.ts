import { evidence } from '$lib/server/firestore';
import { checkToken } from '$lib/server/auth';
import { nazevAdresaFirmy, nazevFirmy } from '$lib/constants';
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

	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();

	const date = `${dd}. ${mm}. ${yyyy}`;

	return generatePdf({
		lang, ir, fetch,
		getFirebaseData: async () => evidence(ir),
		formLocation: '/warranty_cs.pdf',
		title: "Záruční list tepelného čerpadla",
		fileName: "Záruční list.pdf",
		getFormData: async ({ evidence: e }) => {
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
}