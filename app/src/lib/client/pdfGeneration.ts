import { PDFDocument, PDFName, PDFRef, PDFSignature } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { getTranslations } from '$lib/translations';
import type { LanguageCode } from '$lib/languages';
import {
    type DataOfPdf,
    type Pdf,
    type PdfArgs,
    type PdfParametersArray,
} from '$lib/client/pdf';
import { irLabel, spName } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import { type IR } from './data';
import type { FormNSP } from '$lib/forms/NSP/formNSP';

type SignatureDefinition = {
    x: number,
    y: number,
    page?: number,
    jpg: string | Uint8Array | ArrayBuffer,
    maxHeight?: number,
    maxWidth?: number,
};

type PdfFieldType = 'Text' | 'Kombinované pole' | 'Zaškrtávací pole' | 'Podpis'

export type PdfGenerationData = {
    [fieldName in `${PdfFieldType}${number}`]: (
    fieldName extends `Zaškrtávací pole${number}` ? boolean
        : fieldName extends `Podpis${number}` ? SignatureDefinition
            : string
    ) | null;
} & {
    fileNameSuffix?: string;
};

export const generatePdf = async <P extends Pdf>(
    args: PdfArgs<P>,
    lang: LanguageCode,
    data: DataOfPdf<P>,
    ...parameters: PdfParametersArray<P>
) => {
    const formLanguage = args.supportedLanguages.includes(lang) ? lang : args.supportedLanguages[0];
    const t = getTranslations(formLanguage);

    const formLocation = `/pdf/${args.pdfName}_${formLanguage}.pdf`;
    const formPdfBytes = await (await fetch(formLocation)).arrayBuffer()

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.setTitle(t.get(args.title));

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const addPage = async <P extends Pdf>(
        pdfArgs2: PdfArgs<P>,
        data2: DataOfPdf<P>,
        ...parameters: PdfParametersArray<NoInfer<P>>
    ) => {
        const pdfData2 = await generatePdf<P>(
            pdfArgs2, lang, data2, ...parameters,
        );
        const pdfDoc2 = await PDFDocument.load(pdfData2.pdfBytes);
        const [newPage] = await pdfDoc.copyPages(pdfDoc2, [0]);
        pdfDoc.addPage(newPage);
    };
    const formData = await args.getPdfData(data, t, addPage, ...parameters);

    for (const fieldName in formData.omit('fileNameSuffix')) {
        const name = fieldName as `${PdfFieldType}${number}`;
        const type = name.split(/\d+/)[0] as PdfFieldType;
        if (type == 'Text') {
            const fieldName = name as `Text${number}`;
            const fieldValue = formData[fieldName];
            const field = form.getTextField(fieldName);
            field.setText(fieldValue?.toString() ?? '');
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
        if (type == 'Podpis') {
            const fieldName = name as `Podpis${number}`;
            const fieldValue = formData[fieldName];
            if (!fieldValue) continue;
            const { x, y, page: p, jpg, maxHeight: mh, maxWidth: mw } = fieldValue;
            const page = pdfDoc.getPages()[p ?? 0];
            const image = await pdfDoc.embedJpg(jpg);
            const heightScale = mh ? mh / image.height : 1;
            const widthScale = mw ? mw / image.width : 1;
            const scale = Math.min(heightScale, widthScale, 1);
            const scaled = image.scale(scale);
            page.drawImage(image, {
                x,
                y,
                width: scaled.width,
                height: scaled.height,
            });
        }
    }

    // fields.forEach(field => {
    //     const type = field.constructor.name;
    //     const name = field.getName();
    //     if (field instanceof PDFTextField) {
    //         const f = form.getTextField(name);
    //         f.setText(name);
    //     }
    //     if (field instanceof PDFDropdown) {
    //         const f = form.getDropdown(name);
    //         f.select(name);
    //     }
    //     console.log(`${type}: ${name}`);
    // });

    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf';
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer());

    pdfDoc.registerFontkit(fontkit);
    const ubuntuFont = await pdfDoc.embedFont(fontBytes);

    form.updateFieldAppearances(ubuntuFont);

    fields.forEach(field => {
        if (field instanceof PDFSignature) {
            field.acroField.getWidgets().forEach(w => {
                w.ensureAP().set(PDFName.of('N'), PDFRef.of(0));
            });
            form.removeField(field);
        }
    });
    form.flatten();

    const pdfBytes = await pdfDoc.save(args.saveOptions);

    const surname = irLabel(args.type == 'IR' ? (data as IR).evidence : data as Raw<FormNSP>).split(' ')[0];
    const suffix = formData.fileNameSuffix ?? (args.type == 'IR' ? (data as IR).evidence.ir.cislo : spName((data as Raw<FormNSP>).zasah));
    const fileName = `${args.pdfName}_${surname} ${suffix}.pdf`;

    return { fileName, pdfBytes };
};