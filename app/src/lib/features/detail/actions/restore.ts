import { fetchDB } from '$lib/client/db/endpoints';
import type { IRID } from '$lib/helpers/ir';

export const restoreIR = (irid: IRID) => () => fetchDB('admin/restore', { irid })