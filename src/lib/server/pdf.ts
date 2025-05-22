import { error } from '@sveltejs/kit';
import { PDFDocument, PDFSignature, PDFStreamWriter, PDFWriter } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { getTranslations, type Translations } from '$lib/translations';
import type { LanguageCode } from '$lib/languages';
import { type Pdf, type PdfArgs, toPdfTypeName } from '$lib/client/pdf';
import { evidence_sp2 } from '$lib/server/firestore';
import { type IR, type IRID, type SPID } from '$lib/client/firestore';
import check from '$lib/client/pdf/check';
import warranty from '$lib/client/pdf/warranty';
import rroute from '$lib/client/pdf/rroute';
import guide from '$lib/client/pdf/guide';
import heatPumpCommissionProtocol from '$lib/client/pdf/heatPumpCommissionProtocol';
import solarCollectorCommissionProtocol from '$lib/client/pdf/solarCollectorCommissionProtocol';
import installationProtocol, { publicInstallationProtocol } from '$lib/client/pdf/installationProtocol';
import { irName, isIRID } from '$lib/helpers/ir';
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
export type DataOfID<ID extends IRID | SPID> = ID extends IRID ? IR : Raw<DataSP2>;
export type GetPdfData<ID extends IRID | SPID = IRID> = (data: DataOfID<ID>, t: Translations, fetch: Fetch) => Promise<{
    [fieldName in `${PdfFieldType}${number}`]: (
    fieldName extends `Zaškrtávací pole${number}` ? boolean
        : fieldName extends `Podpis${number}` ? SignatureDefinition
            : string
    ) | null;
} & {
    fileName: string;
    doNotPrefixFileNameWithIR?: boolean;
}>;
export const getPdfData = (
    link: Pdf
) => {
    const t = toPdfTypeName(link);
    if (t == 'check') return check;
    if (t == 'warranty') return warranty(Number(link.split('-')[1] || '1') - 1);
    if (t == 'rroute') return rroute;
    if (t == 'guide') return guide;
    if (t == 'heatPumpCommissionProtocol') return heatPumpCommissionProtocol;
    if (t == 'solarCollectorCommissionProtocol') return solarCollectorCommissionProtocol;
    if (t == 'installationProtocol') return installationProtocol(Number(link.split('-')[1]));
    if (t == 'publicInstallationProtocol') return publicInstallationProtocol;
    throw `Invalid link name: ${t}`;
};

export const generatePdf = async <ID extends IRID | SPID>(lang: LanguageCode, irid_spid: ID, fetch: Fetch, args: PdfArgs, getData: GetPdfData<ID>) => {
    let snapshot: DocumentSnapshot<DataOfID<ID> | undefined>;
    try {
        snapshot = await evidence_sp2(irid_spid);
    } catch (e) {
        console.log(`Nepovedlo se načíst data z firebase ${{ lang, irid_spid }}`);
        error(500, `Nepovedlo se načíst data z firebase ${lang}, ${irid_spid}, ${e}`);
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

    const form = pdfDoc.getForm();

    const formData = await getData(data, t, fetch);

    const prefixFileNameWithIR = !(formData.doNotPrefixFileNameWithIR ?? false);
    const prefix = prefixFileNameWithIR && isIRID(irid_spid) ? irName((data as IR).evidence.ir) + ' ' : '';
    const fileName = prefix + formData.fileName;

    for (const fieldName in formData.omit('fileName', 'doNotPrefixFileNameWithIR')) {
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
                height: scaled.height
            });
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
    const fields = form.getFields()
    fields.forEach(field => {
        if (field instanceof PDFSignature) {
            field.acroField.getWidgets().forEach((_, i) => {
                field.acroField.removeWidget(i)
            })
        }
    })
    form.flatten()

    await pdfDoc.save();

    const {
        useObjectStreams = true,
        addDefaultPage = true,
        objectsPerTick = 50
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
            'Title': encodedTitle
        },
        status: 200
    });
};