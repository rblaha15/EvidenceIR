import { type Load, redirect } from "@sveltejs/kit";
import { asLanguageCodeOrNull, defaultLanguage } from "$lib/languages";
import { getTranslations } from "$lib/translations";
import { onMount } from "svelte";
import type { PageData } from "./$types";

export const load: Load = ({ params }): App.PageData => {
    const lang = asLanguageCodeOrNull(params.lang)

    console.log(lang)
    // console.log(getTranslations(lang ?? defaultLanguage))
    return {
        translations: getTranslations(lang ?? defaultLanguage),
        areTranslationsFromRoute: lang != null,
        languageCode: lang ?? defaultLanguage,
    }
}