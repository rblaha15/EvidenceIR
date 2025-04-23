import { p } from "$lib/Widget.svelte";

const products = {
    heatPumpsAirToWaterCTC: [
        p`EcoAir 614M`,
        p`EcoAir 622M`,
        p`EcoAir 406`,
        p`EcoAir 408`,
        p`EcoAir 410`,
        p`EcoAir 415`,
        p`EcoAir 420`,
    ],
    heatPumpsRTC: [
        p`RTC`,
        p`RTC 6i`,
        p`RTC 13e`,
        p`RTC 20e`,
    ],
    heatPumpsGroundToWater: [
        p`EcoPart 612M`,
        p`EcoPart 616M`,
        p`EcoPart 406`,
        p`EcoPart 408`,
        p`EcoPart 410`,
        p`EcoPart 412`,
        p`EcoPart 414`,
        p`EcoPart 417`,
        p`EcoPart 435`,
    ],
    indoorUnits: [
        p`RegulusBOX`,
        p`RegulusHBOX 112`,
        p`RegulusHBOX 212`,
        p`RegulusHBOX K 106`,
    ],
    thermalStores: {
        [p`DUO`]: [
            p`-`,
            p`P`,
            p`PR`,
            p`K`,
            p`K P`,
            p`K PR`,
        ],
        [p`HSK`]: [
            p`P`,
            p`P+`,
            p`PR`,
            p`PR+`,
            p`PV`,
            p`PB`,
            p`TV`,
        ],
        [p`PS`]: [
            p`E+`,
            p`ES+`,
            p`N+`,
            p`N25`,
            p`K+`,
            p`2F`,
            p`WF`,
        ],
    } as Record<`PLAIN_${string}`, `PLAIN_${string}`[]>,
    waterTanks: [
        p`NBC`,
        p`RGC`,
        p`RDC`,
        p`R2DC`,
        p`R0BC`,
        p`RBC`,
        p`RBC HP`,
        p`R2BC`,
    ],
}

export default products;