import type { Form, Raw } from '$lib/forms/Form';
import type { Pdf } from '$lib/client/pdf';
import NSP from '$lib/forms/NSP/infoNSP';
import IN from '$lib/forms/IN/infoIN';
import PO from '$lib/forms/PO/infoPO';
import RK from '$lib/forms/RK/infoRK.svelte';
import SP from '$lib/forms/SP/infoSP.svelte';
import type { FormInfo, IndependentFormInfo } from '$lib/forms/FormInfo';
import UPS from '$lib/forms/UPS/infoUPS';
import UPT from '$lib/forms/UPT/infoUPT';

const all = {
    SP, UPT, UPS, RK, PO, NSP, IN,
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
    R extends Raw<F> = Raw<F>,
>(name: N | string) => all[name as N] as unknown as {
    IR: P extends Pdf<'IR'> ? FormInfo<D, F, S, P, R> : never;
    '': IndependentFormInfo<D, F, S, P, R>;
}[All[N]['type']];
