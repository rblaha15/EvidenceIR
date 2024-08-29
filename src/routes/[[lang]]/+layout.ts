import { redirect, type Load } from "@sveltejs/kit";
import { asLanguageCodeOrNull, defaultLanguage } from "$lib/languages";
import { getTranslations } from "$lib/translations";

export const load: Load = ({ params, url }): App.PageData => {
    const lang = asLanguageCodeOrNull(params.lang)
    return {
        translations: getTranslations(lang ?? defaultLanguage),
        areTranslationsFromRoute: lang != null,
        languageCode: lang ?? defaultLanguage,
    }
}

export const prerender = true