import { type Form, type Raw } from '$lib/forms/Form';
import type { Row } from 'read-excel-file';

type CellAddress = [x: number, y: number];
type GetCellValue = (address: CellAddress) => string;

type ExcelDataTransformation<U> = { getData: (getCell: GetCellValue) => U };
type ExcelSimpleTransformation<U> = string extends U
    ? { address: CellAddress, transform?: (rawValue: string) => U }
    : { address: CellAddress, transform: (rawValue: string) => U };
type ExcelConstant<U> = { constant: U };

export type SimpleImport<U> = ExcelConstant<U> | ExcelSimpleTransformation<U> | ExcelDataTransformation<U>

export type ExcelImport<R extends Raw<Form>> = {
    cells: {
        [K1 in keyof R]?: {
            [K2 in keyof R[K1]]?: SimpleImport<R[K1][K2]>
        }
    },
    defaultData: () => R,
    sheet: string,
    sheetFilter?: (sheetName: string) => boolean,
}

const parseSimpleImport = <U>(i: SimpleImport<U>): ExcelDataTransformation<U> => {
    if ('getData' in i) return i
    if ('constant' in i) return { getData: () => i.constant }
    if ('transform' in i && i.transform) return { getData: get => i.transform!(String(get(i.address))) }
    return { getData: get => String(get(i.address)) as U }
}

export const processExcel = <R extends Raw<Form>>(info: ExcelImport<R>, rows: Row[]): R => {
    const data = info.defaultData()
    info.cells.forEachEntry((k1, section) => {
        section?.forEachEntry((k2, i) => {
            if (i) data[k1][k2] = parseSimpleImport(i).getData(([x, y]) => rows[y - 1][x - 1] as string | null  ?? '')
        })
    })
    return data
}