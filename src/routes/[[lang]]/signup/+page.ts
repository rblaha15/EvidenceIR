import { languageCodes } from "$lib/languages";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => [
    ...languageCodes.map((code) => ({ lang: code })),
    { lang: '' }
];