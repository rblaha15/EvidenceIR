import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { getTranslations } from '$lib/translations';
import { type GeneratePdfOptions, type Pdf, pdfInfo, type PdfWithDefiningParameter, pdfWithDefiningParameter } from '$lib/pdf/pdf';
import { irLabel, spName } from '$lib/helpers/ir';
import { type ExistingIR, type ExistingNSP, type IR, type NSP, type SignatureState } from '../data';
import { createFileUrl } from '$lib/helpers/files';
import { ColorTypes } from 'pdf-lib/cjs/api/colors';

type PdfFieldType = 'Text' | 'Kombinované pole' | 'Zaškrtávací pole' | 'Dropdown' | '_'

export type PdfGenerationData = {
    [K in `${PdfFieldType}${string}`]: K extends `Text${string}` ? string | null
        : K extends `Kombinované pole${string}` ? string | null
            : K extends `Dropdown${string}` ? string | null
                : K extends `Zaškrtávací pole${string}` ? boolean | null
                    : K extends `_${string}` ? {
                        type: 'text',
                        value: string | null,
                    } | {
                        type: 'dropdown',
                        value: string | null,
                    } | {
                        type: 'checkbox',
                        value: boolean | null,
                    } : never
} & {
    images?: {
        x: number,
        y: number,
        page?: number,
        jpg: string | Uint8Array | ArrayBuffer,
        maxHeight?: number,
        maxWidth?: number,
    }[],
    fileNameSuffix?: string,
    signature?: {
        x: number,
        y: number,
        maxWidth: number,
        page?: number,
    },
}

export const generatePdfUrl = async <P extends Pdf>(
    o: GeneratePdfOptions<P>,
) => {
    const file = await generatePdfFile(o);

    const url = await createFileUrl(file);
    const objectUrl = URL.createObjectURL(file);
    return { url, objectUrl, fileName: file.name };
};

export const generatePdfFile = async <P extends Pdf>(
    o: GeneratePdfOptions<P>,
) => {
    const pdfData = await generatePdf(o);

    return new File([pdfData.pdfBytes], pdfData.fileName, {
        type: 'application/pdf',
    });
};

export const generatePdf = async <P extends Pdf>(
    o: GeneratePdfOptions<P>,
) => {
    const { lang, data, pages, fetch = window.fetch } = o;
    const args = pdfInfo[o.link];

    const formLanguage = args.supportedLanguages.includes(lang) ? lang : args.supportedLanguages[0];
    const t = getTranslations(formLanguage);

    const formLocation = `/pdf/${args.pdfName}_${formLanguage}.pdf`;
    const formPdfBytes = await (await fetch(formLocation, { cache: 'reload' })).arrayBuffer();

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.setTitle(args.title(t));

    const form = pdfDoc.getForm();

    const addDoc = async <P extends Pdf>(o: GeneratePdfOptions<P>) => {
        const pdfData2 = await generatePdf<P>(o);
        const args2 = pdfInfo[o.link];
        const pdfDoc2 = await PDFDocument.load(pdfData2.pdfBytes);
        if (!args2.doNotFlatten) pdfDoc2.getForm().flatten();
        const newPages = await pdfDoc.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
        newPages.forEach(newPage => {
            pdfDoc.addPage(newPage);
        });
    };
    const formData = await args.getPdfData?.({ ...o, t, addDoc, data, lang }) ?? {};

    const initText = (name: string, value: string | null) => {
        const field = form.getTextField(name);
        field.setText(value?.toString() ?? ' ');
        field.disableSpellChecking();
        if (!value) field.setText(' ');
    };
    const initDropdown = (name: string, value: string | null) => {
        const field = form.getDropdown(name);
        if (!field.getOptions().includes(value ?? ''))
            field.addOptions(value ?? '');
        field.select(value ?? '');
        field.disableSpellChecking();
        // if (value == null) field.select('');
    };
    const initCheckbox = (name: string, value: boolean | null) => {
        const field = form.getCheckBox(name);
        if (value == true) field.check();
        if (value == false) field.uncheck();
        // if (value != null) field.enableReadOnly();
    };

    const fieldDefinitions = formData.omit('images', 'fileNameSuffix', 'signature');

    for (const name in fieldDefinitions) {
        if (name.startsWith('Text')) initText(name, formData[name as `Text${string}`]);
        else if (name.startsWith('Kombinované pole')) initDropdown(name, formData[name as `Kombinované pole${string}`]);
        else if (name.startsWith('Dropdown')) initDropdown(name, formData[name as `Dropdown${string}`]);
        else if (name.startsWith('Zaškrtávací pole')) initCheckbox(name, formData[name as `Zaškrtávací pole${string}`]);
        else if (name.startsWith('_')) {
            const field = formData[name as `_${string}`];
            const name2 = name.slice(1);
            if (field.type == 'text') initText(name2, field.value);
            if (field.type == 'dropdown') initDropdown(name2, field.value);
            if (field.type == 'checkbox') initCheckbox(name2, field.value);
        }
    }

    await formData.images?.map(async ({ x, y, page: p, jpg, maxHeight: mh, maxWidth: mw }) => {
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
    }).awaitAll();

    /*const fields = form.getFields();
    const { PDFTextField, PDFDropdown } = await import('pdf-lib');
    fields.forEach(field => {
        const type = field.constructor.name;
        const name = field.getName();
        if (field instanceof PDFTextField) {
            const f = form.getTextField(name);
            f.setText(name);
        }
        if (field instanceof PDFDropdown) {
            const f = form.getDropdown(name);
            f.select(name);
        }
        console.log(`${type}: ${name}`);
    });*/

    const url = '/Ubuntu-Regular.ttf';
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer());

    pdfDoc.registerFontkit(fontkit);
    const ubuntuFont = await pdfDoc.embedFont(fontBytes);

    form.updateFieldAppearances(ubuntuFont);

    // fields.forEach(field => {
    //     if (field instanceof PDFSignature) {
    //         field.acroField.getWidgets().forEach(w => {
    //             w.ensureAP().set(PDFName.of('N'), PDFRef.of(0));
    //         });
    //         form.removeField(field);
    //     }
    // });
    if (!args.doNotFlatten) form.flatten();

    if (formData.signature) {
        const parameterName = o.link in pdfWithDefiningParameter ? pdfWithDefiningParameter[o.link as PdfWithDefiningParameter] : undefined;
        const parameter = parameterName ? o[parameterName as keyof typeof o] as number : undefined;
        const signatures = (data as ExistingIR | ExistingNSP).signatures ?? {};
        const settings = parameter
            ? signatures?.[o.link as keyof typeof signatures]?.[parameter]
            : signatures?.[o.link as keyof typeof signatures] as SignatureState | undefined;
        // const settings = signatures?.['RR' as keyof typeof signatures] as SignatureState | undefined;
        if (settings?.state == 'signed') {
            const { x, y, maxWidth: mw, page: p } = formData.signature;

            const formatter = new Intl.DateTimeFormat(lang, {
                year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric',
                timeZoneName: 'short', timeZone: settings.timezone, hourCycle: 'h24',
            });
            const date = formatter.format(settings.signedAt).replaceAll(' ', ' ');
            const text = `Tento dokument byl podepsán pomocí SMS kódu ${date}.\nPodepisující: ${settings.signedBy.name}`;

            const page = pdfDoc.getPages()[p ?? 0];
            page.drawText(text, {
                x, y, maxWidth: mw, font: ubuntuFont, size: 10, lineHeight: 12, color: { type: ColorTypes.RGB, red: 0, green: .6, blue: 0 },
            });
            /*page.drawRectangle({
                x, y, width: mw, height: 12, color: { type: ColorTypes.Grayscale, gray: 0 },
            });
            page.drawRectangle({
                x, y: y - 12, width: mw, height: 12, color: { type: ColorTypes.Grayscale, gray: .4 },
            });
            page.drawRectangle({
                x, y: y - 24, width: mw, height: 12, color: { type: ColorTypes.Grayscale, gray: .8 },
            });*/
        }
    }

    if (pages) pdfDoc.getPageIndices().reverse().forEach(pageI => {
        if (!pages.includes(pageI))
            pdfDoc.removePage(pageI);
    });

    const pdfBytes = await pdfDoc.save(args.saveOptions);

    const surname = args.type == '' ? ''
        : irLabel(args.type == 'IR' ? (data as IR).IN : (data as NSP).NSP).split(' ')[0];
    const suffix = formData?.fileNameSuffix ?? (args.type == '' ? ''
        : args.type == 'IR' ? (data as IR).IN.ir.cislo : spName((data as NSP).NSP.zasah));
    const fileName = args.type == '' ? `${args.pdfName}.pdf` : `${args.pdfName}_${surname} ${suffix}.pdf`;

    return { fileName, pdfBytes };
};