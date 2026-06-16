import type { IRID } from '$lib/helpers/ir';
import { restore } from "$lib/client/db/mongo";

export const restoreIR = (irid: IRID) => () => restore(irid)