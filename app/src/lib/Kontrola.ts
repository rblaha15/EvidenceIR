import type { LanguageCode } from "./languages";
import type { Translate } from "./translations";

type Order = typeof kontrolaOrder
type KeyOfArray<Array> = Exclude<keyof Array, keyof any[]>

export type KontrolaMetadata = {
    meta: {
        osoba: string,
        datum: string,
        poznamky: string,
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

export type Names = {
    [K in keyof KontrolaBezMety]: {
        [K2 in keyof KontrolaBezMety[K]]: string
    }
} & {
    [K in keyof KontrolaBezMety as `${K}Name`]: string
}

export type NamesRecord = {
    [K in keyof KontrolaBezMety]: Record<string, string>
} & {
    [K in keyof KontrolaBezMety as `${K}Name`]: string
}

export type NameMap = Partial<Translate<Names>>

const names_cs: Names = {
    kontrolniElektroinstalaceName: "Kontrolní elektroinstalace",
    kontrolniUkonyTepelnehoCerpadlaName: "Kontrolní úkony tepelného čerpadla",
    kontrolniUkonyRegulaceName: "Kontrolní úkony regulace",
    kontrolniUkonyOtopneSoustavyName: "Kontrolní úkony otopné soustavy",
    kontrolaZasobnikuTvName: "Kontrola zásobníku TV",

    kontrolniElektroinstalace: {
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulaceB: "Kontrola funkce všech elektrických spotřebičů zapojených do regulace",
        kontrolaDotazeniSvorkovychSpojuB: "Kontrola dotažení svorkových spojů",
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

const names_de: Names = {
    kontrolniElektroinstalaceName: "Verkabelung der Steuerung",
    kontrolniUkonyTepelnehoCerpadlaName: "Aufgaben zur Inspektion von Wärmepumpen",
    kontrolniUkonyRegulaceName: "Regulierungskontrolle",
    kontrolniUkonyOtopneSoustavyName: "Inspektionsaufgaben für Heizungsanlagen",
    kontrolaZasobnikuTvName: "Prüfen des Warmwasserspeichers",

    kontrolniElektroinstalace: {
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulaceB: "Überprüfung der Funktion aller an die Steuerung angeschlossenen elektrischen Geräte",
        kontrolaDotazeniSvorkovychSpojuB: "Anzugskontrolle der Klemmverbindungen",
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeniB: "Sichtprüfung aller zugänglichen Drähte in der Anlage (Schmelzen, mechanische Beschädigung)",
        kontrolaSepnutiDohrevuSepnutiStykacePripadneReleB: "Überprüfung des Einschaltens der Nachheizanlage (Einschalten des Schützes oder des Relais)",
    },

    kontrolniUkonyTepelnehoCerpadla: {
        kontrolaChoduKompresoruB: "Betrieb des Kompressors prüfen",
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhuB: "Optische Dichtheitsprüfung des Geräts und der Rohrverbindungen des Kältemittelkreislaufs",
        kontrolaOdvoduKondenzatuB: "Kontrolle des Kondensatablaufs",
        kontrolaUchyceniVentilatoruB: "Kontrolle der Ventilatorbefestigung",
        vycisteniVzduchovychCestJednotkyB: "Kontrolle der Verdampferflügel, eventuelle Entfernung von Verunreinigungen durch Luft",
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchemB: "Kontrolle der Temperaturdifferenz der Wärmepumpe gemäß den Anweisungen",
        proveritZdaNicNebraniOptimalniCirkulaciVzduchuB: "Kontrolle, dass nichts die optimale Luftzirkulation behindert wird",
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavoduB: "Reinigung der Luftwege des Geräts",
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadlaB: "Überprüfung des elektrischen Teils der Wärmepumpeneinheit",
    },

    kontrolniUkonyRegulace: {
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricinB: "Überprüfung der Fehler- und Informationsmeldungen des Reglers und ihrer Ursachen",
        kontrolaNastaveniParametruRegulatoruB: "Überprüfung der Parametereinstellungen des Reglers",
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveniB: "Vorbeugende Bedienerschulung in Bezug auf die Benutzereinstellungen",
        stavPocitadlaCelkovychProvoznichHodinKompresoru: "Zählerstand der Gesamtbetriebsstunden des Verdichters",
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: "Status des Betriebsstundenzählers zum WW (wenn die Regelung dies zulässt)",
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: "Status der Gesamtzahl der Wärmepumpenstarts (wenn von der Steuerung freigegeben)",
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: "Status der Anzahl der Wärmepumpenstarts zum WW (wenn von der Regelung freigegeben)",
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: "Gesamtbetriebsstundenzählerstand der Zusatzstromversorgung",
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: "Status des Gesamtbetriebsstundenzählers der Zusatzstromquelle WW",
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: "Durchschnittliche Gesamtlaufzeit des Kompressors [min] - seit der letzten Kontrolle",
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: "Durchschnittliche Kompressorlaufzeit zu WW [min] - seit der letzten Kontrolle",
    },

    kontrolniUkonyOtopneSoustavy: {
        kontrolaFunkceObehovychCerpadelB: "Kontrolle der Funktion von Umwälzpumpen",
        vycisteniFiltruObehovychCerpadelB: "Reinigung der Umwälzfilter",
        odvzdusneniZdrojeTcB: "Entlüftung der Quelle (Wärmepumpe)",
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovychB: "Funktionskontrolle aller motorisierten Ventile (Misch- und Zonenventile)",
        kontrolaTesnostiOtopneSoustavyB: "Überprüfung der Heizungsanlage auf Dichtheit",
        kontrolaTlakuVExpanzniNadobeOtopneSoustavyB: "Kontrolle des Drucks im Ausdehnungsgefäß der Heizungsanlage",
        nastavenyTlakPriUvadeniDoProvozuT: "Druck bei der Inbetriebnahme einstellen:",
        pripadneProvedteKontroluTlakuVOtopneSoustaveB: "Alternativ kann der Druck im Heizungssystem überprüft werden",
        nastavenyTlakPriUvadeniDoProvozu2T: "Druck bei der Inbetriebnahme einstellen:",
    },

    kontrolaZasobnikuTv: {
        kontrolaMgAnodyVZasobnikuPripVymenaB: "Kontrolle der Magnesiumanode im Behälter, ggf. Austausch",
        kontrolaPojistovacihoVentiluB: "Kontrolle des Sicherheitsventils",
        pripadneProvedteKontroluTlakuVEnTepleVodyB: "Warmwasserdruck prüfen, falls erforderlich",
        nastavenyTlakPriUvadeniDoProvozuT: "Druck bei der Inbetriebnahme einstellen:",
    },
}

export const checkNames: NameMap = {
    cs: names_cs,
    de: names_de,
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
        "kontrolaDotazeniSvorkovychSpojuB",
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

export const kontrola = (language: LanguageCode, datum: string, osoba: string = '', poznamky: string = ''): Kontrola => ({
    ...Object.fromEntries(kontrolaOrder.map(([key]) => [key, {}])) as KontrolaBezMety, meta: {
        osoba, language, datum, poznamky,
    }
})

export const kontrolaTypes: Record<string, Record<string, 'boolean' | 'string' | 'tlak' | 'nadpis'>> = Object.fromEntries(kontrolaOrder.map(([key, sekce]) => [key,
    {
        'nadpis': 'nadpis' as const,
        ...Object.fromEntries(sekce.map(key2 => [key2, key2.endsWith("B") ? "boolean" : key2.endsWith("T") ? 'tlak' : "string"])),
    }
])) as KontrolaTypes

type R = Record<string, string | boolean | undefined>

export const orderArray: OrderAsArray = kontrolaOrder.flatMap(([key1, sekce]) => [
    { key1, key2: 'nadpis' },
    ...sekce.map(key2 => ({ key1, key2 }))
]) as OrderAsArray