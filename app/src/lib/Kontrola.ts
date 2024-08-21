import type { LanguageCode } from "./languages";

type Order = typeof kontrolaOrder
type KeyOfArray<Array> = Exclude<keyof Array, keyof any[]>

export type KontrolaMetadata = {
    meta: {
        osoba: string,
        datum: string,
        language: LanguageCode,
    }
}

export type KontrolaBezMety = {
    [K in KeyOfArray<Order> as Order[K][0]]: {
        [K2 in KeyOfArray<Order[K][1]> as Order[K][1][K2] extends string ? Order[K][1][K2] : ""]?: (Order[K][1][K2] extends `${string}B` ? boolean : string)
    }
}

export type KontrolaTypes = {
    [K in KeyOfArray<Order> as Order[K][0]]: {
        [K2 in KeyOfArray<Order[K][1]> as Order[K][1][K2] extends string ? Order[K][1][K2] : ""]: (Order[K][1][K2] extends `${string}B` ? 'boolean' : Order[K][1][K2] extends `${string}T` ? 'tlak' : 'string')
    } & {
        'nadpis': 'nadpis'
    }
}

type KontrolaAsArray = ({
    [K in keyof KontrolaBezMety]: (x: {
        [K2 in keyof KontrolaBezMety[K]]-?: {
            type: K2 extends `${string}B` ? "boolean" : K2 extends `${string}T` ? 'tlak' : "string",
            value: KontrolaBezMety[K][K2]
            key1: K,
            key2: K2,
        }
    }) => void
}) extends Record<keyof KontrolaBezMety, (y: infer U) => void>
    ? (U[keyof U] | {
        [K in keyof KontrolaBezMety as `${K}Name`]: {
            type: 'nadpis',
            value: Nazvy[`${K}Name`]
            key: K,
        }
    }[`${keyof KontrolaBezMety}Name`])[]
    : never

type OrderAsArray = ({
    [K in KeyOfArray<Order> as Order[K][0]]: (x: {
        [K2 in KeyOfArray<Order[K][1]> as `${K}.${K2 extends number ? K2 : ''}`]: {
            key1: Order[K][0],
            key2: Order[K][1][K2],
        }
    }) => void
}) extends Record<Order[number][0], (y: infer U) => void>
    ? (U[keyof U] | {
        [K in keyof KontrolaBezMety as `${K}Name`]: {
            key1: K,
            key2: 'nadpis',
        }
    }[`${keyof KontrolaBezMety}Name`])[]
    : never

export type Kontrola = KontrolaBezMety & KontrolaMetadata

export type KontrolaAsRecord = KontrolaMetadata & Record<keyof KontrolaBezMety, Record<string, string | boolean | undefined>>

type NazvyBezMety = {
    [K in keyof KontrolaBezMety]: {
        [K2 in keyof KontrolaBezMety[K]]: string
    }
} & {
    [K in keyof KontrolaBezMety as `${K}Name`]: string
}

export type NazvyAsRecord = {
    [K in keyof KontrolaBezMety]: Record<string, string>
} & {
    [K in keyof KontrolaBezMety as `${K}Name`]: string
}

type Nazvy = NazvyBezMety

export const nazvyKontrol: Nazvy = {
    kontrolniElektroinstalaceName: "Kontrolní elektroinstalace",
    kontrolniUkonyTepelnehoCerpadlaName: "Kontrolní úkony tepelného čerpadla",
    kontrolniUkonyRegulaceName: "Kontrolní úkony regulace",
    kontrolniUkonyOtopneSoustavyName: "Kontrolní úkony otopné soustavy",
    kontrolaZasobnikuTvName: "Kontrola zásobníku TV",

    kontrolniElektroinstalace: {
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulaceB: "Kontrola funkce všech elektrických spotřebičů zapojených do regulace",
        kontrolaDotazeniSvorkovychSpoju: "Kontrola dotažení svorkových spojů",
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeniB: "Vizuální kontrola všech přístupných vodičů v instalaci (natavení, mech.poškození)",
        kontrolaSepnutiDohrevuSepnutiStykacePripadneReleB: "Kontrola sepnutí dohřevu (sepnutí stykače, případně relé)",
    },

    kontrolniUkonyTepelnehoCerpadla: {
        kontrolaChoduKompresoruB: "Kontrola chodu kompresoru",
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhuB: "Optická kontrola těsnosti trubkových spojů jednotky a chladivového okruhu",
        kontrolaOdvoduKondenzatuB: "Kontrola odvodu kondenzátu",
        kontrolaUchyceniVentilatoruB: "Kontrola uchycení ventilátoru",
        vycisteniVzduchovychCestJednotkyB: "Vyčištění vzduchových cest jednotky",
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchemB: "Kontrola lamel výparníku, případné odstranění nečistot vzduchem",
        proveritZdaNicNebraniOptimalniCirkulaciVzduchuB: "Prověřit, zda nic nebrání optimální cirkulaci vzduchu",
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavoduB: "Kontrola teplotního rozdílu tepelného čerpadla dle návodu",
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadlaB: "Kontrola elektrické části jednotky tepelného čerpadla",
    },

    kontrolniUkonyRegulace: {
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricinB: "Kontrola chybových a informačních hlášení regulátoru a jejich příčin",
        kontrolaNastaveniParametruRegulatoruB: "Kontrola nastavení parametrů regulátoru",
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveniB: "Preventivní proškolení obsluhy z hlediska uživatelského nastavení",
        stavPocitadlaCelkovychProvoznichHodinKompresoru: "Stav počítadla celkových provozních hodin kompresoru",
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: "Stav počítadla provozních hodin do TV (umožňuje-li to regulace)",
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: "Stav celkového počtu startů tep. čerpadla (umožňuje-li to regulace)",
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: "Stav počtu startů tepel. čerpadla do TV (umožňuje-li to regulace)",
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: "Stav počítadla celkových provozních hodin doplňkového zdroje",
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: "Stav počítadla celkových provozních hodin doplňkového zdroje TV",
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: "Průměrná celková doba chodu kompresoru [min] - od poslední kontroly",
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: "Průměrná doba chodu kompresoru do TV [min] - od poslední kontroly",
    },

    kontrolniUkonyOtopneSoustavy: {
        kontrolaFunkceObehovychCerpadelB: "Kontrola funkce oběhových čerpadel",
        vycisteniFiltruObehovychCerpadelB: "Vyčištění filtrů oběhových čerpadel",
        odvzdusneniZdrojeTcB: "Odvzdušnění zdroje (TČ)",
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovychB: "Kontrola funkce všech motorických ventilů (směšovací, zónových)",
        kontrolaTesnostiOtopneSoustavyB: "Kontrola těsnosti otopné soustavy",
        kontrolaTlakuVExpanzniNadobeOtopneSoustavyB: "Kontrola tlaku v expanzní nádobě otopné soustavy",
        nastavenyTlakPriUvadeniDoProvozuT: "Nastavený tlak při uvádění do provozu:",
        pripadneProvedteKontroluTlakuVOtopneSoustaveB: "Případně proveďte kontrolu tlaku v otopné soustavě",
        nastavenyTlakPriUvadeniDoProvozu2T: "Nastavený tlak při uvádění do provozu:",
    },

    kontrolaZasobnikuTv: {
        kontrolaMgAnodyVZasobnikuPripVymenaB: "Kontrola Mg anody v zásobníku, příp. výměna",
        kontrolaPojistovacihoVentiluB: "Kontrola pojišťovacího ventilu",
        pripadneProvedteKontroluTlakuVEnTepleVodyB: "Případně proveďte kontrolu tlaku v EN teplé vody",
        nastavenyTlakPriUvadeniDoProvozuT: "Nastavený tlak při uvádění do provozu:",
    },
}

export const kontrolaOrder = [
    ["kontrolniUkonyTepelnehoCerpadla", [
        "kontrolaChoduKompresoruB",
        "optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhuB",
        "kontrolaOdvoduKondenzatuB",
        "kontrolaUchyceniVentilatoruB",
        "vycisteniVzduchovychCestJednotkyB",
        "kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchemB",
        "proveritZdaNicNebraniOptimalniCirkulaciVzduchuB",
        "kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavoduB",
        "kontrolaElektrickeCastiJednotkyTepelnehoCerpadlaB",
    ]],

    ["kontrolniUkonyRegulace", [
        "kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricinB",
        "kontrolaNastaveniParametruRegulatoruB",
        "preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveniB",
        "stavPocitadlaCelkovychProvoznichHodinKompresoru",
        "stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace",
        "stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace",
        "stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace",
        "stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje",
        "stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv",
        "prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly",
        "prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly",
    ]],

    ["kontrolniElektroinstalace", [
        "kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulaceB",
        "kontrolaDotazeniSvorkovychSpoju",
        "vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeniB",
        "kontrolaSepnutiDohrevuSepnutiStykacePripadneReleB",
    ]],

    ["kontrolniUkonyOtopneSoustavy", [
        "kontrolaFunkceObehovychCerpadelB",
        "vycisteniFiltruObehovychCerpadelB",
        "odvzdusneniZdrojeTcB",
        "kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovychB",
        "kontrolaTesnostiOtopneSoustavyB",
        "kontrolaTlakuVExpanzniNadobeOtopneSoustavyB",
        "nastavenyTlakPriUvadeniDoProvozuT",
        "pripadneProvedteKontroluTlakuVOtopneSoustaveB",
        "nastavenyTlakPriUvadeniDoProvozu2T",
    ]],

    ["kontrolaZasobnikuTv", [
        "kontrolaMgAnodyVZasobnikuPripVymenaB",
        "kontrolaPojistovacihoVentiluB",
        "pripadneProvedteKontroluTlakuVEnTepleVodyB",
        "nastavenyTlakPriUvadeniDoProvozuT",
    ]],
] as const

export const kontrola = (language: LanguageCode, osoba: string, datum: string): Kontrola => ({
    ...Object.fromEntries(kontrolaOrder.map(([key]) => [key, {}])) as KontrolaBezMety, meta: {
        osoba, language, datum
    }
})

export const kontrolaTypes: Record<string, Record<string, 'boolean' | 'string' | 'tlak' | 'nadpis'>> = Object.fromEntries(kontrolaOrder.map(([key, sekce]) => [key,
    {
        'nadpis': 'nadpis' as const,
        ...Object.fromEntries(sekce.map(key2 => [key2, key2.endsWith("B") ? "boolean" : key2.endsWith("T") ? 'tlak' : "string"])),
    }
])) as KontrolaTypes

type R = Record<string, string | boolean | undefined>

export const arrayFrom = (kontrola: Kontrola | KontrolaAsRecord | KontrolaBezMety): KontrolaAsArray => kontrolaOrder.flatMap(([key1, sekce]) => [
    { key: key1, type: 'nadpis', value: nazvyKontrol[`${key1}Name`] } as const,
    ...sekce.map(key2 => ({ key1, key2, value: (kontrola[key1] as R)[key2], type: key2.endsWith("B") ? "boolean" : key2.endsWith("T") ? 'tlak' : "string" }))
]) as KontrolaAsArray

export const orderArray: OrderAsArray = kontrolaOrder.flatMap(([key1, sekce]) => [
    { key1, key2: 'nadpis' },
    ...sekce.map(key2 => ({ key1, key2 }))
]) as OrderAsArray

export const bezMety = (kontrola: Kontrola | KontrolaAsRecord): KontrolaBezMety => Object.fromEntries(kontrolaOrder.map(([key, sekce]) => [key,
    kontrola[key]
])) as KontrolaBezMety