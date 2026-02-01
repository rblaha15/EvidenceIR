import type { ParamMatcher } from '@sveltejs/kit';
import { pdfInfo } from '$lib/pdf/pdf';

export const match = (
    (param: string) => param in pdfInfo
) satisfies ParamMatcher;