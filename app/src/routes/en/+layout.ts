import { type Load } from "@sveltejs/kit";
import { asLanguageCodeOrNull, defaultLanguage } from "$lib/languages";
import { getTranslations } from "$lib/translations";

export const load: Load = ({ params }): App.PageData => {
    const lang = "en"//asLanguageCodeOrNull(params.lang)

    console.log(lang)
    // console.log(getTranslations(lang ?? defaultLanguage))
    return {
        translations: getTranslations(lang ?? defaultLanguage),
        areTranslationsFromRoute: lang != null,
        languageCode: lang ?? defaultLanguage,
    }
}

export const prerender = false
export const ssr = false