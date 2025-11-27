const products = {
    heatPumpsAirToWaterCTC: [
        'EcoAir 614M',
        'EcoAir 622M',
        'EcoAir 712M',
        'EcoAir 720M',

        'EcoAir 406',
        'EcoAir 408',
        'EcoAir 410',
        'EcoAir 415',
        'EcoAir 420',
        'EcoAir 105',
        'EcoAir 107',
        'EcoAir 110',
    ],
    heatPumpsRTC: [
        'RTC',
        'RTC 6i',
        'RTC 12i',
        'RTC 13e',
        'RTC 20e',
        'RTC 15p',
        'RTC 25p',
        'RTC 40p',
        'airTHERM 10',
    ],
    heatPumpsGroundToWater: [
        'EcoPart 612M',
        'EcoPart 616M',
        'EcoPart 406',
        'EcoPart 408',
        'EcoPart 410',
        'EcoPart 412',
        'EcoPart 414',
        'EcoPart 417',
        'EcoPart 435',
    ],
    heatPumpCentralls: [
        'EcoHeat 406',
        'EcoHeat 408',
        'EcoHeat 410',
        'EcoPart 412',
        'EcoHeat 306',
        'EcoHeat 308',
        'EcoHeat 310',
        'EcoHeat 312',
    ],
    indoorUnits: [
        'RegulusBOX',
        'RegulusHBOX 112',
        'RegulusHBOX 212',
        'RegulusHBOX K 106',
    ],
} as const

export default products;

type AllProducts = typeof products;
export type Products = {
    heatPumps: AllProducts['heatPumpsRTC'][number] | AllProducts['heatPumpsAirToWaterCTC'][number] | AllProducts['heatPumpsGroundToWater'][number]
    indoorUnits: AllProducts['indoorUnits'][number]
};