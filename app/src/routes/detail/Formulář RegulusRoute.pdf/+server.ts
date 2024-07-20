import { error, type RequestHandler } from '@sveltejs/kit';
import { evidence } from '$lib/firebase';
import { type RawData } from '$lib/Vec';
import download from 'downloadjs';
import { nazevFirmy } from '$lib/constants';

export const GET: RequestHandler = async ({ url, fetch }) => {

	const user = url.searchParams.get("user")
	const id = url.searchParams.get("id")

	if (!user || !id) error(404, "Not Found")

	let snapshot;
	try {
		snapshot = await evidence(user, id);
	} catch (e) {
		console.log(`Nepovedlo se načíst data z firebase ${{user, id}}`);
		error(500, `Nepovedlo se načíst data z firebase ${user}, ${id}, ${e}`)
	}

	if (!snapshot.exists()) error(500, 'Nepovedlo se nalézt data ve firebase');

	let veci = snapshot.data() as RawData;

	const { PDFDocument, PDFStreamWriter, PDFWriter } = await import('pdf-lib/');

	const formPdfBytes = await (await fetch('/route.pdf')).arrayBuffer();

	const pdfDoc = await PDFDocument.load(formPdfBytes);
	pdfDoc.setTitle("Formulář RegulusRoute")
	
	const form = pdfDoc.getForm();

	const icoMontaznik = form.getTextField('Text1');
	const firmaMontaznik = form.getTextField('Text2');
	const jmenoMontaznik = form.getTextField('Text3');
	const icoUvadec = form.getTextField('Text4');
	const firmaUvadec = form.getTextField('Text5');
	const jmenoUvadec = form.getTextField('Text6');
	const jmenoPrimeni = form.getTextField('Text7');
	const narozeni = form.getTextField('Text8');
	// const bydliste = form.getTextField("Text9")
	const adresa = form.getTextField('Text10');
	const adresa2 = form.getTextField('Text11');
	const email = form.getTextField('Text12');
	const telefon = form.getTextField('Text13');
	const typIR = form.getTextField('Text14');
	const serCis = form.getTextField('Text15');
	const serCis2 = form.getTextField('Text16');
	// const cisloBOX = form.getTextField("Text17")
	const cisloTC = form.getTextField('Text18');
	const cenaRoute = form.getTextField('Text19');
	// const datum = form.getTextField("Text20")
	// const podpis = form.getTextField("Text21")

	icoMontaznik.setText(veci.montazka.ico);
	firmaMontaznik.setText((await nazevFirmy(veci.montazka.ico)) ?? '');
	jmenoMontaznik.setText(veci.montazka.zastupce);
	icoUvadec.setText(veci.uvedeni.ico);
	firmaUvadec.setText((await nazevFirmy(veci.uvedeni.ico)) ?? '');
	jmenoUvadec.setText(veci.uvedeni.zastupce);
	jmenoPrimeni.setText(`${veci.koncovyUzivatel.jmeno} ${veci.koncovyUzivatel.prijmeni}`);
	narozeni.setText(veci.koncovyUzivatel.narozeni);
	// bydliste.setText("")
	adresa.setText(veci.mistoRealizace.ulice);
	adresa2.setText(`${veci.mistoRealizace.psc} ${veci.mistoRealizace.obec}`);
	email.setText(veci.koncovyUzivatel.email);
	telefon.setText(veci.koncovyUzivatel.telefon);
	typIR.setText(veci.ir.typ);
	serCis.setText(veci.ir.cislo.split(' ')[0] ?? '');
	serCis2.setText(veci.ir.cislo.split(' ')[1] ?? '');
	// cisloBOX.setText("")
	cisloTC.setText(veci.tc.cislo);
	cenaRoute.setText('1000');
	// datum.setText("")
	// podpis.setText("")

	const { useObjectStreams = true, objectsPerTick = 50 } = {};

	if (pdfDoc.getPageCount() === 0) pdfDoc.addPage();

	await pdfDoc.flush();

	const Writer = useObjectStreams ? PDFStreamWriter : PDFWriter;
	const pdfBytes = await Writer.forContext(pdfDoc.context, objectsPerTick).serializeToBuffer();

	// download(pdfBytes, 'Formulář RegulusRoute.pdf', 'application/pdf');

	return new Response(pdfBytes, {
		headers: {
			'Content-Type': 'application/pdf'
		}
	});
}