import { type Load } from '@sveltejs/kit';
import { asLanguageCodeOrNull, defaultLanguage, preferredLanguage } from '$lib/languages';
import { getTranslations } from '$lib/translations';
import { browser } from '$app/environment';

export const load: Load = ({ params, url }) => {
    const lang = asLanguageCodeOrNull(params.lang ?? url.pathname.split('/')[1]);
    const newLang = lang ?? (browser ? preferredLanguage() : defaultLanguage);
    return {
        translations: getTranslations(newLang),
        isLanguageFromUrl: lang != null,
        languageCode: newLang,
    } as const;
};

export const prerender = true;