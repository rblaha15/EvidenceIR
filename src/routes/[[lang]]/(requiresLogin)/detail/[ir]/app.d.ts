import type { IRName } from "$lib/client/firestore";
import type { LanguageCode } from "$lib/languages";
import type { Translations } from "$lib/translations";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			languageCode: LanguageCode
			translations: Translations
			areTranslationsFromRoute: boolean
			ir: IRName
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };