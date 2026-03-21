import type { FormPartDK } from '$lib/forms/DK/formDK';
import type { IR } from '$lib/data';
import type { Values } from '$lib/forms/Form';

export type ContextChangeDK = { DK: Values<FormPartDK<ContextChangeDK>>, IN: IR['IN'], mode: 'create' };

export const getDKInfo = (
    type: 'TČ' | 'SOL',
    ir: IR,
) => ({
    commissionDate: type == 'TČ' ? ir.UP.dateTC : ir.UP.dateSOL,
    settings: type == 'TČ' ? ir.RK.DK.TC : ir.RK.DK.SOL,
    show: ir.IN.ir.chceVyplnitK.includes(type === 'TČ' ? 'heatPump' : 'solarCollector'),
})