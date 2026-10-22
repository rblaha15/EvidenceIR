import arrays, { type HeatPump } from '$lib/client/db/arrays';

export const getPumpOptions = (
    category: 'CTC' | 'RTC' | 'ThermonaRTC' | 'EcoHeatCTC', type: 'airToWater' | 'groundToWater', hidden: boolean,
): string[] => {
    const categoriesToSearch = category == 'RTC' ? ['RTC', 'ThermonaRTC'] : [category]
    return arrays.heatPumpsValue.filter(tc =>
        categoriesToSearch.includes(tc.category) && tc.type == type && tc.hide == hidden,
    ).map(tc => tc.model);
}

export const getPumpNumberFormat = (model: HeatPump) => arrays.heatPumpsValue.find(tc => tc.model == model)!.numberFormat;

export const getPumpNumberMask = (model: HeatPump | null) => {
    if (!model) return undefined;
    const format = getPumpNumberFormat(model);
    return format == '*' ? undefined : format;
};

export const getPumpNumberFormatRegex = (model: HeatPump | null) => {
    if (!model) return /.*/;
    const format = getPumpNumberFormat(model);
    if (format == '*') return /.*/;
    const mapping: Record<string, RegExp> = {
        'A': /[A-Z]/,
        '0': /\d/,
        'T': /T/,
        '-': /-/,
    };
    const mainRegex = format.split('').map(char => mapping[char]?.source ?? '').join('');
    return new RegExp(`^${mainRegex}$`);
};

export const indoorUnits = [
    'RegulusBOX',
    'RegulusHBOX 112',
    'RegulusHBOX 212',
    'RegulusHBOX K 106',
] as const;
export type IndoorUnit = typeof indoorUnits[number]
