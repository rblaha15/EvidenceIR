import type { ContextRKTL, FormRKTL } from '$lib/forms/RKT/formRKTL';
import { newCheckboxWidget, newCounterWidget, newInputWidget, newTitleWidget } from '$lib/forms/Widget';

export default (y: number, done: number[]): FormRKTL => ({
    info: {
        osoba: newInputWidget({ label: t => t.rkt.performingPerson }),
        datum: newInputWidget({ label: t => t.rkt.checkDate, type: 'date' }),
        year: newCounterWidget<ContextRKTL, true>({
            label: t => t.rkt.checkYear, min: 1, chosen: y, max: Number.POSITIVE_INFINITY, hideInRawData: true,
            validate: (v, d) => d.mode != 'create' || !done.includes(v),
            lock: c => c.mode != 'create', onError: t => t.rkt.yearAlreadyFilled,
        })
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: newTitleWidget({ text: t => t.rkt.kontrolniUkonyTepelnehoCerpadla, level: 2 }),
            kontrolaChoduKompresoru: newCheckboxWidget({ label: t => t.rkt.kontrolaChoduKompresoru, required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: newCheckboxWidget(
            { label: t => t.rkt.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu, required: false }),
        kontrolaOdvoduKondenzatu: newCheckboxWidget({ label: t => t.rkt.kontrolaOdvoduKondenzatu, required: false }),
        kontrolaUchyceniVentilatoru: newCheckboxWidget({ label: t => t.rkt.kontrolaUchyceniVentilatoru, required: false }),
        vycisteniVzduchovychCestJednotky: newCheckboxWidget({ label: t => t.rkt.vycisteniVzduchovychCestJednotky, required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: newCheckboxWidget(
            { label: t => t.rkt.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem, required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: newCheckboxWidget(
            { label: t => t.rkt.proveritZdaNicNebraniOptimalniCirkulaciVzduchu, required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: newCheckboxWidget(
            { label: t => t.rkt.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu, required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: newCheckboxWidget(
            { label: t => t.rkt.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla, required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: newTitleWidget({ text: t => t.rkt.kontrolniUkonyRegulace, level: 2 }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: newCheckboxWidget(
            { label: t => t.rkt.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin, required: false }),
        kontrolaNastaveniParametruRegulatoru: newCheckboxWidget({ label: t => t.rkt.kontrolaNastaveniParametruRegulatoru, required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: newCheckboxWidget(
            { label: t => t.rkt.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni, required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: newInputWidget({
            label: t => t.rkt.stavPocitadlaCelkovychProvoznichHodinKompresoru,
            required: false,
        }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: newInputWidget(
            { label: t => t.rkt.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace, required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: newInputWidget(
            { label: t => t.rkt.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace, required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: newInputWidget(
            { label: t => t.rkt.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace, required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: newInputWidget(
            { label: t => t.rkt.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje, required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: newInputWidget(
            { label: t => t.rkt.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv, required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: newInputWidget(
            { label: t => t.rkt.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly, required: false, show: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: newInputWidget(
            { label: t => t.rkt.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly, required: false, show: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: newTitleWidget({ text: t => t.rkt.kontrolniElektroinstalace, level: 2 }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: newCheckboxWidget(
            { label: t => t.rkt.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace, required: false }),
        kontrolaDotazeniSvorkovychSpoju: newCheckboxWidget({ label: t => t.rkt.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: newCheckboxWidget(
            { label: t => t.rkt.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni, required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: newCheckboxWidget(
            { label: t => t.rkt.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele, required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: newTitleWidget({ text: t => t.rkt.kontrolniUkonyOtopneSoustavy, level: 2 }),
        kontrolaFunkceObehovychCerpadel: newCheckboxWidget({ label: t => t.rkt.kontrolaFunkceObehovychCerpadel, required: false }),
        vycisteniFiltruObehovychCerpadel: newCheckboxWidget({ label: t => t.rkt.vycisteniFiltruObehovychCerpadel, required: false }),
        odvzdusneniZdrojeTc: newCheckboxWidget({ label: t => t.rkt.odvzdusneniZdrojeTc, required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: newCheckboxWidget(
            { label: t => t.rkt.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych, required: false }),
        kontrolaTesnostiOtopneSoustavy: newCheckboxWidget({ label: t => t.rkt.kontrolaTesnostiOtopneSoustavy, required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: newCheckboxWidget({
            label: t => t.rkt.kontrolaTlakuVExpanzniNadobeOtopneSoustavy,
            required: false,
        }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: newCheckboxWidget(
            { label: t => t.rkt.pripadneProvedteKontroluTlakuVOtopneSoustave, required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: newTitleWidget({ text: t => t.rkt.kontrolaZasobnikuTv, level: 2 }),
        kontrolaMgAnodyVZasobnikuPripVymena: newCheckboxWidget({ label: t => t.rkt.kontrolaMgAnodyVZasobnikuPripVymena, required: false }),
        kontrolaPojistovacihoVentilu: newCheckboxWidget({ label: t => t.rkt.kontrolaPojistovacihoVentilu, required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: newCheckboxWidget({
            label: t => t.rkt.pripadneProvedteKontroluTlakuVEnTepleVody,
            required: false,
        }),
    },
    poznamky: {
        poznamka: newInputWidget({
            label: t => t.rkt.note, required: false,
        }),
    },
});