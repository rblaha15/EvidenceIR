import { CheckboxWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormRK } from '$lib/forms/RK/formRK.js';

export default (): FormRK => ({
    info: {
        osoba: new InputWidget({ label: 'performingPerson' }),
        datum: new InputWidget({ label: 'checkDate', type: 'date' }),
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new TitleWidget({ text: 'check.kontrolniUkonyTepelnehoCerpadla' }),
        kontrolaChoduKompresoru: new CheckboxWidget({ label: 'check.kontrolaChoduKompresoru', required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new CheckboxWidget(
            { label: 'check.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu', required: false }),
        kontrolaOdvoduKondenzatu: new CheckboxWidget({ label: 'check.kontrolaOdvoduKondenzatu', required: false }),
        kontrolaUchyceniVentilatoru: new CheckboxWidget({ label: 'check.kontrolaUchyceniVentilatoru', required: false }),
        vycisteniVzduchovychCestJednotky: new CheckboxWidget({ label: 'check.vycisteniVzduchovychCestJednotky', required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new CheckboxWidget(
            { label: 'check.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem', required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new CheckboxWidget(
            { label: 'check.proveritZdaNicNebraniOptimalniCirkulaciVzduchu', required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new CheckboxWidget(
            { label: 'check.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu', required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new CheckboxWidget(
            { label: 'check.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla', required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new TitleWidget({ text: 'check.kontrolniUkonyRegulace' }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget(
            { label: 'check.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin', required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget({ label: 'check.kontrolaNastaveniParametruRegulatoru', required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new CheckboxWidget(
            { label: 'check.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni', required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: new InputWidget({
            label: 'check.stavPocitadlaCelkovychProvoznichHodinKompresoru',
            required: false,
        }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: 'check.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace', required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: new InputWidget(
            { label: 'check.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace', required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: 'check.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: new InputWidget(
            { label: 'check.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: new InputWidget(
            { label: 'check.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv', required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new InputWidget(
            { label: 'check.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly', required: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: new InputWidget(
            { label: 'check.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly', required: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: new TitleWidget({ text: 'check.kontrolniElektroinstalace' }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget(
            { label: 'check.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace', required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: 'check.kontrolaDotazeniSvorkovychSpoju', required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget(
            { label: 'check.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni', required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget(
            { label: 'check.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele', required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new TitleWidget({ text: 'check.kontrolniUkonyOtopneSoustavy' }),
        kontrolaFunkceObehovychCerpadel: new CheckboxWidget({ label: 'check.kontrolaFunkceObehovychCerpadel', required: false }),
        vycisteniFiltruObehovychCerpadel: new CheckboxWidget({ label: 'check.vycisteniFiltruObehovychCerpadel', required: false }),
        odvzdusneniZdrojeTc: new CheckboxWidget({ label: 'check.odvzdusneniZdrojeTc', required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new CheckboxWidget(
            { label: 'check.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych', required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget({ label: 'check.kontrolaTesnostiOtopneSoustavy', required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new CheckboxWidget({
            label: 'check.kontrolaTlakuVExpanzniNadobeOtopneSoustavy',
            required: false,
        }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new CheckboxWidget(
            { label: 'check.pripadneProvedteKontroluTlakuVOtopneSoustave', required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ text: 'check.kontrolaZasobnikuTv' }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget({ label: 'check.kontrolaMgAnodyVZasobnikuPripVymena', required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget({ label: 'check.kontrolaPojistovacihoVentilu', required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget({
            label: 'check.pripadneProvedteKontroluTlakuVEnTepleVody',
            required: false,
        }),
    },
    poznamky: {
        poznamka: new InputWidget({
            label: 'note', required: false,
        }),
    },
});