import { CheckboxWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { FormRK } from '$lib/forms/RK/formRK.js';

export default (): FormRK => ({
    info: {
        osoba: new InputWidget({ label: t => t.rk.performingPerson }),
        datum: new InputWidget({ label: t => t.rk.checkDate, type: 'date' }),
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new TitleWidget({ text: t => t.rk.kontrolniUkonyTepelnehoCerpadla }),
        kontrolaChoduKompresoru: new CheckboxWidget({ label: t => t.rk.kontrolaChoduKompresoru, required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new CheckboxWidget(
            { label: t => t.rk.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu, required: false }),
        kontrolaOdvoduKondenzatu: new CheckboxWidget({ label: t => t.rk.kontrolaOdvoduKondenzatu, required: false }),
        kontrolaUchyceniVentilatoru: new CheckboxWidget({ label: t => t.rk.kontrolaUchyceniVentilatoru, required: false }),
        vycisteniVzduchovychCestJednotky: new CheckboxWidget({ label: t => t.rk.vycisteniVzduchovychCestJednotky, required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new CheckboxWidget(
            { label: t => t.rk.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem, required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new CheckboxWidget(
            { label: t => t.rk.proveritZdaNicNebraniOptimalniCirkulaciVzduchu, required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new CheckboxWidget(
            { label: t => t.rk.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu, required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new CheckboxWidget(
            { label: t => t.rk.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla, required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new TitleWidget({ text: t => t.rk.kontrolniUkonyRegulace }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget(
            { label: t => t.rk.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin, required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget({ label: t => t.rk.kontrolaNastaveniParametruRegulatoru, required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new CheckboxWidget(
            { label: t => t.rk.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni, required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: new InputWidget({
            label: t => t.rk.stavPocitadlaCelkovychProvoznichHodinKompresoru,
            required: false,
        }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: t => t.rk.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace, required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: new InputWidget(
            { label: t => t.rk.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace, required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: t => t.rk.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace, required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: new InputWidget(
            { label: t => t.rk.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje, required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: new InputWidget(
            { label: t => t.rk.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv, required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new InputWidget(
            { label: t => t.rk.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly, required: false, show: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: new InputWidget(
            { label: t => t.rk.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly, required: false, show: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: new TitleWidget({ text: t => t.rk.kontrolniElektroinstalace }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget(
            { label: t => t.rk.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace, required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: t => t.rk.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget(
            { label: t => t.rk.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni, required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget(
            { label: t => t.rk.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele, required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new TitleWidget({ text: t => t.rk.kontrolniUkonyOtopneSoustavy }),
        kontrolaFunkceObehovychCerpadel: new CheckboxWidget({ label: t => t.rk.kontrolaFunkceObehovychCerpadel, required: false }),
        vycisteniFiltruObehovychCerpadel: new CheckboxWidget({ label: t => t.rk.vycisteniFiltruObehovychCerpadel, required: false }),
        odvzdusneniZdrojeTc: new CheckboxWidget({ label: t => t.rk.odvzdusneniZdrojeTc, required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new CheckboxWidget(
            { label: t => t.rk.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych, required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget({ label: t => t.rk.kontrolaTesnostiOtopneSoustavy, required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new CheckboxWidget({
            label: t => t.rk.kontrolaTlakuVExpanzniNadobeOtopneSoustavy,
            required: false,
        }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new CheckboxWidget(
            { label: t => t.rk.pripadneProvedteKontroluTlakuVOtopneSoustave, required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ text: t => t.rk.kontrolaZasobnikuTv }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget({ label: t => t.rk.kontrolaMgAnodyVZasobnikuPripVymena, required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget({ label: t => t.rk.kontrolaPojistovacihoVentilu, required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget({
            label: t => t.rk.pripadneProvedteKontroluTlakuVEnTepleVody,
            required: false,
        }),
    },
    poznamky: {
        poznamka: new InputWidget({
            label: t => t.rk.note, required: false,
        }),
    },
});