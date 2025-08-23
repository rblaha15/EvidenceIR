import { type Load } from '@sveltejs/kit';
import { asLanguageCodeOrNull, preferredLanguage } from '$lib/languages';
import { getTranslations } from '$lib/translations';

export const load: Load = ({ params, url }) => {
    const lang = asLanguageCodeOrNull(params.lang ?? url.pathname.split('/')[1]);
    return {
        translations: getTranslations(lang ?? preferredLanguage()),
        isLanguageFromUrl: lang != null,
        languageCode: lang ?? preferredLanguage(),
    } as const;
};

export const prerender = true;