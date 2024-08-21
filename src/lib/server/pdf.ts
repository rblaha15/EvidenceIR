import { error } from "@sveltejs/kit";
import { PDFDocument, PDFStreamWriter, PDFWriter, type SaveOptions } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"
import type { DocumentSnapshot } from "firebase-admin/firestore";

const node_fetch = fetch

export const generatePdf = async <T>(args: {
    lang: string,
    ir: string,
    getFirebaseData: () => Promise<DocumentSnapshot<T | undefined>>
    formLocation: string,
    title: string,
    fileName: string,
    getFormData: (data: T) => Promise<{
        [fieldName: string]: string,
    }>,
    saveOptions?: SaveOptions,
    fetch?: typeof node_fetch
}) => {
    let snapshot: DocumentSnapshot<T | undefined>;
    try {
        snapshot = await args.getFirebaseData();
    } catch (e) {
        console.log(`Nepovedlo se načíst data z firebase ${{ lang: args.lang, ir: args.ir }}`);
        error(500, `Nepovedlo se načíst data z firebase ${args.lang}, ${args.ir}, ${e}`)
    }

    if (!snapshot.exists) error(500, 'Nepovedlo se nalézt data ve firebase');

    const data = snapshot.data()

    if (!data) error(500, 'Nepovedlo se nalézt data ve firebase');

    const formPdfBytes = await (await (args.fetch ?? node_fetch)(args.formLocation)).arrayBuffer() ?? error(500, "Nepovedlo se načíst PDF");

    const pdfDoc = await PDFDocument.load(formPdfBytes);

    pdfDoc.setTitle(args.title)

    const form = pdfDoc.getForm();

    // const fields = form.getFields()
    // fields.forEach(field => {
    //     const type = field.constructor.name
    //     const name = field.getName()
    //     const f = form.getTextField(name)
    //     f.setText(name)
    //     console.log(`${type}: ${name}`)
    // })

    for (const [fieldName, fieldValue] of Object.entries(await args.getFormData(data))) {
        const field = form.getTextField(fieldName)
        field.setText(fieldValue)
    }

    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
    const fontBytes = await (args.fetch ?? node_fetch)(url).then((res) => res.arrayBuffer())

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

    const encodedName = encodeURIComponent(args.fileName)

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=' + encodedName,
        },
        status: 200,
    });
}