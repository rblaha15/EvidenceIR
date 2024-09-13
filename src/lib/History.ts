import { get, readonly } from "svelte/store"
import { storable } from "./helpers/stores"

const _history = storable<string[]>([], "history")

export const history = readonly(_history)

export const addToHistory = (ir: string) => {
    _history.update(h => [...new Set([ir, ...h.toReversed()])].toReversed())
}

export const removeFromHistory = (ir: string) => {
    _history.update(h => h.toSpliced(h.indexOf(ir)))
}