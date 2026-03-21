import { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte.js';
import { type Form } from '$lib/forms/Form';

export type ContextRKS = {
    mode: 'create' | 'edit' | 'view' | 'loading',
}

export interface FormRKS extends Form<ContextRKS> {
    info: {
        osoba: InputWidget<ContextRKS>,
        datum: InputWidget<ContextRKS>,
        year: CounterWidget<ContextRKS, true>,
    },
    kontrolniUkonySolarnihoSystemu: {
        nadpis: TitleWidget<ContextRKS>,
        kontrolaUpevneniKolektoru: CheckboxWidget<ContextRKS>,
        vizualniKontrolaTesnostiSystemu: CheckboxWidget<ContextRKS>,
        kontrolaStavuIzolacePotrubi: CheckboxWidget<ContextRKS>,
        kontrolaDorustaniOkolStromuZDuvoduMoznehoZastineni: CheckboxWidget<ContextRKS>,
        odvzdusneniSolarnihoSystemuKontrolaSeparatoru: CheckboxWidget<ContextRKS>,
        kontrolaSpravnehoPrutoku: CheckboxWidget<ContextRKS>,
        kontrolaMrazuvzdornostiKapalinyRefraktometrem: CheckboxWidget<ContextRKS>,
        kontrolaTlakuKapalinyVSolarnimSystemuPripadneDoplneni: CheckboxWidget<ContextRKS>,
        kontrolaTlakuVSolarniEnJehoPripadneDoplneni: CheckboxWidget<ContextRKS>,
    }
    kontrolaSolarniRegulace: {
        nadpis: TitleWidget<ContextRKS>,
        kontrolaTeplotnichCidel: CheckboxWidget<ContextRKS>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<ContextRKS>,
        kontrolaChybovychHlaseniVRegulaciAJejichPricin: CheckboxWidget<ContextRKS>,
        preventProskoleniObsluhyZHlediskaUdrzbyANastaveniRegulace: CheckboxWidget<ContextRKS>,
    }
    kontrolaElektroinstalce: {
        nadpis: TitleWidget<ContextRKS>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<ContextRKS>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<ContextRKS>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<ContextRKS>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<ContextRKS>,
    }
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<ContextRKS>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<ContextRKS>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<ContextRKS>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<ContextRKS>,
    }
    poznamky: {
        poznamka: InputWidget<ContextRKS>,
    },
}
