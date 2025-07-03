import { p } from '$lib/translations';

const products = {
    heatPumpsAirToWaterCTC: p([
        'EcoAir 614M',
        'EcoAir 622M',
        'EcoAir 406',
        'EcoAir 408',
        'EcoAir 410',
        'EcoAir 415',
        'EcoAir 420',
    ]),
    heatPumpsRTC: p([
        'RTC',
        'RTC 6i',
        'RTC 13e',
        'RTC 20e',
    ]),
    heatPumpsGroundToWater: p([
        'EcoPart 612M',
        'EcoPart 616M',
        'EcoPart 406',
        'EcoPart 408',
        'EcoPart 410',
        'EcoPart 412',
        'EcoPart 414',
        'EcoPart 417',
        'EcoPart 435',
    ]),
    indoorUnits: p([
        'RegulusBOX',
        'RegulusHBOX 112',
        'RegulusHBOX 212',
        'RegulusHBOX K 106',
    ]),
    thermalStores: {
        [p('DUO')]: p([
            '-',
            'P',
            'PR',
            'K',
            'K P',
            'K PR',
        ]),
        [p('HSK')]: p([
            'P',
            'P+',
            'PR',
            'PR+',
            'PV',
            'PB',
            'TV',
        ]),
        [p('PS')]: p([
            'E+',
            'ES+',
            'N+',
            'N25',
            'K+',
            '2F',
            'WF',
        ]),
    },
    waterTanks: p([
        'NBC',
        'RGC',
        'RDC',
        'R2DC',
        'R0BC',
        'RBC',
        'RBC HP',
        'R2BC',
    ]),
}

export default products;

type AllProducts = typeof products;
export type Products = {
    heatPumps: AllProducts['heatPumpsRTC'][number] | AllProducts['heatPumpsAirToWaterCTC'][number] | AllProducts['heatPumpsGroundToWater'][number]
    indoorUnits: AllProducts['indoorUnits'][number]
    thermalStores1: keyof AllProducts['thermalStores']
    thermalStores2: AllProducts['thermalStores'][Products['thermalStores1']][number]
    waterTanks: AllProducts['waterTanks'][number]
};