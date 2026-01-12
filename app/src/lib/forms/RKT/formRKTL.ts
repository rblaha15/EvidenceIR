import { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte.js';
import { type Form } from '$lib/forms/Form';

export type DataRKTL = void

export interface FormRKTL extends Form<DataRKTL> {
    info: {
        osoba: InputWidget<DataRKTL>,
        datum: InputWidget<DataRKTL>,
        year: CounterWidget<DataRKTL, true>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: TitleWidget<DataRKTL>,
        kontrolaChoduKompresoru: CheckboxWidget<DataRKTL>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: CheckboxWidget<DataRKTL>,
        kontrolaOdvoduKondenzatu: CheckboxWidget<DataRKTL>,
        kontrolaUchyceniVentilatoru: CheckboxWidget<DataRKTL>,
        vycisteniVzduchovychCestJednotky: CheckboxWidget<DataRKTL>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: CheckboxWidget<DataRKTL>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: CheckboxWidget<DataRKTL>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: CheckboxWidget<DataRKTL>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: CheckboxWidget<DataRKTL>,
    },
    kontrolniUkonyRegulace: {
        nadpis: TitleWidget<DataRKTL>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<DataRKTL>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<DataRKTL>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: CheckboxWidget<DataRKTL>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: InputWidget<DataRKTL>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: InputWidget<DataRKTL>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: InputWidget<DataRKTL>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: InputWidget<DataRKTL>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: InputWidget<DataRKTL>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: InputWidget<DataRKTL>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<DataRKTL>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: InputWidget<DataRKTL>
    },
    kontrolniElektroinstalace: {
        nadpis: TitleWidget<DataRKTL>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<DataRKTL>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<DataRKTL>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<DataRKTL>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<DataRKTL>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: TitleWidget<DataRKTL>,
        kontrolaFunkceObehovychCerpadel: CheckboxWidget<DataRKTL>,
        vycisteniFiltruObehovychCerpadel: CheckboxWidget<DataRKTL>,
        odvzdusneniZdrojeTc: CheckboxWidget<DataRKTL>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: CheckboxWidget<DataRKTL>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<DataRKTL>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: CheckboxWidget<DataRKTL>,
        pripadneProvedteKontroluTlakuVOtopneSoustave: CheckboxWidget<DataRKTL>,
    },
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<DataRKTL>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<DataRKTL>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<DataRKTL>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<DataRKTL>,
    },
    poznamky: {
        poznamka: InputWidget<DataRKTL>,
    },
}
