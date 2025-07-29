import type { Raw } from '$lib/forms/Form';
import type { TranslationReference, Translations } from '$lib/translations';
import type { SeCh } from '$lib/forms/Widget.svelte';
import type { User } from 'firebase/auth';
import { browser, dev, version } from '$app/environment';
import type { FormNK } from './formNK';

const fve = (d: Raw<FormNK>) => d.contacts.demandSubject.includes(`demand.contacts.fve`);
const hp = (d: Raw<FormNK>) => d.contacts.demandSubject.includes(`demand.contacts.heatPump`);
const pool = (d: Raw<FormNK>) => hp(d) && d.system.wantsPool;

const seCh = (t: Translations, v: SeCh<TranslationReference>) => v.checked ? t.get(v.chosen ?? '') : t.no;

export default (d: Raw<FormNK>, user: User, t: Translations, dem: FormNK) => `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="dotaznik_app.xsl"?>

<!--
Tento soubor byl vygenerován automaticky aplikací Regulus SEIR
Verze dokumentu: 3.0 (Zaveden ve verzi aplikace 5.1.1 (Android) a 1.2.0 (SEIR))
Verze aplikace: ${appVersion} (${version}) (${dev ? 'DEV' : browser ? 'BROWSER' : 'UNKNOWN'})
-->

<!--
Změny ve verzi 3.0 oproti verzi 2.3:
- Přidána všechna pole "řeší" v sekci /xml/system
  - Né každá poptávka nyní řeší TČ
- Přidána fotovoltaická elektrárna
  - Přidána sekce /xml/fve - pouze pokud je poptávána
  - Sekce  /xml/detailobjektu, /xml/tc, /xml/zdrojeTop, /xml/tv, /xml/zdrojeTV, /xml/bazen, /xml/prislusenstvi jsou zahrnuty pouze pokud je poptávané TČ
  - Přidána poznámka k FVE (/xml/poznamka/fve)
-->

<!--
Změny ve verzi 2.3 oproti verzi 2.2:
- Přidán kód1 (/xml/system/kod1)
  - Možnosti jsou: _dotazEmail, _dotaznikVYS, _dotazOsobně, _poptávkaDis, _poptávkaMF, _poptávkaPROJ 
  - V DEBUG verzi aplikace lze zadat i možnost _debug, ta by se ale nikdy neměla objevit v opravdových poptávkách
- Pokojová čidla a jednotky sjednoceny do jednoho pole (/xml/prislusenstvi/pokojova_cidla_a_jednotky)
  - Nyní mohou obsahovat více možností, oddělených čárkou
  - Každá možnost má před sebou vždy specifikován počet položek pomocí písmene x 
  - Název žádné jednotky ani čidla neobsahuje čárku
  - Příklad: \`<pokojove_cidlo>1x RS 10, 2x RDC</pokojove_cidlo>\`
-->

<xml>
    <system>
        <kod1>${t.get(d.contacts.demandOrigin!)}</kod1>
        <resi_tc>${hp(d) ? t.yes : t.no}</resi_tc>
        <resi_fve>${fve(d) ? t.yes : t.no}</resi_fve>
        <resi_sol>${t.no}</resi_sol>
        <resi_rek>${t.no}</resi_rek>
        <resi_krb>${t.no}</resi_krb>
        <resi_konz>${t.no}</resi_konz>
        <resi_jine>${t.no}</resi_jine>
        <resi_jine_uvedte>${t.no}</resi_jine_uvedte>
        <resi_doporuc>${t.no}</resi_doporuc>
        <cislo_ko>${d.other.representative!.koNumber}</cislo_ko>
        <odesilatel>${user.email}</odesilatel>
    </system>
    <kontakt>
        <jmeno>${d.contacts.name}</jmeno>
        <prijmeni>${d.contacts.surname}</prijmeni>
        <telefon>${d.contacts.phone}</telefon>
        <email>${d.contacts.email}</email>
        <ulice>${d.contacts.street}</ulice>
        <psc>${d.contacts.zip}</psc>
        <mesto>${d.contacts.city}</mesto>
        <partner_ico>${d.contacts.assemblyCompanyCRN}</partner_ico>
    </kontakt>${hp(d) ? `
    <detailobjektu>
        <os_popis>${t.get(d.system.heatingSystem ?? '')}</os_popis>
        <tepelna_ztrata>${d.objectDetails.heatLost}</tepelna_ztrata>
        <rocni_spotreba_vytapeni>${d.objectDetails.heatNeedsForHeating}</rocni_spotreba_vytapeni>
        <rocni_spotreba_tv>${d.objectDetails.heatNeedsForHotWater}</rocni_spotreba_tv>
        <vytapena_plocha>${d.objectDetails.heatedArea}</vytapena_plocha>
        <vytapeny_objem>${d.objectDetails.heatedVolume}</vytapeny_objem>
        <spotreba_paliva_druh>${d.objectDetails.fuelType}</spotreba_paliva_druh>
        <spotreba_paliva_mnozstvi>${d.objectDetails.fuelConsumption.text}</spotreba_paliva_mnozstvi>
        <spotreba_paliva_jednotky>${t.get(d.objectDetails.fuelConsumption.chosen ?? '')}</spotreba_paliva_jednotky>
        <spotreba_paliva_2_druh>${d.objectDetails.fuelType2}</spotreba_paliva_2_druh>
        <spotreba_paliva_2_mnozstvi>${d.objectDetails.fuelConsumption2.text}</spotreba_paliva_2_mnozstvi>
        <spotreba_paliva_2_jednotky>${t.get(d.objectDetails.fuelConsumption2.chosen ?? '')}</spotreba_paliva_2_jednotky>
        <rocni_platba_vytapeni>${d.objectDetails.heatingCosts} ${t.demand.currency}</rocni_platba_vytapeni>
    </detailobjektu>
    <tc>
        <typ>${t.get(d.system.hPType ?? '')}</typ>
        <model>${t.get(d.system.hPModel ?? '')}</model>
        <nadrz>${t.get(d.system.thermalStoreType.first ?? '')} ${t.get(d.system.thermalStoreType.second ?? '')} {d.system.thermalStoreVolume}</nadrz>
        <vnitrni_jednotka>${t.get(d.system.indoorUnitType ?? '')}</vnitrni_jednotka>
    </tc>
    <zdrojeTop>
        <topne_teleso>${seCh(t, d.additionalSources.heatingHeatingElementInStore)}</topne_teleso>
        <elektrokotel>${seCh(t, d.additionalSources.heatingElectricBoiler)}</elektrokotel>
        <plyn_kotel>${seCh(t, d.additionalSources.heatingGasBoiler)}</plyn_kotel>
        <krb_KTP>${seCh(t, d.additionalSources.heatingFireplace)}</krb_KTP>
        <jiny_zdroj>${d.additionalSources.heatingOther}</jiny_zdroj>
    </zdrojeTop>
    <tv>
        <zasobnik>${t.get(d.system.waterTankType ?? '')} ${d.system.waterTankVolume}</zasobnik>
        <cirkulace>${d.system.hotWaterCirculation ? t.yes : t.no}</cirkulace>
    </tv>
    <zdrojeTV>
        <topne_teleso>${seCh(t, d.additionalSources.hotWaterHeatingElementInStore)}</topne_teleso>
        <elektrokotel>${d.additionalSources.hotWaterElectricBoiler ? t.yes : t.no}</elektrokotel>
        <plyn_kotel>${d.additionalSources.hotWaterGasBoiler ? t.yes : t.no}</plyn_kotel>
        <krb_KTP>${d.additionalSources.hotWaterFireplace ? t.yes : t.no}</krb_KTP>
        <jiny_zdroj>${d.additionalSources.hotWaterOther}</jiny_zdroj>
    </zdrojeTV>
    <bazen>
        <ohrev>${d.system.wantsPool ? t.yes : t.no}</ohrev>
        <doba_vyuzivani>${pool(d) ? '' : t.get(d.pool.usagePeriod ?? '')}</doba_vyuzivani>
        <umisteni>${pool(d) ? '' : t.get(d.pool.placement ?? '')}</umisteni>
        <zakryti>${pool(d) ? '' : t.get(d.pool.coverage ?? '')}</zakryti>
        <tvar>${pool(d) ? '' : t.get(d.pool.shape ?? '')}</tvar>
        <sirka>${d.pool.width}</sirka>
        <delka>${d.pool.length}</delka>
        <hloubka>${d.pool.depth}</hloubka>
        <prumer>${d.pool.radius}</prumer>
        <teplota>${d.pool.desiredTemperature}</teplota>
        <voda>${pool(d) ? '' : t.get(d.pool.waterType ?? '')}</voda>
    </bazen>
    <prislusenstvi>
        <hadice>${seCh(t, d.accessories.hose)}</hadice>
        <topny_kabel>${seCh(t, d.accessories.heatingCable)}</topny_kabel>
        <drzak_na_tc>${seCh(t, d.accessories.wallSupportBracket)}</drzak_na_tc>
        <pokojova_cidla_a_jednotky>${dem.accessories.roomUnitsAndSensors.options(dem)
    .zip(d.accessories.roomUnitsAndSensors)
    .filter(([, c]) => c > 0)
    .map(([k, c]) => `${c}x ${t.get(k)}`)}</pokojova_cidla_a_jednotky>
    </prislusenstvi>` : ''}${fve(d) ? `
    <fve>
        <stavajici_topeni>${d.photovoltaicPowerPlant.currentHeating}</stavajici_topeni>
        <stavajici_tuv>${d.photovoltaicPowerPlant.currentHotWater}</stavajici_tuv>
        <stavajici_zasobniky>${d.photovoltaicPowerPlant.currentTanks}</stavajici_zasobniky>
        <stavajici_spotreba>${d.photovoltaicPowerPlant.currentConsumption}</stavajici_spotreba>
        <jistic>${d.photovoltaicPowerPlant.breakerSize}</jistic>
        <sazba>${d.photovoltaicPowerPlant.tariff}</sazba>
        <umisteni_rozvadece>${d.photovoltaicPowerPlant.breakerBoxLocation}</umisteni_rozvadece>
        <pozadovany_vykon>${d.photovoltaicPowerPlant.requiredPower}</pozadovany_vykon>
        <typ_budovy_instalace>${d.photovoltaicPowerPlant.locationBuildingType}</typ_budovy_instalace>
        <hromosvod>${d.photovoltaicPowerPlant.lightningRod ? t.yes : t.no}</hromosvod>
        <material_krytiny>${d.photovoltaicPowerPlant.roofMaterial}</material_krytiny>
        <typ_tasek>${d.photovoltaicPowerPlant.tileType}</typ_tasek>
        <stari_krytiny>${d.photovoltaicPowerPlant.roofAge}</stari_krytiny>
        <pouzit_optimizatory>${d.photovoltaicPowerPlant.useOptimizers ? t.yes : t.no}</pouzit_optimizatory>
        <rozmer_1>${d.photovoltaicPowerPlant.size1}</rozmer_1>
        <orientace_1>${d.photovoltaicPowerPlant.orientation1}</orientace_1>
        <sklon_1>${d.photovoltaicPowerPlant.slope1}</sklon_1>
        <rozmer_2>${d.photovoltaicPowerPlant.size2}</rozmer_2>
        <orientace_2>${d.photovoltaicPowerPlant.orientation2}</orientace_2>
        <sklon_2>${d.photovoltaicPowerPlant.slope2}</sklon_2>
        <rozmer_3>${d.photovoltaicPowerPlant.size3}</rozmer_3>
        <orientace_3>${d.photovoltaicPowerPlant.orientation3}</orientace_3>
        <sklon_3>${d.photovoltaicPowerPlant.slope3}</sklon_3>
        <rozmer_4>${d.photovoltaicPowerPlant.size4}</rozmer_4>
        <orientace_4>${d.photovoltaicPowerPlant.orientation4}</orientace_4>
        <sklon_4>${d.photovoltaicPowerPlant.slope4}</sklon_4>
        <baterie>${d.photovoltaicPowerPlant.battery.checked ? t.yes : t.no}</baterie>
        <baterie_kapacita>${d.photovoltaicPowerPlant.battery.text}</baterie_kapacita>
        <voda>${d.photovoltaicPowerPlant.water ? t.yes : t.no}</voda>
        <sit>${d.photovoltaicPowerPlant.network.checked ? t.yes : t.no}</sit>
        <sit_vykon>${d.photovoltaicPowerPlant.network.text}</sit_vykon>
        <dobijeni>${d.photovoltaicPowerPlant.charging ? t.yes : t.no}</dobijeni>
    </fve>` : ''}
    <poznamka>
        <kontakty>${d.contacts.note}</kontakty>
        <detail_objektu>${d.objectDetails.note}</detail_objektu>
        <tv_tc_nadrz_a_os>${d.system.note}</tv_tc_nadrz_a_os>
        <bazen>${d.pool.note}</bazen>
        <doplnkove_zdroje>${d.additionalSources.note}</doplnkove_zdroje>
        <prislusenstvi>${d.accessories.note}</prislusenstvi>
        <fve>${d.photovoltaicPowerPlant.note}</fve>
    </poznamka>
</xml>`;