import type { FormPartDK } from '$lib/forms/DK/formDK';
import type { IR } from '$lib/data';
import type { Values } from '$lib/forms/Form';
import { isNewWarranties } from '$lib/helpers/prices';

export type ContextChangeDK = { DK: Values<FormPartDK<ContextChangeDK>>, IN: IR['IN'], mode: 'create' };

export const getDKInfo = (
    type: 'TČ' | 'SOL',
    ir: IR,
) => ({
    commissionDate: type == 'TČ' ? ir.UP.dateTC : ir.UP.dateSOL,
    settings: type == 'TČ' ? ir.RK.DK.TC : ir.RK.DK.SOL,
    show: ir.IN.ir.chceVyplnitK.includes(type === 'TČ' ? 'heatPump' : 'solarCollector')
        && !(type == 'TČ' && (!ir.UP.dateTC || isNewWarranties(ir.UP.dateTC))),
});