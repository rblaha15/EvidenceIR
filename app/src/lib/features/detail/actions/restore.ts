import { call } from '$lib/client/db/endpoints';
import type { IRID } from '$lib/helpers/ir';

export const restoreIR = (irid: IRID) => () => call('db/admin/restore', { irid })