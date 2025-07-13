import type { AddParsing } from '$lib/helpers/templates';
import type { PlainTranslations } from '$lib/translations';
import derived from '$lib/derived';
import { TCNumbers } from '$lib/forms/IN/defaultIN';

export default (tr: AddParsing<PlainTranslations>) => <const> {
    ...(['1', ...TCNumbers] as const)
        .zip(['first', null, 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'] as const)
        .flatMap(([n, name]) => ([
            [`heatPumpModel${n}`, cap(tr.heatPumpModelNr([name ? tr[name] + ' ' : '']))],
            [`heatPumpManufactureNumber${n}`, cap(tr.heatPumpManufactureNumberNr([name ? tr[name] + ' ' : '']))],
        ] as const))
        .toRecord(),
    demand: {
        fve: {
            slope1: tr.demand.fve.slope(['1']),
            slope2: tr.demand.fve.slope(['2']),
            slope3: tr.demand.fve.slope(['3']),
            slope4: tr.demand.fve.slope(['4']),
            orientation1: tr.demand.fve.orientation(['1']),
            orientation2: tr.demand.fve.orientation(['2']),
            orientation3: tr.demand.fve.orientation(['3']),
            orientation4: tr.demand.fve.orientation(['4']),
            size1: tr.demand.fve.size(['1']),
            size2: tr.demand.fve.size(['2']),
            size3: tr.demand.fve.size(['3']),
            size4: tr.demand.fve.size(['4']),
        },
    },
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export type Derived = ReturnType<typeof derived>;