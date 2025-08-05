import { CheckboxWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormRK } from '$lib/forms/RK/formRK.js';

export default (): FormRK => ({
    info: {
        osoba: new InputWidget({ label: 'rk.performingPerson' }),
        datum: new InputWidget({ label: 'rk.checkDate', type: 'date' }),
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new TitleWidget({ text: 'rk.kontrolniUkonyTepelnehoCerpadla' }),
        kontrolaChoduKompresoru: new CheckboxWidget({ label: 'rk.kontrolaChoduKompresoru', required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new CheckboxWidget(
            { label: 'rk.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu', required: false }),
        kontrolaOdvoduKondenzatu: new CheckboxWidget({ label: 'rk.kontrolaOdvoduKondenzatu', required: false }),
        kontrolaUchyceniVentilatoru: new CheckboxWidget({ label: 'rk.kontrolaUchyceniVentilatoru', required: false }),
        vycisteniVzduchovychCestJednotky: new CheckboxWidget({ label: 'rk.vycisteniVzduchovychCestJednotky', required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new CheckboxWidget(
            { label: 'rk.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem', required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new CheckboxWidget(
            { label: 'rk.proveritZdaNicNebraniOptimalniCirkulaciVzduchu', required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new CheckboxWidget(
            { label: 'rk.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu', required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new CheckboxWidget(
            { label: 'rk.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla', required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new TitleWidget({ text: 'rk.kontrolniUkonyRegulace' }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget(
            { label: 'rk.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin', required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget({ label: 'rk.kontrolaNastaveniParametruRegulatoru', required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new CheckboxWidget(
            { label: 'rk.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni', required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: new InputWidget({
            label: 'rk.stavPocitadlaCelkovychProvoznichHodinKompresoru',
            required: false,
        }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: 'rk.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace', required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: new InputWidget(
            { label: 'rk.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace', required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: 'rk.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: new InputWidget(
            { label: 'rk.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: new InputWidget(
            { label: 'rk.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv', required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new InputWidget(
            { label: 'rk.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly', required: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: new InputWidget(
            { label: 'rk.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly', required: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: new TitleWidget({ text: 'rk.kontrolniElektroinstalace' }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget(
            { label: 'rk.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace', required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: 'rk.kontrolaDotazeniSvorkovychSpoju', required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget(
            { label: 'rk.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni', required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget(
            { label: 'rk.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele', required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new TitleWidget({ text: 'rk.kontrolniUkonyOtopneSoustavy' }),
        kontrolaFunkceObehovychCerpadel: new CheckboxWidget({ label: 'rk.kontrolaFunkceObehovychCerpadel', required: false }),
        vycisteniFiltruObehovychCerpadel: new CheckboxWidget({ label: 'rk.vycisteniFiltruObehovychCerpadel', required: false }),
        odvzdusneniZdrojeTc: new CheckboxWidget({ label: 'rk.odvzdusneniZdrojeTc', required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new CheckboxWidget(
            { label: 'rk.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych', required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget({ label: 'rk.kontrolaTesnostiOtopneSoustavy', required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new CheckboxWidget({
            label: 'rk.kontrolaTlakuVExpanzniNadobeOtopneSoustavy',
            required: false,
        }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new CheckboxWidget(
            { label: 'rk.pripadneProvedteKontroluTlakuVOtopneSoustave', required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ text: 'rk.kontrolaZasobnikuTv' }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget({ label: 'rk.kontrolaMgAnodyVZasobnikuPripVymena', required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget({ label: 'rk.kontrolaPojistovacihoVentilu', required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget({
            label: 'rk.pripadneProvedteKontroluTlakuVEnTepleVody',
            required: false,
        }),
    },
    poznamky: {
        poznamka: new InputWidget({
            label: 'rk.note', required: false,
        }),
    },
});