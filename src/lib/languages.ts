import { get } from "svelte/store"
import { storableOrUndefined } from './helpers/stores'

export const languageCodes = ["cs", "en", "de"/* , "sk" */] as const

export const isLanguageCode = (code: any): code is LanguageCode => languageCodes.includes(code)

export const asLanguageCodeOrNull = (code: any): LanguageCode | null =>
    isLanguageCode(code) ? code : null

export type LanguageCode = typeof languageCodes[number]

export const defaultLanguage: LanguageCode = "en"

const localLanguage: () => LanguageCode | undefined = () => navigator.languages.find(it => isLanguageCode(it))

const userPreferedLanguage = storableOrUndefined<LanguageCode>("user_prefered_language")

export const setUserPreferedLanguage = (code: LanguageCode) => userPreferedLanguage.set(code)
export const preferedLanguage: () => LanguageCode = () => get(userPreferedLanguage) ?? localLanguage() ?? defaultLanguage