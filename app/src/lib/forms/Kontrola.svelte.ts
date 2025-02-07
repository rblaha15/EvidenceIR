import type { FormInfo } from '$lib/forms/forms.svelte.js';
import { type IR, pridatKontrolu } from '$lib/client/firestore';
import { Nadpisova, p, Pisatkova, Zaskrtavatkova } from '$lib/Vec.svelte.js';
import { dataToRawData, type Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import { todayISO } from '$lib/helpers/date';

export type UDKO = {
    evidence: Raw<Data>,
    kontrola: Kontrola,
    rok: number,
}

export type Kontrola = {
    info: {
        osoba: Pisatkova<UDKO>,
        datum: Pisatkova<UDKO>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: Nadpisova<UDKO>,
        kontrolaChoduKompresoru: Zaskrtavatkova<UDKO>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: Zaskrtavatkova<UDKO>,
        kontrolaOdvoduKondenzatu: Zaskrtavatkova<UDKO>,
        kontrolaUchyceniVentilatoru: Zaskrtavatkova<UDKO>,
        vycisteniVzduchovychCestJednotky: Zaskrtavatkova<UDKO>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: Zaskrtavatkova<UDKO>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: Zaskrtavatkova<UDKO>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: Zaskrtavatkova<UDKO>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: Zaskrtavatkova<UDKO>,
    },
    kontrolniUkonyRegulace: {
        nadpis: Nadpisova<UDKO>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: Zaskrtavatkova<UDKO>,
        kontrolaNastaveniParametruRegulatoru: Zaskrtavatkova<UDKO>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: Zaskrtavatkova<UDKO>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: Pisatkova<UDKO>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: Pisatkova<UDKO>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: Pisatkova<UDKO>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: Pisatkova<UDKO>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: Pisatkova<UDKO>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: Pisatkova<UDKO>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: Pisatkova<UDKO>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: Pisatkova<UDKO>
    },
    kontrolniElektroinstalace: {
        nadpis: Nadpisova<UDKO>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: Zaskrtavatkova<UDKO>,
        kontrolaDotazeniSvorkovychSpoju: Zaskrtavatkova<UDKO>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: Zaskrtavatkova<UDKO>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: Zaskrtavatkova<UDKO>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: Nadpisova<UDKO>,
        kontrolaFunkceObehovychCerpadel: Zaskrtavatkova<UDKO>,
        vycisteniFiltruObehovychCerpadel: Zaskrtavatkova<UDKO>,
        odvzdusneniZdrojeTc: Zaskrtavatkova<UDKO>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: Zaskrtavatkova<UDKO>,
        kontrolaTesnostiOtopneSoustavy: Zaskrtavatkova<UDKO>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: Zaskrtavatkova<UDKO>,
        nastavenyTlakPriUvadeniDoProvozu: Pisatkova<UDKO>
        pripadneProvedteKontroluTlakuVOtopneSoustave: Zaskrtavatkova<UDKO>,
        nastavenyTlakPriUvadeniDoProvozu2: Pisatkova<UDKO>
    },
    kontrolaZasobnikuTv: {
        nadpis: Nadpisova<UDKO>,
        kontrolaMgAnodyVZasobnikuPripVymena: Zaskrtavatkova<UDKO>,
        kontrolaPojistovacihoVentilu: Zaskrtavatkova<UDKO>,
        pripadneProvedteKontroluTlakuVEnTepleVody: Zaskrtavatkova<UDKO>,
        nastavenyTlakPriUvadeniDoProvozu: Pisatkova<UDKO>
    },
    poznamky: {
        poznamka: Pisatkova<UDKO>,
    },
}

export const defaultKontrola = (): Kontrola => ({
    info: {
        osoba: new Pisatkova<UDKO>({ nazev: 'performingPerson' }),
        datum: new Pisatkova<UDKO>({ nazev: 'checkDate', type: 'date' }),
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new Nadpisova({ nazev: 'check.kontrolniUkonyTepelnehoCerpadla' }),
        kontrolaChoduKompresoru: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaChoduKompresoru', required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu', required: false }),
        kontrolaOdvoduKondenzatu: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaOdvoduKondenzatu', required: false }),
        kontrolaUchyceniVentilatoru: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaUchyceniVentilatoru', required: false }),
        vycisteniVzduchovychCestJednotky: new Zaskrtavatkova<UDKO>({ nazev: 'check.vycisteniVzduchovychCestJednotky', required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem', required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.proveritZdaNicNebraniOptimalniCirkulaciVzduchu', required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu', required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla', required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new Nadpisova({ nazev: 'check.kontrolniUkonyRegulace' }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin', required: false }),
        kontrolaNastaveniParametruRegulatoru: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaNastaveniParametruRegulatoru', required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni', required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: new Pisatkova({ nazev: 'check.stavPocitadlaCelkovychProvoznichHodinKompresoru', required: false }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: new Pisatkova(
            { nazev: 'check.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace', required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: new Pisatkova(
            { nazev: 'check.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace', required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: new Pisatkova(
            { nazev: 'check.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: new Pisatkova(
            { nazev: 'check.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: new Pisatkova(
            { nazev: 'check.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv', required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new Pisatkova(
            { nazev: 'check.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly', required: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: new Pisatkova(
            { nazev: 'check.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly', required: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: new Nadpisova({ nazev: 'check.kontrolniElektroinstalace' }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace', required: false }),
        kontrolaDotazeniSvorkovychSpoju: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaDotazeniSvorkovychSpoju', required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni', required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele', required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new Nadpisova({ nazev: 'check.kontrolniUkonyOtopneSoustavy' }),
        kontrolaFunkceObehovychCerpadel: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaFunkceObehovychCerpadel', required: false }),
        vycisteniFiltruObehovychCerpadel: new Zaskrtavatkova<UDKO>({ nazev: 'check.vycisteniFiltruObehovychCerpadel', required: false }),
        odvzdusneniZdrojeTc: new Zaskrtavatkova<UDKO>({ nazev: 'check.odvzdusneniZdrojeTc', required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych', required: false }),
        kontrolaTesnostiOtopneSoustavy: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaTesnostiOtopneSoustavy', required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaTlakuVExpanzniNadobeOtopneSoustavy', required: false }),
        nastavenyTlakPriUvadeniDoProvozu: new Pisatkova({ nazev: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: ({ rok }) => rok != 1 }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new Zaskrtavatkova<UDKO>(
            { nazev: 'check.pripadneProvedteKontroluTlakuVOtopneSoustave', required: false }),
        nastavenyTlakPriUvadeniDoProvozu2: new Pisatkova({ nazev: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: ({ rok }) => rok != 1 }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new Nadpisova({ nazev: 'check.kontrolaZasobnikuTv' }),
        kontrolaMgAnodyVZasobnikuPripVymena: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaMgAnodyVZasobnikuPripVymena', required: false }),
        kontrolaPojistovacihoVentilu: new Zaskrtavatkova<UDKO>({ nazev: 'check.kontrolaPojistovacihoVentilu', required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new Zaskrtavatkova<UDKO>({ nazev: 'check.pripadneProvedteKontroluTlakuVEnTepleVody', required: false }),
        nastavenyTlakPriUvadeniDoProvozu: new Pisatkova({ nazev: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: ({ rok }) => rok != 1 }),
    },
    poznamky: {
        poznamka: new Pisatkova<UDKO>({ nazev: 'note', required: false }),
    }
});

const posledniKontrola = (ir: IR): number => {
    const kontroly = ir.kontroly as Record<number, Kontrola | undefined> | undefined;
    if (kontroly?.[1] == undefined) return 0;
    return Math.max(...kontroly.keys().map((it) => Number(it)));
};

export const check = (() => {
    let rok = $state() as number;

    const info: FormInfo<UDKO, Kontrola> = {
        storeName: 'stored_check',
        defaultData: defaultKontrola,
        pdfLink: 'check',
        getEditData: ir => {
            rok = posledniKontrola(ir) + 1;
            if (rok != 1) {
                const kontroly = ir.kontroly as Record<number, Raw<Kontrola> | undefined>;
                const predchoziKontrola = kontroly[rok - 1]!;
                const data = dataToRawData(defaultKontrola());
                data.poznamky.poznamka = predchoziKontrola.poznamky.poznamka;
                data.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu = predchoziKontrola.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu;
                data.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu2 = predchoziKontrola.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu2;
                data.kontrolaZasobnikuTv.nastavenyTlakPriUvadeniDoProvozu = predchoziKontrola.kontrolaZasobnikuTv.nastavenyTlakPriUvadeniDoProvozu;
                return data;
            } else return undefined;
        },
        saveData: (irid, raw) => pridatKontrolu(irid, rok, raw),
        createWidgetData: (evidence, kontrola) => ({ evidence, kontrola, rok }),
        title: () => 'yearlyHPCheck',
        subtitle: (_, t) => p`${t.year}: ${rok.toString() ?? '…'}`,
        onMount: async k => {
            if (!k.info.datum.value)
                k.info.datum.value = todayISO();
        },
    };
    return info;
})();