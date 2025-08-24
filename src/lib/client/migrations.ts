import type { IR } from '$lib/data';

export type LegacyIR = {};

type Migration = (legacyIR: LegacyIR & IR) => LegacyIR & IR;

export const modernizeIR = (legacyIR: LegacyIR & IR): IR =>
    // -------->>>>>>
    ([] as Migration[])
        .reduce((data, migration) => migration(data), legacyIR);
