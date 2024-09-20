import { error } from "@sveltejs/kit";
import { PDFDocument, PDFStreamWriter, PDFWriter, PDFTextField } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getTranslations } from "$lib/translations";
import type { LanguageCode } from "$lib/languages";
import type { PdfArgs } from "$lib/client/pdf";
import { evidence } from "$lib/server/firestore";
import { type IR } from "$lib/client/firestore";

const node_fetch = fetch

export const generatePdf = async (lang: LanguageCode, ir: string, fetch: typeof node_fetch, args: PdfArgs) => {
    let snapshot: DocumentSnapshot<IR | undefined>;
    try {
        snapshot = await evidence(ir)
    } catch (e) {
        console.log(`Nepovedlo se načíst data z firebase ${{ lang, ir }}`);
        error(500, `Nepovedlo se načíst data z firebase ${lang}, ${ir}, ${e}`)
    }
    const formLanguage = args.supportedLanguages.includes(lang) ? lang : args.supportedLanguages[0]
    const t = getTranslations(formLanguage)

    if (!snapshot.exists) error(500, 'Nepovedlo se nalézt data ve firebase');

    const data = snapshot.data()

    if (!data) error(500, 'Nepovedlo se nalézt data ve firebase');

    const formLocation = `/pdf/${args.formName}_${formLanguage}.pdf`
    const formPdfBytes = await (await fetch(formLocation)).arrayBuffer() ?? error(500, "Nepovedlo se načíst PDF");

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.setTitle(t.get(args.title))

    const form = pdfDoc.getForm();

    // const fields = form.getFields()
    // fields.forEach(field => {
    //     const type = field.constructor.name
    //     const name = field.getName()
    //     if (field instanceof PDFTextField) {
    //         const f = form.getTextField(name)
    //         f.setText(name)
    //     }
    //     console.log(`${type}: ${name}`)
    // })

    for (const [fieldName, fieldValue] of Object.entries(await args.getFormData(data, t))) {
        const field = form.getTextField(fieldName)
        field.setText(fieldValue ?? '')
        field.disableSpellChecking()
        if (fieldValue != null) field.enableReadOnly()
    }

    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer())

    pdfDoc.registerFontkit(fontkit)
    const ubuntuFont = await pdfDoc.embedFont(fontBytes)

    form.updateFieldAppearances(ubuntuFont)

    pdfDoc.save()

    const {
        useObjectStreams = true,
        addDefaultPage = true,
        objectsPerTick = 50,
    } = args.saveOptions ?? {};

    if (addDefaultPage && pdfDoc.getPageCount() === 0) pdfDoc.addPage();

    await pdfDoc.flush();

    const Writer = useObjectStreams ? PDFStreamWriter : PDFWriter;
    const pdfBytes = await Writer.forContext(pdfDoc.context, objectsPerTick).serializeToBuffer();

    const encodedName = encodeURIComponent(t.get(args.fileName))
    const encodedTitle = encodeURIComponent(t.get(args.title))

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=' + encodedName,
            'Title': encodedTitle,
        },
        status: 200,
    });
}