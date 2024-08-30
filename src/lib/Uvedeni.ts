import type { RawData } from "./Data";
import { Nadpisova, p, Pisatkova, Prepinatkova, Vec, Vybiratkova, type GetOrVal, type Raw } from "./Vec";

export type UD = {
    uvedeni: Uvedeni,
    evidence: RawData,
}

export class Vyhovuje extends Prepinatkova<UD> {
    constructor(args: {
        nazev: GetOrVal<UD>,
        onError?: GetOrVal<UD>,
        nutne?: GetOrVal<UD, boolean>,
        zobrazit?: GetOrVal<UD, boolean>,
        vybrano?: boolean,
    }) {
        super({
            vybrano: args.vybrano ?? false,
            nutne: args.nutne ?? false,
            ...args,
            moznosti: [p`Nevyhovuje`, p`Vyhovuje`] as const,
        })
    }
}
export class Ano extends Prepinatkova<UD> {
    constructor(args: {
        nazev: GetOrVal<UD>,
        onError?: GetOrVal<UD>,
        nutne?: GetOrVal<UD, boolean>,
        zobrazit?: GetOrVal<UD, boolean>,
        vybrano?: boolean,
    }) {
        super({
            vybrano: args.vybrano ?? false,
            nutne: args.nutne ?? false,
            ...args,
            moznosti: [`no`, `yes`] as const,
        })
    }
}

export type Uvedeni = {
    tc: {
        nadpis: Nadpisova<UD>,
        jisticTC: Vyhovuje,
        jisticVJ: Vyhovuje,
        vzdalenostZdi: Vyhovuje,
        kondenzator: Ano,
        filtr: Ano,
    },
    nadrze: {
        nadpis: Nadpisova<UD>,
        akumulacka: Pisatkova<UD>,
        zasobnik: Pisatkova<UD>,
    },
    os: {
        nadpis: Nadpisova<UD>,
        tvori: Vybiratkova<UD>,
        dzTop: Ano,
        typDzTop: Pisatkova<UD>,
        tcTv: Ano,
        zTv: Pisatkova<UD>,
        objemEnOs: Vyhovuje,
        bazenTc: Ano,
    },
    reg: {
        nadpis: Nadpisova<UD>,
        pripojeniKInternetu: Vybiratkova<UD>,
        pospojeni: Ano,
        spotrebice: Ano,
        zalZdroj: Ano,
    },
    primar: {
        nadpis: Nadpisova<UD>,
        typ: Vybiratkova<UD>,
        popis: Pisatkova<UD>,
        nemrz: Pisatkova<UD>
        nadoba: Vybiratkova<UD>,
        kontrola: Ano,
    },
    uvadeni: {
        nadpis: Nadpisova<UD>,
        tc: Ano,
        reg: Ano,
        vlastnik: Ano,
        typZaruky: Vybiratkova<UD>,
        zaruka: Ano,
    },
}

export const defaultUvedeni = (): Uvedeni => ({
    tc: {
        nadpis: new Nadpisova<UD>({ nazev: p`Tepelné čerpadlo` }),
        jisticTC: new Vyhovuje({ nazev: p`Charakteristika a velikost jističe TČ` }),
        jisticVJ: new Vyhovuje({ nazev: p`Charakteristika a velikost vnitřní jednotky` }),
        vzdalenostZdi: new Vyhovuje({ nazev: p`Vzdálenost TČ od zdi` }),
        kondenzator: new Ano({
            nazev: p`Je instalován kompenzátor pro zvýšení ochrany výměníku TČ?`,
            zobrazit: d => d.evidence.tc.typ == `airToWater`,
            nutne: d => d.evidence.tc.typ == `airToWater`,
        }),
        filtr: new Ano({ nazev: p`Je instalován filtr oběhového čerpadla na zpátečce k TČ?` }),
    },
    nadrze: {
        nadpis: new Nadpisova<UD>({ nazev: p`Nádrže` }),
        akumulacka: new Pisatkova<UD>({ nazev: p`Typ akumulační nádrže`, nutne: false }),
        zasobnik: new Pisatkova<UD>({ nazev: p`Typ zásobníku`, nutne: false }),
    },
    os: {
        nadpis: new Nadpisova<UD>({ nazev: p`Otopný systém` }),
        tvori: new Vybiratkova<UD>({
            nazev: p`Otopný systém tvoří`, moznosti: [
                p`Radiátory`,
                p`Podlahové topení`,
                p`Kombinace (podlahové topení a radiátory)`,
                p`Jiné`,
            ],
        }),
        dzTop: new Ano({ nazev: p`Je v systému připojen doplňkový zdroj topení?` }),
        typDzTop: new Pisatkova<UD>({
            nazev: p`Typ a výkon doplňkového zdroje pro topení`,
            zobrazit: d => d.uvedeni.os.dzTop.value,
            nutne: d => d.uvedeni.os.dzTop.value
        }),
        tcTv: new Ano({ nazev: p`Připravuje TČ teplou vodu?`, nutne: false }),
        zTv: new Pisatkova<UD>({ nazev: d => d.uvedeni.os.tcTv.value ? p`Doplňkový zdroj přípravy teplé vody:` : p`Hlavní zdroj přípravy teplé vody:` }),
        objemEnOs: new Vyhovuje({ nazev: p`Objem expanzní nádoby otopného systému` }),
        bazenTc: new Ano({ nazev: p`Je také řešen prostřednictvím tepelného čerpadla ohřev bazénu?` }),
    },
    reg: {
        nadpis: new Nadpisova<UD>({ nazev: p`Regulace a elektroinstalace` }),
        pripojeniKInternetu: new Vybiratkova<UD>({
            nazev: p`Připojení k internetu`, moznosti: [
                p`Připojen pomocí RegulusRoute`,
                p`Připojen veřejnou IP adresou`,
                p`Nepřipojen`,
            ],
        }),
        pospojeni: new Ano({ nazev: p`Bylo provedeno kompletní elektrické pospojení?` }),
        spotrebice: new Ano({ nazev: p`Byly odzkoušeny všechny elektrické spotřebiče zapojené do regulace?` }),
        zalZdroj: new Ano({
            nazev: p`Je instalován záložní zdroj oběhového čerpadla?`,
            zobrazit: d => d.evidence.tc.typ == `airToWater`,
            nutne: d => d.evidence.tc.typ == `airToWater`,
        }),
    },
    primar: {
        nadpis: new Nadpisova<UD>({
            nazev: p`Primární okruh`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
        }),
        typ: new Vybiratkova<UD>({
            nazev: p`Typ primárního okruhu`,
            moznosti: [
                p`Hlubinné vrty`,
                p`Plošný kolektor`,
                p`Jiné`,
            ],
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater',
        }),
        popis: new Pisatkova<UD>({
            nazev: d => {
                switch (d.uvedeni.primar.typ.value) {
                    case (p`Hlubinné vrty`): return p`Počet a hloubka vrtů:`;
                    case (p`Plošný kolektor`): return p`Počet a délka okruhů:`;
                    default: return p`Popis:`;
                }
            },
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater' && d.uvedeni.primar.typ.value != null,
        }),
        nemrz: new Pisatkova<UD>({
            nazev: p`Typ použité nemrznoucí směsi`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater',
        }),
        nadoba: new Vybiratkova<UD>({
            nazev: p`Na primárním okruhu byla instalována`,
            moznosti: [p`expanzní nádoba`, p`vyrovnávací nádrž`],
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
            nutne: d => d.evidence.tc.typ == 'groundToWater',
        }),
        kontrola: new Ano({
            nazev: p`Bylo provedeno řádné odvzdušení a tlaková zkouška primárního okruhu?`,
            zobrazit: d => d.evidence.tc.typ == 'groundToWater',
        }),
    },
    uvadeni: {
        nadpis: new Nadpisova<UD>({ nazev: p`Informace o krocích provedených v průběhu uvádění do provozu` }),
        tc: new Ano({ nazev: p`Byla instalace a uvedení do provozu tepelného čerpadla provedena dle podmínek uvedených v návodu na montáž, připojení a obsluhu, instalačních podmínek a obecně platných norem?` }),
        reg: new Ano({ nazev: p`Byl nastaven regulátor tep. čerpadla na předepsané parametry?` }),
        vlastnik: new Ano({ nazev: p`Byl vlastník nebo provozovatel seznámen se základní funkcí tep. čerpadla a jeho obsluhou?` }),
        typZaruky: new Vybiratkova<UD>({
            nazev: p`Má vlastník TČ zájem o prodlouženou záruku?`, moznosti: [
                p`ne`,
                p`ano – 7 let na kompresor`,
                p`ano – 10 let na kompresor (příplatek)`,
            ]
        }),
        zaruka: new Ano({ nazev: p`Je instalace a uvedení do provozu v souladu s podmínkami prodloužené záruky?`, zobrazit: d => d.uvedeni.uvadeni.typZaruky.value?.includes('ano') ?? false }),
    },
})

export const rawUvedeniToUvedeni = (toUvedeni: Uvedeni, rawUvedeni: RawUvedeni) => {
    const d = toUvedeni as Record<string, Record<string, Vec<UD, any>>>

    Object.entries(rawUvedeni).map(a =>
        a as [keyof Uvedeni, RawUvedeni[keyof RawUvedeni]]
    ).forEach(([key1, section]) =>
        Object.entries(section).map(a =>
            a as [string, any]
        ).forEach(([key2, value]) => {
            d[key1][key2].value = value
            if (d[key1][key2] instanceof Pisatkova) d[key1][key2].updateText(value as string)
        })
    )

    return d as Uvedeni
}

export type RawUvedeni = Raw<Uvedeni, UD>

export const uvedeniToRawUvedeni = (uvedeni: Uvedeni): RawUvedeni => {
    const UvedeniEntries = Object.entries(uvedeni);
    const rawUvedeniEntries = UvedeniEntries.map(([key, subUvedeni]) => {
        const subUvedeniEntries = Object.entries(subUvedeni) as [string, Vec<UD, any>][];
        const rawSubUvedeniEntries = subUvedeniEntries.map(([subKey, vec]) => {
            if (vec.value == undefined) return undefined;
            else return [subKey, vec.value] as const;
        }).filter(it => it != undefined);
        const rawSubUvedeni = Object.fromEntries(rawSubUvedeniEntries);
        return [key, rawSubUvedeni] as const;
    });
    return Object.fromEntries(rawUvedeniEntries) as RawUvedeni;
};
