import { error } from '@sveltejs/kit';
import { PDFDocument, PDFName, PDFRef, PDFSignature } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { getTranslations, type Translations } from '$lib/translations';
import type { LanguageCode } from '$lib/languages';
import { type Pdf, type PdfArgs, pdfInfo, toPdfTypeName } from '$lib/client/pdf';
import { evidence_sp2 } from '$lib/server/firestore';
import { type IR, type IRID, type SPID } from '$lib/client/firestore';
import check from '$lib/client/pdf/check';
import warranty from '$lib/client/pdf/warranty';
import rroute from '$lib/client/pdf/rroute';
import guide from '$lib/client/pdf/guide';
import heatPumpCommissionProtocol from '$lib/client/pdf/heatPumpCommissionProtocol';
import solarCollectorCommissionProtocol from '$lib/client/pdf/solarCollectorCommissionProtocol';
import installationProtocol, { pdfCP, publicInstallationProtocol } from '$lib/client/pdf/installationProtocol';
import { irLabel, isIRID, isSPID, spName } from '$lib/helpers/ir';
import type { DataSP2 } from '$lib/forms/SP2';
import type { Raw } from '$lib/forms/Form';

type Fetch = typeof fetch;

type SignatureDefinition = {
    x: number,
    y: number,
    page?: number,
    jpg: string | Uint8Array | ArrayBuffer,
    maxHeight?: number,
    maxWidth?: number,
};

export type PdfFieldType = 'Text' | 'Kombinované pole' | 'Zaškrtávací pole' | 'Podpis'

export type ID<T extends 'IR' | 'SP'> = T extends 'IR' ? IRID : SPID;
export type DataOfType<T extends 'IR' | 'SP'> = T extends 'IR' ? IR : Raw<DataSP2>;
export type GetPdfData<T extends 'IR' | 'SP' = 'IR'> = (
    data: DataOfType<T>,
    t: Translations,
    fetch: Fetch,
    addPage: <T extends 'IR' | 'SP'>(args: Pdf<T>, data: DataOfType<T>) => Promise<void>,
) => Promise<{
    [fieldName in `${PdfFieldType}${number}`]: (
    fieldName extends `Zaškrtávací pole${number}` ? boolean
        : fieldName extends `Podpis${number}` ? SignatureDefinition
            : string
    ) | null;
} & {
    fileNameSuffix?: string;
}>;
export const getPdfData = (
    link: Pdf,
): GetPdfData<'IR' | 'SP'> => {
    const t = toPdfTypeName(link);
    if (t == 'check') return check(Number(link.split('-')[1]) as 1 | 2 | 3 | 4);
    if (t == 'warranty') return warranty(Number(link.split('-')[1] || '1') - 1);
    if (t == 'rroute') return rroute;
    if (t == 'guide') return guide;
    if (t == 'heatPumpCommissionProtocol') return heatPumpCommissionProtocol;
    if (t == 'solarCollectorCommissionProtocol') return solarCollectorCommissionProtocol;
    if (t == 'installationProtocol') return installationProtocol(Number(link.split('-')[1]));
    if (t == 'publicInstallationProtocol') return publicInstallationProtocol;
    throw `Invalid link name: ${t}`;
};

const generatePdfData = async <T extends 'IR' | 'SP'>(
    args: PdfArgs<T>,
    lang: LanguageCode,
    fetch: Fetch,
    getData: GetPdfData<T>,
    data: DataOfType<T>,
) => {
    console.log('Generate', args)
    const formLanguage = args.supportedLanguages.includes(lang) ? lang : args.supportedLanguages[0];
    const t = getTranslations(formLanguage);

    const formLocation = `/pdf/${args.formName}_${formLanguage}.pdf`;
    const formPdfBytes = await (await fetch(formLocation)).arrayBuffer() ?? error(500, 'Nepovedlo se načíst PDF');

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.setTitle(t.get(args.title));

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const formData = await getData(data, t, fetch, async (pdfName2, data2) => {
        const pdfTypeName2 = toPdfTypeName(pdfName2);
        const pdfArgs2 = pdfInfo[pdfTypeName2];
        const getData2 = getPdfData(pdfName2);
        const pdfData2 = await generatePdfData(
            pdfArgs2, lang, fetch, getData2, data2,
        )
        const pdfDoc2 = await PDFDocument.load(pdfData2.pdfBytes)
        const [newPage] = await pdfDoc.copyPages(pdfDoc2, [0])
        pdfDoc.addPage(newPage)
    });

    const surname = irLabel(args.type == 'IR' ? (data as IR).evidence : data as Raw<DataSP2>).split(' ')[0];
    const suffix = formData.fileNameSuffix ?? (args.type == 'IR' ? (data as IR).evidence.ir.cislo : spName((data as Raw<DataSP2>).zasah));
    const fileName = `${args.fileName}_${surname} ${suffix}.pdf`;

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
    return {
        fileName,
        pdfBytes,
        title: t.get(args.title),
    };
};

export const generatePdf = async <T extends 'IR' | 'SP'>(lang: LanguageCode, irid_spid: ID<T>, fetch: Fetch, args: PdfArgs<T>, getData: GetPdfData<T>) => {
    let snapshot: DocumentSnapshot<DataOfType<T> | undefined>;
    try {
        snapshot = await evidence_sp2(irid_spid);

        if (!snapshot.exists && isSPID(irid_spid))
            snapshot = await evidence_sp2(irid_spid.split('-').slice(0, -1).join('-') as ID<T>);
    } catch (e) {
        console.log(`Nepovedlo se načíst data z firebase ${{ lang, irid_spid }}`);
        error(500, `Nepovedlo se načíst data z firebase ${lang}, ${irid_spid}, ${e}`);
    }

    if (!snapshot.exists) error(500, 'Nepovedlo se nalézt data ve firebase');

    const data = snapshot.data();

    if (!data) error(500, 'Nepovedlo se nalézt data ve firebase');

    const { title, fileName, pdfBytes } =
        await generatePdfData(args, lang, fetch, getData, data);

    const encodedName = encodeURIComponent(fileName);
    const encodedTitle = encodeURIComponent(title);

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=' + encodedName,
            'Title': encodedTitle,
        },
        status: 200,
    });
};