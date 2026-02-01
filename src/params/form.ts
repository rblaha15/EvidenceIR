import type { ParamMatcher } from '@sveltejs/kit';
import { forms } from '$lib/forms/forms';

export const match = (
    (param: string) => (forms as string[]).includes(param)
) satisfies ParamMatcher;