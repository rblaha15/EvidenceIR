import { getSessionData } from '$lib/client/auth';
import { localeDefaultLanguageCode } from '$lib/helpers/globals';
import { lazyReadonly, lazyStorable } from '$lib/helpers/newStores';
import languageCodes, { type LanguageCode } from '$lib/languageCodes';

export const isLanguageCode = (code: unknown): code is LanguageCode => (languageCodes as readonly unknown[]).includes(code);

export const asLanguageCodeOrNull = (code: unknown) =>
    isLanguageCode(code) ? code : null;

const localLanguage: () => LanguageCode | undefined = () => navigator.languages.find(it => isLanguageCode(it));

const userPreferredLanguage = lazyStorable<LanguageCode>('user_preferred_language');
const userPreferredDocumentLanguage = lazyStorable<LanguageCode>('user_preferred_document_language');

export const setUserPreferredLanguage = (code: LanguageCode) => userPreferredLanguage.current = code;
export const setUserPreferredDocumentLanguage = (code: LanguageCode) => userPreferredDocumentLanguage.current = code;
export const preferredLanguage = async (): Promise<LanguageCode> => {
    // Wait for auth to load in, so we extract the language data from the correct store for the correct user
    await getSessionData();
    return userPreferredLanguage.current ?? localLanguage() ?? localeDefaultLanguageCode;
};

export const preferredDocumentLanguage = lazyReadonly(userPreferredDocumentLanguage);