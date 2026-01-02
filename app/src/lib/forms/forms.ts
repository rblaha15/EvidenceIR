import type { Form, Raw } from '$lib/forms/Form';
import type { Pdf } from '$lib/pdf/pdf';
import NSP from '$lib/forms/NSP/infoNSP';
import IN from '$lib/forms/IN/infoIN';
import OD from '$lib/forms/OD/infoOD';
import RKT from '$lib/forms/RKT/infoRKT.svelte';
import RKS from '$lib/forms/RKS/infoRKS.svelte';
import SP from '$lib/forms/SP/infoSP.svelte';
import type { FormInfo, IndependentFormInfo } from '$lib/forms/FormInfo';
import UPS from '$lib/forms/UPS/infoUPS';
import UPT from '$lib/forms/UPT/infoUPT';
import UPF from '$lib/forms/UPF/infoUPF';
import NK from '$lib/forms/NK/infoNK';
import FT from '$lib/forms/FT/infoFT';

const all = {
    SP, UPT, UPS, RKT, RKS, OD, NSP, IN, NK, UPF, FT,
};
type All = typeof all;

export const forms = all.keys();
export type FormName = keyof All;

export const getForm = <
    N extends FormName,
    D,
    F extends Form<D>,
    S extends unknown[][] = [],
    P extends Pdf = Pdf,
    O extends Record<string, unknown> = Record<never, unknown>,
>(name: N | string) => all[name as N] as unknown as {
    IR: P extends Pdf<'IR'> ? FormInfo<D, F, S, P, O> : never;
    '': IndependentFormInfo<D, F, S, P, O>;
}[All[N]['type']];
