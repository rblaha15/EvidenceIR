import type { IRID } from '$lib/helpers/ir';
import { adminDatabase } from '$lib/client/firestore';

export const restoreIR = (irid: IRID) => () => adminDatabase.restoreIR(irid);