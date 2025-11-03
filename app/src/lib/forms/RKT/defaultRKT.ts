import { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { DataRKT, FormRKT } from '$lib/forms/RKT/formRKT.js';

export default (y: number, done: number[]): FormRKT => ({
    info: {
        osoba: new InputWidget({ label: t => t.rkt.performingPerson }),
        datum: new InputWidget({ label: t => t.rkt.checkDate, type: 'date' }),
        year: new CounterWidget<DataRKT, true>({
            label: t => t.rkt.checkYear, min: 1, chosen: y, max: Number.POSITIVE_INFINITY, hideInRawData: true,
            validate: v => !done.includes(v), onError: t => t.rkt.yearAlreadyFilled,
        })
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new TitleWidget({ text: t => t.rkt.kontrolniUkonyTepelnehoCerpadla, level: 2 }),
        kontrolaChoduKompresoru: new CheckboxWidget({ label: t => t.rkt.kontrolaChoduKompresoru, required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new CheckboxWidget(
            { label: t => t.rkt.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu, required: false }),
        kontrolaOdvoduKondenzatu: new CheckboxWidget({ label: t => t.rkt.kontrolaOdvoduKondenzatu, required: false }),
        kontrolaUchyceniVentilatoru: new CheckboxWidget({ label: t => t.rkt.kontrolaUchyceniVentilatoru, required: false }),
        vycisteniVzduchovychCestJednotky: new CheckboxWidget({ label: t => t.rkt.vycisteniVzduchovychCestJednotky, required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new CheckboxWidget(
            { label: t => t.rkt.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem, required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new CheckboxWidget(
            { label: t => t.rkt.proveritZdaNicNebraniOptimalniCirkulaciVzduchu, required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new CheckboxWidget(
            { label: t => t.rkt.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu, required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new CheckboxWidget(
            { label: t => t.rkt.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla, required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new TitleWidget({ text: t => t.rkt.kontrolniUkonyRegulace, level: 2 }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget(
            { label: t => t.rkt.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin, required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget({ label: t => t.rkt.kontrolaNastaveniParametruRegulatoru, required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new CheckboxWidget(
            { label: t => t.rkt.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni, required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: new InputWidget({
            label: t => t.rkt.stavPocitadlaCelkovychProvoznichHodinKompresoru,
            required: false,
        }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: t => t.rkt.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace, required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: new InputWidget(
            { label: t => t.rkt.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace, required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: t => t.rkt.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace, required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: new InputWidget(
            { label: t => t.rkt.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje, required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: new InputWidget(
            { label: t => t.rkt.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv, required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new InputWidget(
            { label: t => t.rkt.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly, required: false, show: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: new InputWidget(
            { label: t => t.rkt.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly, required: false, show: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: new TitleWidget({ text: t => t.rkt.kontrolniElektroinstalace, level: 2 }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget(
            { label: t => t.rkt.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace, required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: t => t.rkt.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget(
            { label: t => t.rkt.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni, required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget(
            { label: t => t.rkt.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele, required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new TitleWidget({ text: t => t.rkt.kontrolniUkonyOtopneSoustavy, level: 2 }),
        kontrolaFunkceObehovychCerpadel: new CheckboxWidget({ label: t => t.rkt.kontrolaFunkceObehovychCerpadel, required: false }),
        vycisteniFiltruObehovychCerpadel: new CheckboxWidget({ label: t => t.rkt.vycisteniFiltruObehovychCerpadel, required: false }),
        odvzdusneniZdrojeTc: new CheckboxWidget({ label: t => t.rkt.odvzdusneniZdrojeTc, required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new CheckboxWidget(
            { label: t => t.rkt.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych, required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget({ label: t => t.rkt.kontrolaTesnostiOtopneSoustavy, required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new CheckboxWidget({
            label: t => t.rkt.kontrolaTlakuVExpanzniNadobeOtopneSoustavy,
            required: false,
        }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new CheckboxWidget(
            { label: t => t.rkt.pripadneProvedteKontroluTlakuVOtopneSoustave, required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ text: t => t.rkt.kontrolaZasobnikuTv, level: 2 }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget({ label: t => t.rkt.kontrolaMgAnodyVZasobnikuPripVymena, required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget({ label: t => t.rkt.kontrolaPojistovacihoVentilu, required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget({
            label: t => t.rkt.pripadneProvedteKontroluTlakuVEnTepleVody,
            required: false,
        }),
    },
    poznamky: {
        poznamka: new InputWidget({
            label: t => t.rkt.note, required: false,
        }),
    },
});