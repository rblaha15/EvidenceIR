import { CheckboxWidget, CounterWidget, InputWidget } from '$lib/forms/Widget.svelte.js';
import { type Form, type Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';

export type DataRKT = Raw<FormIN>

export interface FormRKT extends Form<DataRKT> {
    info: {
        osoba: InputWidget<DataRKT>,
        datum: InputWidget<DataRKT>,
        year: CounterWidget<DataRKT, true>,
    },
    kontrolaTepelnehoCerpadla: {
        kontrolaVenkovniJednotky: CheckboxWidget<DataRKT>,
        kontrolaElektrickeCasti: CheckboxWidget<DataRKT>,
        kontrolaChladivoveCasti: CheckboxWidget<DataRKT>,
    },
    kontrolaPrimarnihoOkruhu: {
        kontrola: CheckboxWidget<DataRKT>,
    },
    kontrolaRegulace: {
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<DataRKT>,
        celkoveProvozniHodinyKompresoru: InputWidget<DataRKT>,
        provozniHodinyKompresoruDoTepleVody: InputWidget<DataRKT>,
        celkovyPocetStartuKompresoru: InputWidget<DataRKT>,
        pocetStartuKompresoruDoTepleVody: InputWidget<DataRKT>,
        celkoveProvozniHodinyDoplnkovehoZdroje: InputWidget<DataRKT>,
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody: InputWidget<DataRKT>,
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<DataRKT>,
        prumernaDobaChoduKompresoruDoTepleVodyMinOdPosledniKontroly: InputWidget<DataRKT>,
    },
    kontrolaElektroinstalaceKomponentRegulus: {
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<DataRKT>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaci: CheckboxWidget<DataRKT>,
    },
    kontrolaOtopneSoustavy: {
        vycisteniFiltruInstalaceTepelnehoCerpadla: CheckboxWidget<DataRKT>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<DataRKT>,
        kontrolaPojistovacichVentilu: CheckboxWidget<DataRKT>,
        kontrolaPojistovacichVentiluPoznamka: InputWidget<DataRKT>,
        kontrolaTlakuVOtopneSoustavePriUPT: InputWidget<DataRKT, true>,
        kontrolaTlakuVOtopneSoustave: InputWidget<DataRKT>,
    },
    kontrolaTlakuExpanznichNadob: {
        expanzniNadobaOtopneSoustavyPriUPT: InputWidget<DataRKT, true>,
        expanzniNadobaOtopneSoustavy: InputWidget<DataRKT>,
        expanzniNadobaPitneVodyPriUPT: InputWidget<DataRKT, true>,
        expanzniNadobaPitneVody: InputWidget<DataRKT>,
    },
    funkcniTest: {
        provozniZkouska: CheckboxWidget<DataRKT>,
    },
    poznamky: {
        poznamka: InputWidget<DataRKT>,
    },
}
