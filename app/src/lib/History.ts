import { readonly } from 'svelte/store';
import { storable } from "./helpers/stores"
import { type RawData } from '$lib/Data';
import { popisIR, typIR } from '$lib/helpers/ir';
import { extractIRIDFromRawData, type IRID } from '$lib/client/firestore';

const _history = storable<HistoryEntry[]>("history3", [])

export const history = readonly(_history)

export type HistoryEntry = {
    irid: IRID,
    label: string,
    irType: string,
}
export const HistoryEntry = (evidence: RawData): HistoryEntry => ({
    irid: extractIRIDFromRawData(evidence),
    irType: typIR(evidence.ir.typ),
    label: popisIR(evidence)
})

export const addToHistory = (entry: HistoryEntry) => {
    _history.update(h => [...h, entry].distinctBy(it => it.irid, { reversed: true }))
}

export const removeFromHistory = (entry: HistoryEntry) => {
    _history.update(h => h.toSpliced(h.findIndex(a => a.irid == entry.irid), 1))
}

export const removeFromHistoryByIRID = (irid: IRID) => {
    _history.update(h => h.filter(a => a.irid == irid))
}