export const heatPumps = {
    airToWaterCTC: [[
        'EcoAir 614M',
        'EcoAir 622M',
        'EcoAir 712M',
        'EcoAir 720M',
    ], [
        'EcoAir 406',
        'EcoAir 408',
        'EcoAir 410',
        'EcoAir 415',
        'EcoAir 420',
        'EcoAir 510M',
        'EcoAir 520M',
        'EcoAir 105',
        'EcoAir 107',
        'EcoAir 110',
        'EcoAir 111',
        'EcoAir 115',
        'EcoAir 120',
        'EcoAir 125',
    ]],
    airToWaterRTC: [[
        'RTC',
        'RTC 6i',
        'RTC 12i',
        'RTC 13e',
        'RTC 20e',
        'RTC 15p',
        'RTC 25p',
        'RTC 40p',
    ], [
        'airTHERM 10',
        'prototype',
    ]],
    groundToWaterCTC: [[
        'EcoPart 612M',
        'EcoPart 616M',
        'EcoPart 406',
        'EcoPart 408',
        'EcoPart 410',
        'EcoPart 412',
        'EcoPart 414',
        'EcoPart 417',
        'EcoPart 435',
    ], [
        'EcoPart 10,5',
        'EcoPart 12',
    ]],
    multiEnergyCTC: [[
        'EcoHeat 406',
        'EcoHeat 408',
        'EcoHeat 410',
        'EcoHeat 412',
        'EcoHeat 306',
        'EcoHeat 308',
        'EcoHeat 310',
        'EcoHeat 312',
    ], [
        'EcoHeat 5',
        'EcoHeat 7,5',
        'EcoHeat 8,5',
        'EcoHeat 10,5',
        'EcoHeat 12',
    ]],
} as const;
export const indoorUnits = [
    'RegulusBOX',
    'RegulusHBOX 112',
    'RegulusHBOX 212',
    'RegulusHBOX K 106',
] as const;

const allPumps = [...heatPumps.airToWaterRTC.flat(), ...heatPumps.airToWaterCTC.flat(), ...heatPumps.groundToWaterCTC.flat(), ...heatPumps.multiEnergyCTC.flat()];
export type HeatPump = typeof allPumps[number]
export type IndoorUnit = typeof indoorUnits[number]