import type { ExistingIR } from '$lib/data';
import { supportsRemoteAccess } from '$lib/helpers/ir';
import { hasRKTL } from '$lib/forms/RKT/infoRKT';
import type { PumpInfo } from '$lib/forms/IN/infoIN';

type Rule = (ir: ExistingIR) => boolean;
type RuleT = (ir: ExistingIR, tc: PumpInfo) => boolean;

export const showRR: Rule = ir => ir.IN.vzdalenyPristup.chce;

export const showNNR: Rule = ir => supportsRemoteAccess(ir.IN.ir.typ.first);

export const showNNT: Rule = ir => ir.IN.ir.typ.second === 'TRS6 K';

export const showTC: Rule = ir =>
    ir.IN.ir.chceVyplnitK.includes('heatPump') && ir.IN.tc.model !== 'airTHERM 10';

export const disableUPT: Rule = ir => !ir.UP.TC?.uvadeni?.typZaruky

export const useRKTL: RuleT = (ir, tc) => hasRKTL(ir.RK.TC[tc.N]);
export const isImportantRKT: Rule = ir => ir.RK.DK.TC?.state == 'sentRequest';
export const disableRKT: RuleT = (ir, tc) => !ir.RK.TC[tc.N]?.keys()?.length;
export const showRefsiteDialog: Rule = ir => !ir.meta.flags?.confirmedRefsite;

export const showSOL: Rule = ir =>
    ir.IN.ir.chceVyplnitK.includes('solarCollector');

export const disableUPS: Rule = ir => !ir.UP.SOL

export const disableRKS: Rule = ir => !ir.RK.SOL?.keys()?.length
export const isImportantRKS: Rule = ir => ir.RK.DK.SOL?.state === 'sentRequest';

export const showFVE: Rule = ir =>
    ir.IN.ir.chceVyplnitK.includes('photovoltaicPowerPlant');

export const disableUPF: Rule = ir => !ir.UP.FVE;

export const showFT: Rule = ir => ir.IN.ir.typ.first === 'IR 14';
export const disableFT: Rule = ir => !ir.FT;
