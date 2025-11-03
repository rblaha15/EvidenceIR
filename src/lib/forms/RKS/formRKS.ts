import { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte.js';
import { type Form } from '$lib/forms/Form';

export type DataRKS = void

export interface FormRKS extends Form<DataRKS> {
    info: {
        osoba: InputWidget<DataRKS>,
        datum: InputWidget<DataRKS>,
        year: CounterWidget<DataRKS, true>,
    },
    kontrolniUkonySolarnihoSystemu: {
        nadpis: TitleWidget<DataRKS>,
        kontrolaUpevneniKolektoru: CheckboxWidget<DataRKS>,
        vizualniKontrolaTesnostiSystemu: CheckboxWidget<DataRKS>,
        kontrolaStavuIzolacePotrubi: CheckboxWidget<DataRKS>,
        kontrolaDorustaniOkolStromuZDuvoduMoznehoZastineni: CheckboxWidget<DataRKS>,
        odvzdusneniSolarnihoSystemuKontrolaSeparatoru: CheckboxWidget<DataRKS>,
        kontrolaSpravnehoPrutoku: CheckboxWidget<DataRKS>,
        kontrolaMrazuvzdornostiKapalinyRefraktometrem: CheckboxWidget<DataRKS>,
        kontrolaTlakuKapalinyVSolarnimSystemuPripadneDoplneni: CheckboxWidget<DataRKS>,
        kontrolaTlakuVSolarniEnJehoPripadneDoplneni: CheckboxWidget<DataRKS>,
    }
    kontrolaSolarniRegulace: {
        nadpis: TitleWidget<DataRKS>,
        kontrolaTeplotnichCidel: CheckboxWidget<DataRKS>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<DataRKS>,
        kontrolaChybovychHlaseniVRegulaciAJejichPricin: CheckboxWidget<DataRKS>,
        preventProskoleniObsluhyZHlediskaUdrzbyANastaveniRegulace: CheckboxWidget<DataRKS>,
    }
    kontrolaElektroinstalce: {
        nadpis: TitleWidget<DataRKS>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<DataRKS>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<DataRKS>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<DataRKS>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<DataRKS>,
    }
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<DataRKS>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<DataRKS>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<DataRKS>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<DataRKS>,
    }
    poznamky: {
        poznamka: InputWidget<DataRKS>,
    },
}
