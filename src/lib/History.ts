import { readonly } from "svelte/store"
import { storable } from "./helpers/stores"
import { typIR, type RawData, popisIR } from '$lib/Data';
import type { Translations } from '$lib/translations';

const _history = storable<HistoryEntry[]>("history2", [])

export const history = readonly(_history)

export type HistoryEntry = {
    ir: string,
    label: string,
    irType: string,
}
export const HistoryEntry = (evidence: RawData): HistoryEntry => ({
    ir: evidence.ir.cislo,
    irType: typIR(evidence.ir.typ),
    label: popisIR(evidence)
})

export const addToHistory = (entry: HistoryEntry) => {
    _history.update(h => [...new Set([entry, ...h.toReversed()].map(a => JSON.stringify(a)))].toReversed().map(a => JSON.parse(a)))
}

export const removeFromHistory = (entry: HistoryEntry) => {
    _history.update(h => h.toSpliced(h.findIndex(a => a.ir == entry.ir), 1))
}

export const removeFromHistoryByIR = (ir: string) => {
    _history.update(h => h.toSpliced(h.findIndex(a => a.ir == ir), 1))
}