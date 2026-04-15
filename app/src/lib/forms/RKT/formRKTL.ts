import { type Form } from '$lib/forms/Form';
import type { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget';

export type ContextRKTL = {
    mode: 'create' | 'edit' | 'view' | 'loading',
}

export interface FormRKTL extends Form<ContextRKTL> {
    info: {
        osoba: InputWidget<ContextRKTL>,
        datum: InputWidget<ContextRKTL>,
        year: CounterWidget<ContextRKTL, true>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: TitleWidget<ContextRKTL>,
        kontrolaChoduKompresoru: CheckboxWidget<ContextRKTL>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: CheckboxWidget<ContextRKTL>,
        kontrolaOdvoduKondenzatu: CheckboxWidget<ContextRKTL>,
        kontrolaUchyceniVentilatoru: CheckboxWidget<ContextRKTL>,
        vycisteniVzduchovychCestJednotky: CheckboxWidget<ContextRKTL>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: CheckboxWidget<ContextRKTL>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: CheckboxWidget<ContextRKTL>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: CheckboxWidget<ContextRKTL>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: CheckboxWidget<ContextRKTL>,
    },
    kontrolniUkonyRegulace: {
        nadpis: TitleWidget<ContextRKTL>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<ContextRKTL>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<ContextRKTL>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: CheckboxWidget<ContextRKTL>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: InputWidget<ContextRKTL>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: InputWidget<ContextRKTL>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: InputWidget<ContextRKTL>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: InputWidget<ContextRKTL>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: InputWidget<ContextRKTL>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: InputWidget<ContextRKTL>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<ContextRKTL>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: InputWidget<ContextRKTL>
    },
    kontrolniElektroinstalace: {
        nadpis: TitleWidget<ContextRKTL>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<ContextRKTL>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<ContextRKTL>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<ContextRKTL>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<ContextRKTL>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: TitleWidget<ContextRKTL>,
        kontrolaFunkceObehovychCerpadel: CheckboxWidget<ContextRKTL>,
        vycisteniFiltruObehovychCerpadel: CheckboxWidget<ContextRKTL>,
        odvzdusneniZdrojeTc: CheckboxWidget<ContextRKTL>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: CheckboxWidget<ContextRKTL>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<ContextRKTL>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: CheckboxWidget<ContextRKTL>,
        pripadneProvedteKontroluTlakuVOtopneSoustave: CheckboxWidget<ContextRKTL>,
    },
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<ContextRKTL>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<ContextRKTL>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<ContextRKTL>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<ContextRKTL>,
    },
    poznamky: {
        poznamka: InputWidget<ContextRKTL>,
    },
}
