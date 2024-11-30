import type { AddParsing } from '$lib/helpers/templates';
import type { PlainTranslations } from '$lib/translations';
import derived from '$lib/derived';

export default (tr: AddParsing<PlainTranslations>) =>
	<const>{
		heatPumpModel: cap(tr.heatPumpModelNr.parseTemplate([''])),
		heatPumpModel1: cap(tr.heatPumpModelNr.parseTemplate([tr.first + ' '])),
		heatPumpModel2: cap(tr.heatPumpModelNr.parseTemplate([tr.second + ' '])),
		heatPumpModel3: cap(tr.heatPumpModelNr.parseTemplate([tr.third + ' '])),
		heatPumpModel4: cap(tr.heatPumpModelNr.parseTemplate([tr.fourth + ' '])),
		heatPumpManufactureNumber: cap(tr.heatPumpManufactureNumberNr.parseTemplate([''])),
		heatPumpManufactureNumber1: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.first + ' '])),
		heatPumpManufactureNumber2: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.second + ' '])),
		heatPumpManufactureNumber3: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.third + ' '])),
		heatPumpManufactureNumber4: cap(tr.heatPumpManufactureNumberNr.parseTemplate([tr.fourth + ' ']))
	};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export type Derived = ReturnType<typeof derived>;