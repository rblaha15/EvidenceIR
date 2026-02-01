import type { ParamMatcher } from '@sveltejs/kit';
import { isLanguageCode } from '$lib/languages';

export const match = isLanguageCode satisfies ParamMatcher;