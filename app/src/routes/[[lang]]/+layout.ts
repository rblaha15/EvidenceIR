import { type Load } from "@sveltejs/kit";
import { asLanguageCodeOrNull, defaultLanguage } from "$lib/languages";
import { getTranslations } from "$lib/translations";

export const load: Load = ({ params }) => {
    const lang = asLanguageCodeOrNull(params.lang)
    return {
        translations: getTranslations(lang ?? defaultLanguage),
        areTranslationsFromRoute: lang != null,
        languageCode: lang ?? defaultLanguage,
    } as const
}

export const prerender = true