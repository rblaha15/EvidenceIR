const languageCodes = ['cs', 'en', 'de', 'sk'] as const;
export default languageCodes;
export type LanguageCode = typeof languageCodes[number]