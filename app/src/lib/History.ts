import { get, readonly } from "svelte/store"
import { storable } from "./helpers/stores"

const _history = storable<HistoryEntry[]>("history2", [])

export const history = readonly(_history)

export type HistoryEntry = {
    ir: string,
    label: string,
    irType: string,
}

export const addToHistory = (entry: HistoryEntry) => {
    _history.update(h => [...new Set([entry, ...h.toReversed()].map(a => JSON.stringify(a)))].toReversed().map(a => JSON.parse(a)))
}

export const removeFromHistory = (entry: HistoryEntry) => {
    _history.update(h => h.toSpliced(h.map(a => JSON.stringify(a)).indexOf(JSON.stringify(entry)), 1))
}