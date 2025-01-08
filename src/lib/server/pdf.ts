import { error } from '@sveltejs/kit';
import { PDFDocument, PDFStreamWriter, PDFWriter } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { getTranslations, type Translations } from '$lib/translations';
import type { LanguageCode } from '$lib/languages';
import { type Pdf, type PdfArgs, toPdfTypeName } from '$lib/client/pdf';
import { evidence } from '$lib/server/firestore';
import { type IR } from '$lib/client/firestore';
import check from '$lib/client/pdf/check';
import warranty from '$lib/client/pdf/warranty';
import rroute from '$lib/client/pdf/rroute';
import guide from '$lib/client/pdf/guide';
import heatPumpCommissionProtocol from '$lib/client/pdf/heatPumpCommissionProtocol';
import solarCollectorCommissionProtocol from '$lib/client/pdf/solarCollectorCommissionProtocol';
import installationProtocol from '$lib/client/pdf/installationProtocol';

const node_fetch = fetch;

export type PdfFieldType = 'Text' | 'Kombinované pole' | 'Zaškrtávací pole'
export type GetPdfData = (data: IR, t: Translations) => Promise<{
    [fieldName in `${PdfFieldType}${number}`]: (fieldName extends `Zaškrtávací pole${number}` ? boolean : string) | null;
} & {
    fileName?: string;
}>;
export const getPdfData = (
    link: Pdf,
) => {
    const t = toPdfTypeName(link)
    if (t == 'check') return check;
    if (t == 'warranty') return warranty(Number(link.split('-')[1] || '1') - 1);
    if (t == 'rroute') return rroute;
    if (t == 'guide') return guide;
    if (t == 'heatPumpCommissionProtocol') return heatPumpCommissionProtocol;
    if (t == 'solarCollectorCommissionProtocol') return solarCollectorCommissionProtocol;
    if (t == 'installationProtocol') return installationProtocol(Number(link.split('-')[1]));
    throw 'Invalid link name'
};

export const generatePdf = async (lang: LanguageCode, ir: string, fetch: typeof node_fetch, args: PdfArgs, getData: GetPdfData) => {
    let snapshot: DocumentSnapshot<IR | undefined>;
    try {
        snapshot = await evidence(ir);
    } catch (e) {
        console.log(`Nepovedlo se načíst data z firebase ${{ lang, ir }}`);
        error(500, `Nepovedlo se načíst data z firebase ${lang}, ${ir}, ${e}`);
    }
    const formLanguage = args.supportedLanguages.includes(lang) ? lang : args.supportedLanguages[0];
    const t = getTranslations(formLanguage);

    if (!snapshot.exists) error(500, 'Nepovedlo se nalézt data ve firebase');

    const data = snapshot.data();

    if (!data) error(500, 'Nepovedlo se nalézt data ve firebase');

    const formLocation = `/pdf/${args.formName}_${formLanguage}.pdf`;
    const formPdfBytes = await (await fetch(formLocation)).arrayBuffer() ?? error(500, 'Nepovedlo se načíst PDF');

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.setTitle(t.get(args.title));

    const form = pdfDoc.getForm()

    const formData = await getData(data, t);

    const fileName = formData.fileName ?? t.get(args.fileName);
    formData.fileName = undefined;

    for (const fieldName in formData) {
        const name = fieldName as `${PdfFieldType}${number}`
        const type = name.split(/\d+/)[0] as PdfFieldType;
        if (type == 'Text') {
            const fieldName = name as `Text${number}`;
            const fieldValue = formData[fieldName];
            const field = form.getTextField(fieldName);
            field.setText(fieldValue ?? '');
            field.disableSpellChecking();
            if (fieldValue != null) field.enableReadOnly();
        }
        if (type == 'Kombinované pole') {
            const fieldName = name as `Kombinované pole${number}`;
            const fieldValue = formData[fieldName];
            const field = form.getDropdown(fieldName);
            field.select(fieldValue ?? '');
            field.disableSpellChecking();
            if (fieldValue != null) field.enableReadOnly();
        }
        if (type == 'Zaškrtávací pole') {
            const fieldName = name as `Zaškrtávací pole${number}`;
            const fieldValue = formData[fieldName];
            const field = form.getCheckBox(fieldName);
            if (fieldValue != false) field.check();
            if (fieldValue == false) field.uncheck();
            if (fieldValue != null) field.enableReadOnly();
        }
    }

    // const fields = form.getFields()
    // fields.forEach(field => {
    //     const type = field.constructor.name
    //     const name = field.getName()
    //     if (field instanceof PDFTextField) {
    //         const f = form.getTextField(name)
    //         f.setText(name)
    //     }
    //     if (field instanceof PDFDropdown) {
    //         const f = form.getDropdown(name)
    //         f.select(name)
    //     }
    //     console.log(`${type}: ${name}`)
    // })

    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf';
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer());

    pdfDoc.registerFontkit(fontkit);
    const ubuntuFont = await pdfDoc.embedFont(fontBytes);

    form.updateFieldAppearances(ubuntuFont);

    await pdfDoc.save();

    const {
        useObjectStreams = true,
        addDefaultPage = true,
        objectsPerTick = 50,
    } = args.saveOptions ?? {};

    if (addDefaultPage && pdfDoc.getPageCount() === 0) pdfDoc.addPage();

    await pdfDoc.flush();

    const Writer = useObjectStreams ? PDFStreamWriter : PDFWriter;
    const pdfBytes = await Writer.forContext(pdfDoc.context, objectsPerTick).serializeToBuffer();

    const encodedName = encodeURIComponent(fileName);
    const encodedTitle = encodeURIComponent(t.get(args.title));

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=' + encodedName,
            'Title': encodedTitle,
        },
        status: 200,
    });
};