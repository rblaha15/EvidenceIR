import { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte.js';
import { type Form } from '$lib/forms/Form';

export type DataRKT = void

export interface FormRKT extends Form<DataRKT> {
    info: {
        osoba: InputWidget<DataRKT>,
        datum: InputWidget<DataRKT>,
        year: CounterWidget<DataRKT, true>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: TitleWidget<DataRKT>,
        kontrolaChoduKompresoru: CheckboxWidget<DataRKT>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: CheckboxWidget<DataRKT>,
        kontrolaOdvoduKondenzatu: CheckboxWidget<DataRKT>,
        kontrolaUchyceniVentilatoru: CheckboxWidget<DataRKT>,
        vycisteniVzduchovychCestJednotky: CheckboxWidget<DataRKT>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: CheckboxWidget<DataRKT>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: CheckboxWidget<DataRKT>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: CheckboxWidget<DataRKT>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: CheckboxWidget<DataRKT>,
    },
    kontrolniUkonyRegulace: {
        nadpis: TitleWidget<DataRKT>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<DataRKT>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<DataRKT>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: CheckboxWidget<DataRKT>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: InputWidget<DataRKT>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: InputWidget<DataRKT>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: InputWidget<DataRKT>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: InputWidget<DataRKT>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: InputWidget<DataRKT>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: InputWidget<DataRKT>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<DataRKT>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: InputWidget<DataRKT>
    },
    kontrolniElektroinstalace: {
        nadpis: TitleWidget<DataRKT>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<DataRKT>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<DataRKT>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<DataRKT>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<DataRKT>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: TitleWidget<DataRKT>,
        kontrolaFunkceObehovychCerpadel: CheckboxWidget<DataRKT>,
        vycisteniFiltruObehovychCerpadel: CheckboxWidget<DataRKT>,
        odvzdusneniZdrojeTc: CheckboxWidget<DataRKT>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: CheckboxWidget<DataRKT>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<DataRKT>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: CheckboxWidget<DataRKT>,
        pripadneProvedteKontroluTlakuVOtopneSoustave: CheckboxWidget<DataRKT>,
    },
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<DataRKT>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<DataRKT>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<DataRKT>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<DataRKT>,
    },
    poznamky: {
        poznamka: InputWidget<DataRKT>,
    },
}
