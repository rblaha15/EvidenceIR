import type { BundleBuilder } from "firebase-admin/firestore";
import type { LanguageCode } from "./languages";

type Order = typeof order
type KeyOfArray<Array> = Exclude<keyof Array, keyof any[]>

type KontrolaBezJazyka = {
    [K in KeyOfArray<Order> as Order[K][0]]: {
        [K2 in KeyOfArray<Order[K][1]> as Order[K][1][K2] extends string ? Order[K][1][K2] : ""]: (Order[K][1][K2] extends `${string}B` ? boolean : string) | undefined
    }
}

type KontrolaAsArray = ({
    [K in keyof KontrolaBezJazyka]: (x: {
        [K2 in keyof KontrolaBezJazyka[K]]: {
            type: K2 extends `${string}B` ? "boolean" : "string",
            value: KontrolaBezJazyka[K][K2]
            key1: K,
            key2: K2,
        }
    }) => void
}) extends Record<keyof KontrolaBezJazyka, (y: infer U) => void>
    ? (U[keyof U] | {
        [K in keyof KontrolaBezJazyka as `${K}Name`]: {
            type: 'nadpis',
            value: Nazvy[`${K}Name`]
            key: K,
        }
    }[`${keyof KontrolaBezJazyka}Name`])[]
    : never

export type Kontrola = KontrolaBezJazyka & {
    language: LanguageCode
}

export type KontrolaAsRecord = {
    language: LanguageCode
} & Record<keyof KontrolaBezJazyka, Record<string, string | boolean | undefined>>

type NazvyBezJazyka = {
    [K in keyof KontrolaBezJazyka]: {
        [K2 in keyof KontrolaBezJazyka[K]]: string
    }
} & {
    [K in keyof KontrolaBezJazyka as `${K}Name`]: string
}

export type NazvyAsRecord = {
    language: LanguageCode
} & {
    [K in keyof KontrolaBezJazyka]: Record<string, string>
} & {
    [K in keyof KontrolaBezJazyka as `${K}Name`]: string
}

type Nazvy = NazvyBezJazyka & {
    language: LanguageCode
}

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
        stavPocitadlaCelkovychProvoznichHodinKompresoruB: "Stav počítadla celkových provozních hodin kompresoru",
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulaceB: "Stav počítadla provozních hodin do TV (umožňuje-li to regulace)",
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulaceB: "Stav celkového počtu startů tep. čerpadla (umožňuje-li to regulace)",
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulaceB: "Stav počtu startů tepel. čerpadla do TV (umožňuje-li to regulace)",
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeB: "Stav počítadla celkových provozních hodin doplňkového zdroje",
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTvB: "Stav počítadla celkových provozních hodin doplňkového zdroje TV",
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontrolyB: "Průměrná celková doba chodu kompresoru [min] - od poslední kontroly",
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontrolyB: "Průměrná doba chodu kompresoru do TV [min] - od poslední kontroly",
    },

    kontrolniUkonyOtopneSoustavy: {
        kontrolaFunkceObehovychCerpadelB: "Kontrola funkce oběhových čerpadel",
        vycisteniFiltruObehovychCerpadelB: "Vyčištění filtrů oběhových čerpadel",
        odvzdusneniZdrojeTcB: "Odvzdušnění zdroje (TČ)",
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovychB: "Kontrola funkce všech motorických ventilů (směšovací, zónových)",
        kontrolaTesnostiOtopneSoustavyB: "Kontrola těsnosti otopné soustavy",
        kontrolaTlakuVExpanzniNadobeOtopneSoustavyB: "Kontrola tlaku v expanzní nádobě otopné soustavy",
        nastavenyTlakPriUvadeniDoProvozuB: "Nastavený tlak při uvádění do provozu:",
        pripadneProvedteKontroluTlakuVOtopneSoustaveB: "Případně proveďte kontrolu tlaku v otopné soustavě",
        nastavenyTlakPriUvadeniDoProvozu2B: "Nastavený tlak při uvádění do provozu:",
    },

    kontrolaZasobnikuTv: {
        kontrolaMgAnodyVZasobnikuPripVymenaB: "Kontrola Mg anody v zásobníku, příp. výměna",
        kontrolaPojistovacihoVentiluB: "Kontrola pojišťovacího ventilu",
        pripadneProvedteKontroluTlakuVEnTepleVodyB: "Případně proveďte kontrolu tlaku v EN teplé vody",
        nastavenyTlakPriUvadeniDoProvozuNewlineB: "Nastavený tlak při uvádění do provozu:",
    },

    language: 'cs',
}

const order = [
    ["kontrolniElektroinstalace", [
        "kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulaceB",
        "kontrolaDotazeniSvorkovychSpoju",
        "vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeniB",
        "kontrolaSepnutiDohrevuSepnutiStykacePripadneReleB",
    ]],

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
        "stavPocitadlaCelkovychProvoznichHodinKompresoruB",
        "stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulaceB",
        "stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulaceB",
        "stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulaceB",
        "stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeB",
        "stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTvB",
        "prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontrolyB",
        "prumernaDobaChoduKompresoruDoTvMinOdPosledniKontrolyB",
    ]],

    ["kontrolniUkonyOtopneSoustavy", [
        "kontrolaFunkceObehovychCerpadelB",
        "vycisteniFiltruObehovychCerpadelB",
        "odvzdusneniZdrojeTcB",
        "kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovychB",
        "kontrolaTesnostiOtopneSoustavyB",
        "kontrolaTlakuVExpanzniNadobeOtopneSoustavyB",
        "nastavenyTlakPriUvadeniDoProvozuB",
        "pripadneProvedteKontroluTlakuVOtopneSoustaveB",
        "nastavenyTlakPriUvadeniDoProvozu2B",
    ]],

    ["kontrolaZasobnikuTv", [
        "kontrolaMgAnodyVZasobnikuPripVymenaB",
        "kontrolaPojistovacihoVentiluB",
        "pripadneProvedteKontroluTlakuVEnTepleVodyB",
        "nastavenyTlakPriUvadeniDoProvozuNewlineB",
    ]],
] as const

export const kontrola = (language: LanguageCode): Kontrola => ({
    ...Object.fromEntries(order.map(([key, sekce]) => [key,
        Object.fromEntries(sekce.map(key2 => [key2, undefined]))
    ])) as KontrolaBezJazyka, language
})

type R = Record<string, string | boolean | undefined>

export const arrayFrom = (kontrola: Kontrola | KontrolaAsRecord): KontrolaAsArray => order.flatMap(([key1, sekce]) => [
    { key: key1, type: 'nadpis', value: nazvyKontrol[`${key1}Name`] } as const,
    ...sekce.map(key2 => ({ key1, key2, value: (kontrola[key1] as R)[key2], type: key2.endsWith("B") ? "boolean" : "string" }))
]) as KontrolaAsArray