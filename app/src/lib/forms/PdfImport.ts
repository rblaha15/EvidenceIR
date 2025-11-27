import { type Form, type Raw } from '$lib/forms/Form';
import { PDFForm } from 'pdf-lib';

type PdfFieldType = 'text' | 'dropdown' | 'checkbox'
type PdfFieldValue<T extends PdfFieldType> = {
    text: string,
    dropdown: string,
    checkbox: boolean,
}[T];
type GetFieldValue = <T extends PdfFieldType>(type: T, name: string) => PdfFieldValue<T>;

type PdfDataTransformation<U> = { getData: (getValue: GetFieldValue) => U };
type PdfSimpleTransformation<U> = {
    [T in PdfFieldType]: PdfFieldValue<T> extends U
        ? { type: T, name: string, transform?: (rawValue: PdfFieldValue<T>) => U }
        : { type: T, name: string, transform: (rawValue: PdfFieldValue<T>) => U }
}[PdfFieldType]
type PdfConstant<U> = { constant: U };

export type SimplePdfImport<U> = PdfConstant<U> | PdfSimpleTransformation<U> | PdfDataTransformation<U>

export type PdfImport<R extends Raw<Form>> = {
    fields: {
        [K1 in keyof R]?: {
            [K2 in keyof R[K1]]?: SimplePdfImport<R[K1][K2]>
        }
    },
    defaultData: () => R,
}

const parseSimpleImport = <U>(i: SimplePdfImport<U>): PdfDataTransformation<U> => {
    if ('getData' in i) return i;
    if ('constant' in i) return { getData: () => i.constant };
    if ('transform' in i && i.transform) return { getData: get => i.transform!(get(i.type, i.name) as never) };
    return { getData: get => get(i.type, i.name) as U };
};

const get = (pdfForm: PDFForm) =>
    <T extends PdfFieldType>(type: T, name: string) => {
        if (type == 'text') return (pdfForm.getTextField(name).getText() || '') as PdfFieldValue<T>;
        if (type == 'dropdown') return pdfForm.getDropdown(name).getSelected()[0]! as PdfFieldValue<T>;
        if (type == 'checkbox') return pdfForm.getCheckBox(name).isChecked() as PdfFieldValue<T>;
        throw new Error('Unknown field type');
    };

export const processPdf = <R extends Raw<Form>>(info: PdfImport<R>, pdfForm: PDFForm): R => {
    const getValue = get(pdfForm);
    const data = info.defaultData();
    info.fields.forEachEntry((k1, section) => {
        section?.forEachEntry((k2, i) => {
            if (i && data[k1])
                data[k1][k2] = parseSimpleImport(i).getData(getValue);
        });
    });
    return data;
};