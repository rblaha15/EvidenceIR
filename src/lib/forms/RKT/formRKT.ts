import { CheckboxWidget, CounterWidget, type GetT, InputWidget, TextWidget } from '$lib/forms/Widget.svelte.js';
import { type Form, type Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';

export type ContextRKT = {
    IN: Raw<FormIN>,
    mode: 'create' | 'edit' | 'view' | 'loading',
    dataFromLastYear?: {
        celkoveProvozniHodinyKompresoru: GetT<ContextRKT>
        provozniHodinyKompresoruDoTepleVody: GetT<ContextRKT>
        celkovyPocetStartuKompresoru: GetT<ContextRKT>
        pocetStartuKompresoruDoTepleVody: GetT<ContextRKT>
        celkoveProvozniHodinyDoplnkovehoZdroje: GetT<ContextRKT>
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody: GetT<ContextRKT>
    }
}

export interface FormRKT extends Form<ContextRKT> {
    info: {
        osoba: InputWidget<ContextRKT>,
        datum: InputWidget<ContextRKT>,
        year: CounterWidget<ContextRKT, true>,
    },
    kontrolaTepelnehoCerpadla: {
        kontrolaVenkovniJednotky: CheckboxWidget<ContextRKT>,
        kontrolaElektrickeCasti: CheckboxWidget<ContextRKT>,
        kontrolaChladivoveCasti: CheckboxWidget<ContextRKT>,
    },
    kontrolaPrimarnihoOkruhu: {
        kontrola: CheckboxWidget<ContextRKT>,
    },
    kontrolaRegulace: {
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<ContextRKT>,
        celkoveProvozniHodinyKompresoru: InputWidget<ContextRKT>,
        celkoveProvozniHodinyKompresoruMinule: TextWidget<ContextRKT>,
        provozniHodinyKompresoruDoTepleVody: InputWidget<ContextRKT>,
        provozniHodinyKompresoruDoTepleVodyMinule: TextWidget<ContextRKT>,
        celkovyPocetStartuKompresoru: InputWidget<ContextRKT>,
        celkovyPocetStartuKompresoruMinule: TextWidget<ContextRKT>,
        pocetStartuKompresoruDoTepleVody: InputWidget<ContextRKT>,
        pocetStartuKompresoruDoTepleVodyMinule: TextWidget<ContextRKT>,
        celkoveProvozniHodinyDoplnkovehoZdroje: InputWidget<ContextRKT>,
        celkoveProvozniHodinyDoplnkovehoZdrojeMinule: TextWidget<ContextRKT>,
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody: InputWidget<ContextRKT>,
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVodyMinule: TextWidget<ContextRKT>,
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<ContextRKT>,
        prumernaDobaChoduKompresoruDoTepleVodyMinOdPosledniKontroly: InputWidget<ContextRKT>,
    },
    kontrolaElektroinstalaceKomponentRegulus: {
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<ContextRKT>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaci: CheckboxWidget<ContextRKT>,
    },
    kontrolaOtopneSoustavy: {
        vycisteniFiltruInstalaceTepelnehoCerpadla: CheckboxWidget<ContextRKT>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<ContextRKT>,
        kontrolaPojistovacichVentilu: CheckboxWidget<ContextRKT>,
        kontrolaPojistovacichVentiluPoznamka: InputWidget<ContextRKT>,
        kontrolaTlakuVOtopneSoustavePriUPT: InputWidget<ContextRKT, true>,
        kontrolaTlakuVOtopneSoustave: InputWidget<ContextRKT>,
    },
    kontrolaTlakuExpanznichNadob: {
        expanzniNadobaOtopneSoustavyPriUPT: InputWidget<ContextRKT, true>,
        expanzniNadobaOtopneSoustavy: InputWidget<ContextRKT>,
        expanzniNadobaPitneVodyPriUPT: InputWidget<ContextRKT, true>,
        expanzniNadobaPitneVody: InputWidget<ContextRKT>,
    },
    funkcniTest: {
        provozniZkouska: CheckboxWidget<ContextRKT>,
    },
    poznamky: {
        poznamka: InputWidget<ContextRKT>,
    },
}
