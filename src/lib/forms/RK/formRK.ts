import { CheckboxWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte.js';
import { type Form } from '$lib/forms/Form';

export type DataRK = void

export interface FormRK extends Form<DataRK> {
    info: {
        osoba: InputWidget<DataRK>,
        datum: InputWidget<DataRK>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: TitleWidget<DataRK>,
        kontrolaChoduKompresoru: CheckboxWidget<DataRK>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: CheckboxWidget<DataRK>,
        kontrolaOdvoduKondenzatu: CheckboxWidget<DataRK>,
        kontrolaUchyceniVentilatoru: CheckboxWidget<DataRK>,
        vycisteniVzduchovychCestJednotky: CheckboxWidget<DataRK>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: CheckboxWidget<DataRK>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: CheckboxWidget<DataRK>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: CheckboxWidget<DataRK>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: CheckboxWidget<DataRK>,
    },
    kontrolniUkonyRegulace: {
        nadpis: TitleWidget<DataRK>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<DataRK>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<DataRK>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: CheckboxWidget<DataRK>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: InputWidget<DataRK>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: InputWidget<DataRK>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: InputWidget<DataRK>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: InputWidget<DataRK>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: InputWidget<DataRK>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: InputWidget<DataRK>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<DataRK>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: InputWidget<DataRK>
    },
    kontrolniElektroinstalace: {
        nadpis: TitleWidget<DataRK>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<DataRK>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<DataRK>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<DataRK>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<DataRK>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: TitleWidget<DataRK>,
        kontrolaFunkceObehovychCerpadel: CheckboxWidget<DataRK>,
        vycisteniFiltruObehovychCerpadel: CheckboxWidget<DataRK>,
        odvzdusneniZdrojeTc: CheckboxWidget<DataRK>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: CheckboxWidget<DataRK>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<DataRK>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: CheckboxWidget<DataRK>,
        pripadneProvedteKontroluTlakuVOtopneSoustave: CheckboxWidget<DataRK>,
    },
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<DataRK>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<DataRK>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<DataRK>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<DataRK>,
    },
    poznamky: {
        poznamka: InputWidget<DataRK>,
    },
}
