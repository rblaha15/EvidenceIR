import { get } from "svelte/store"
import { storable } from './helpers/stores'

export const languageCodes = ["cs", "en", "de", "sk" ] as const

export const isLanguageCode = (code: unknown): code is LanguageCode => (languageCodes as readonly unknown[]).includes(code)

export const asLanguageCodeOrNull = (code: unknown) =>
    isLanguageCode(code) ? code : null

export type LanguageCode = typeof languageCodes[number]

export const defaultLanguage: LanguageCode = "en"

const localLanguage: () => LanguageCode | undefined = () => navigator.languages.find(it => isLanguageCode(it))

const userPreferredLanguage = storable<LanguageCode>("user_preferred_language")

export const setUserPreferredLanguage = (code: LanguageCode) => userPreferredLanguage.set(code)
export const preferredLanguage: () => LanguageCode = () => get(userPreferredLanguage) ?? localLanguage() ?? defaultLanguage