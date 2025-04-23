import type { AddParsing } from '$lib/helpers/templates';
import type { PlainTranslations } from '$lib/translations';
import derived from '$lib/derived';

export default (tr: AddParsing<PlainTranslations>) => <const> {
    heatPumpModel: cap(tr.heatPumpModelNr.parseTemplate([''])),
    heatPumpModel1: cap(tr.heatPumpModelNr.parseTemplate([tr.first + ' '])),
    heatPumpModel2: cap(tr.heatPumpModelNr.parseTemplate([tr.second + ' '])),
    heatPumpModel3: cap(tr.heatPumpModelNr.parseTemplate([tr.third + ' '])),
    heatPumpModel4: cap(tr.heatPumpModelNr.parseTemplate([tr.fourth + ' '])),
    heatPumpManufactureNumber: cap(tr.heatPumpManufactureNumberNr.parseTemplate([''])),
    heatPumpManufactureNumber1: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.first + ' '])),
    heatPumpManufactureNumber2: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.second + ' '])),
    heatPumpManufactureNumber3: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.third + ' '])),
    heatPumpManufactureNumber4: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.fourth + ' '])),
    warranty: cap(tr.warrantyNr.parseTemplate([''])),
    warranty1: cap(tr.warrantyNr.parseTemplate(['1'])),
    warranty2: cap(tr.warrantyNr.parseTemplate(['2'])),
    warranty3: cap(tr.warrantyNr.parseTemplate(['3'])),
    warranty4: cap(tr.warrantyNr.parseTemplate(['4'])),
    demand: {
        fve: {
            slope1: tr.demand.fve.slope.parseTemplate(['1']),
            slope2: tr.demand.fve.slope.parseTemplate(['2']),
            slope3: tr.demand.fve.slope.parseTemplate(['3']),
            slope4: tr.demand.fve.slope.parseTemplate(['4']),
            orientation1: tr.demand.fve.orientation.parseTemplate(['1']),
            orientation2: tr.demand.fve.orientation.parseTemplate(['2']),
            orientation3: tr.demand.fve.orientation.parseTemplate(['3']),
            orientation4: tr.demand.fve.orientation.parseTemplate(['4']),
            size1: tr.demand.fve.size.parseTemplate(['1']),
            size2: tr.demand.fve.size.parseTemplate(['2']),
            size3: tr.demand.fve.size.parseTemplate(['3']),
            size4: tr.demand.fve.size.parseTemplate(['4']),
        },
    },
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export type Derived = ReturnType<typeof derived>;