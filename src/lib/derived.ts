import type { AddParsing } from '$lib/helpers/templates';
import type { PlainTranslations } from '$lib/translations';
import derived from '$lib/derived';

export default (tr: AddParsing<PlainTranslations>) => <const> {
    heatPumpModel: cap(tr.heatPumpModelNr([''])),
    heatPumpModel1: cap(tr.heatPumpModelNr([tr.first + ' '])),
    heatPumpModel2: cap(tr.heatPumpModelNr([tr.second + ' '])),
    heatPumpModel3: cap(tr.heatPumpModelNr([tr.third + ' '])),
    heatPumpModel4: cap(tr.heatPumpModelNr([tr.fourth + ' '])),
    heatPumpManufactureNumber: cap(tr.heatPumpManufactureNumberNr([''])),
    heatPumpManufactureNumber1: cap(tr.heatPumpManufactureNumberNr([tr.first + ' '])),
    heatPumpManufactureNumber2: cap(tr.heatPumpManufactureNumberNr([tr.second + ' '])),
    heatPumpManufactureNumber3: cap(tr.heatPumpManufactureNumberNr([tr.third + ' '])),
    heatPumpManufactureNumber4: cap(tr.heatPumpManufactureNumberNr([tr.fourth + ' '])),
    warranty: cap(tr.warrantyNr([''])),
    warranty1: cap(tr.warrantyNr(['1'])),
    warranty2: cap(tr.warrantyNr(['2'])),
    warranty3: cap(tr.warrantyNr(['3'])),
    warranty4: cap(tr.warrantyNr(['4'])),
    filledYearlyCheck: cap(tr.filledYearlyCheckNr([''])),
    filledYearlyCheck1: cap(tr.filledYearlyCheckNr(['1'])),
    filledYearlyCheck2: cap(tr.filledYearlyCheckNr(['2'])),
    filledYearlyCheck3: cap(tr.filledYearlyCheckNr(['3'])),
    filledYearlyCheck4: cap(tr.filledYearlyCheckNr(['4'])),
    doYearlyCheck: cap(tr.doYearlyCheckNr([''])),
    doYearlyCheck1: cap(tr.doYearlyCheckNr(['1'])),
    doYearlyCheck2: cap(tr.doYearlyCheckNr(['2'])),
    doYearlyCheck3: cap(tr.doYearlyCheckNr(['3'])),
    doYearlyCheck4: cap(tr.doYearlyCheckNr(['4'])),
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