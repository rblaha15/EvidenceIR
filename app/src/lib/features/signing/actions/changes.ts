import {
    type DataType,
    type ExistingData,
    type SignatureState
} from '$lib/data';
import type { DocumentDefinition } from '$lib/features/signing/domain/sms';
import {
    type DataOfPdf,
    type GeneratePdfOptions,
    type Pdf,
    type PdfDefiningParameter,
    pdfInfo,
    type PdfParameters,
    type PdfToSign,
    type PdfWithDefiningParameter,
    pdfWithDefiningParameter
} from '$lib/pdf/pdf';
import { getTranslations } from '$lib/translations';

const mockPdfGeneration = async <P extends Pdf>(o: GeneratePdfOptions<P>) => {
    const { lang, data, fetch = window.fetch } = o;
    const args = pdfInfo[o.link];
    const formLanguage = args.supportedLanguages.includes(lang) ? lang : args.supportedLanguages[0];
    const t = getTranslations(formLanguage);

    const addDoc = async <P extends Pdf>(o: GeneratePdfOptions<P>) => {
        await mockPdfGeneration({ fetch, ...o });
    };

    const formData = await args.getPdfData?.({ ...o, t, addDoc, data, lang, fetch }) ?? {};

    const fieldDefinitions = formData.omit('images', 'fileNameSuffix', 'signature');

    return fieldDefinitions.mapValues(
        (_, v) => v && typeof v == 'object' && 'type' in v ? v.value : v,
    );
};

const checkForOneDocument = async <T extends DataType, P extends PdfToSign<T>>(
    def: DocumentDefinition<T>,
    oldData: ExistingData<T>,
    newData: ExistingData<T>,
    fetch: typeof window.fetch,
) => {
    const parameters = def.pdf in pdfWithDefiningParameter
        ? { [pdfWithDefiningParameter[def.pdf as PdfWithDefiningParameter]]: def.parameter }
        : {};

    const oldPdfData = await mockPdfGeneration({
        lang: 'cs', link: def.pdf, data: oldData as DataOfPdf<Pdf>, ...(parameters as PdfParameters<P>), fetch,
    });
    const newPdfData = await mockPdfGeneration({
        lang: 'cs', link: def.pdf, data: newData as DataOfPdf<Pdf>, ...(parameters as PdfParameters<P>), fetch,
    });

    for (const key in newPdfData) {
        const k = key as keyof typeof oldPdfData & keyof typeof newPdfData;
        if (!(key in oldPdfData)) return true;
        if (oldPdfData[k] != newPdfData[k]) return true;
        delete oldPdfData[k];
    }
    return !!oldPdfData.keys().length;
};

export const checkForDocumentChanges = async <T extends DataType>(
    data: ExistingData<T>, change: (current: ExistingData<T>) => ExistingData<T>,
    fetch: typeof window.fetch = window.fetch,
) => {
    const newData = change(data);
    const id = data.meta.id;

    const allSignatures: DocumentDefinition<T>[] = data.signatures?.mapTo((pdf, value) =>
        !value ? [] : 'state' in value ? [{ pdf, parameter: undefined, id }]
            : (value as Record<PdfDefiningParameter, SignatureState>)
                .mapTo(parameter => ({ pdf, parameter, id })),
    )?.flat() ?? [];

    return (await allSignatures.map(async def =>
        checkForOneDocument(def, data, newData, fetch)
            .then(changed => changed ? def : null),
    ).awaitAll()).filter((v): v is DocumentDefinition<T> => !!v);
};

export const removeSignaturesFromData = async <T extends DataType>(
    oldData: ExistingData<T>, newData: ExistingData<T>,
    fetch: typeof window.fetch = window.fetch,
) => {
    const pdfs = await checkForDocumentChanges(oldData, () => newData, fetch);
    for (const { pdf, parameter } of pdfs) if (parameter) {
        const signatures = newData.signatures! as Record<PdfWithDefiningParameter, Record<string | number, SignatureState>>;
        (signatures[pdf as PdfWithDefiningParameter]![parameter]! as SignatureState).state = 'removed';
    } else {
        const signatures = newData.signatures! as Record<PdfToSign, SignatureState>;
        (signatures[pdf as PdfToSign] as SignatureState).state = 'removed';
    }
    return newData;
};