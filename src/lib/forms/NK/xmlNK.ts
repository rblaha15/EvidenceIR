import type { Raw } from '$lib/forms/Form';
import { get, type Translations } from '$lib/translations';
import type { SeCh } from '$lib/forms/Widget';
import type { User } from 'firebase/auth';
import { browser, dev, version } from '$app/environment';
import { type FormNK, origins } from './formNK';

const fve = (c: Raw<FormNK>) => c.contacts.demandSubject.includes(`fve`);
const hp = (c: Raw<FormNK>) => c.contacts.demandSubject.includes(`heatPump`);
const pool = (c: Raw<FormNK>) => hp(c) && c.system.wantsPool;

const seCh = <I extends string>(t: Translations, l: Record<string, string>, v: SeCh<I>) => v.checked ? get(l, v.chosen) : t.nk.no;

export default (c: Raw<FormNK>, user: User, t: Translations) => `
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
- Pokojová čidla a jednotky sjednoceny do jednoho pole (/xml/prislusenstvi/pokojova_cidla_a_jednotky)
  - Nyní mohou obsahovat více možností, oddělených čárkou
  - Každá možnost má před sebou vždy specifikován počet položek pomocí písmene x 
  - Název žádné jednotky ani čidla neobsahuje čárku
  - Příklad: \`<pokojove_cidlo>1x RS 10, 2x RDC</pokojove_cidlo>\`
-->

<xml>
    <system>
        <kod1>${origins[c.contacts.demandOrigin!]}</kod1>
        <resi_tc>${hp(c) ? t.nk.yes : t.nk.no}</resi_tc>
        <resi_fve>${fve(c) ? t.nk.yes : t.nk.no}</resi_fve>
        <resi_sol>${t.nk.no}</resi_sol>
        <resi_rek>${t.nk.no}</resi_rek>
        <resi_krb>${t.nk.no}</resi_krb>
        <resi_konz>${t.nk.no}</resi_konz>
        <resi_jine>${t.nk.no}</resi_jine>
        <resi_jine_uvedte>${t.nk.no}</resi_jine_uvedte>
        <resi_doporuc>${t.nk.no}</resi_doporuc>
        <cislo_ko>${c.other.representative?.koNumber ?? '?'}</cislo_ko>
        <odesilatel>${user.email}</odesilatel>
    </system>
    <kontakt>
        <jmeno>${c.contacts.name}</jmeno>
        <prijmeni>${c.contacts.surname}</prijmeni>
        <telefon>${c.contacts.phone}</telefon>
        <email>${c.contacts.email}</email>
        <ulice>${c.contacts.street}</ulice>
        <psc>${c.contacts.zip}</psc>
        <mesto>${c.contacts.city}</mesto>
        <partner_ico>${c.contacts.assemblyCompanyCRN}</partner_ico>
    </kontakt>${hp(c) ? `
    <detailobjektu>
        <os_popis>${get(t.nk.system, c.system.heatingSystem)}</os_popis>
        <tepelna_ztrata>${c.objectDetails.heatLost}</tepelna_ztrata>
        <rocni_spotreba_vytapeni>${c.objectDetails.heatNeedsForHeating}</rocni_spotreba_vytapeni>
        <rocni_spotreba_tv>${c.objectDetails.heatNeedsForHotWater}</rocni_spotreba_tv>
        <vytapena_plocha>${c.objectDetails.heatedArea}</vytapena_plocha>
        <vytapeny_objem>${c.objectDetails.heatedVolume}</vytapeny_objem>
        <spotreba_paliva_druh>${c.objectDetails.fuelType}</spotreba_paliva_druh>
        <spotreba_paliva_mnozstvi>${c.objectDetails.fuelConsumption.text}</spotreba_paliva_mnozstvi>
        <spotreba_paliva_jednotky>${get(t.units, c.objectDetails.fuelConsumption.chosen)}</spotreba_paliva_jednotky>
        <spotreba_paliva_2_druh>${c.objectDetails.fuelType2}</spotreba_paliva_2_druh>
        <spotreba_paliva_2_mnozstvi>${c.objectDetails.fuelConsumption2.text}</spotreba_paliva_2_mnozstvi>
        <spotreba_paliva_2_jednotky>${get(t.units, c.objectDetails.fuelConsumption2.chosen)}</spotreba_paliva_2_jednotky>
        <rocni_platba_vytapeni>${c.objectDetails.heatingCosts} ${t.nk.currency}</rocni_platba_vytapeni>
    </detailobjektu>
    <tc>
        <typ>${get(t.nk.system, c.system.hPType)}</typ>
        <model>${get(t.nk.system, c.system.hPModel)}</model>
        <nadrz>${c.system.thermalStore}</nadrz>
        <vnitrni_jednotka>${get(t.nk.system, c.system.indoorUnitType)}</vnitrni_jednotka>
    </tc>
    <zdrojeTop>
        <topne_teleso>${seCh(t, t.nk.additionalSources, c.additionalSources.heatingHeatingElementInStore)}</topne_teleso>
        <elektrokotel>${seCh(t, t.nk.additionalSources, c.additionalSources.heatingElectricBoiler)}</elektrokotel>
        <plyn_kotel>${seCh(t, t.nk.additionalSources, c.additionalSources.heatingGasBoiler)}</plyn_kotel>
        <krb_KTP>${seCh(t, t.nk.additionalSources, c.additionalSources.heatingFireplace)}</krb_KTP>
        <jiny_zdroj>${c.additionalSources.heatingOther}</jiny_zdroj>
    </zdrojeTop>
    <tv>
        <zasobnik>${c.system.waterTank}</zasobnik>
        <cirkulace>${c.system.hotWaterCirculation ? t.nk.yes : t.nk.no}</cirkulace>
    </tv>
    <zdrojeTV>
        <topne_teleso>${seCh(t, t.nk.additionalSources, c.additionalSources.hotWaterHeatingElementInStore)}</topne_teleso>
        <elektrokotel>${c.additionalSources.hotWaterElectricBoiler ? t.nk.yes : t.nk.no}</elektrokotel>
        <plyn_kotel>${c.additionalSources.hotWaterGasBoiler ? t.nk.yes : t.nk.no}</plyn_kotel>
        <krb_KTP>${c.additionalSources.hotWaterFireplace ? t.nk.yes : t.nk.no}</krb_KTP>
        <jiny_zdroj>${c.additionalSources.hotWaterOther}</jiny_zdroj>
    </zdrojeTV>
    <bazen>
        <ohrev>${c.system.wantsPool ? t.nk.yes : t.nk.no}</ohrev>
        <doba_vyuzivani>${pool(c) ? '' : get(t.nk.pool, c.pool.usagePeriod)}</doba_vyuzivani>
        <umisteni>${pool(c) ? '' : get(t.nk.pool, c.pool.placement)}</umisteni>
        <zakryti>${pool(c) ? '' : get(t.nk.pool, c.pool.coverage)}</zakryti>
        <tvar>${pool(c) ? '' : get(t.nk.pool, c.pool.shape)}</tvar>
        <sirka>${c.pool.width}</sirka>
        <delka>${c.pool.length}</delka>
        <hloubka>${c.pool.depth}</hloubka>
        <prumer>${c.pool.radius}</prumer>
        <teplota>${c.pool.desiredTemperature}</teplota>
        <voda>${pool(c) ? '' : get(t.nk.pool, c.pool.waterType)}</voda>
    </bazen>
    <prislusenstvi>
        <hadice>${seCh(t, t.nk.accessories, c.accessories.hose)}</hadice>
        <topny_kabel>${seCh(t, t.nk.accessories, c.accessories.heatingCable)}</topny_kabel>
        <drzak_na_tc>${seCh(t, t.nk.accessories, c.accessories.wallSupportBracket)}</drzak_na_tc>
        <pokojova_cidla_a_jednotky>${c.accessories.roomUnitsAndSensors
    .filterValues((_, c) => c > 0)
    .mapTo((k, c) => `${c}x ${get(t.nk.accessories, k)}`)
    .join()}</pokojova_cidla_a_jednotky>
    </prislusenstvi>` : ''}${fve(c) ? `
    <fve>
        <stavajici_topeni>${c.photovoltaicPowerPlant.currentHeating}</stavajici_topeni>
        <stavajici_tuv>${c.photovoltaicPowerPlant.currentHotWater}</stavajici_tuv>
        <stavajici_zasobniky>${c.photovoltaicPowerPlant.currentTanks}</stavajici_zasobniky>
        <stavajici_spotreba>${c.photovoltaicPowerPlant.currentConsumption}</stavajici_spotreba>
        <jistic>${c.photovoltaicPowerPlant.breakerSize}</jistic>
        <sazba>${c.photovoltaicPowerPlant.tariff}</sazba>
        <umisteni_rozvadece>${c.photovoltaicPowerPlant.breakerBoxLocation}</umisteni_rozvadece>
        <pozadovany_vykon>${c.photovoltaicPowerPlant.requiredPower}</pozadovany_vykon>
        <typ_budovy_instalace>${c.photovoltaicPowerPlant.locationBuildingType}</typ_budovy_instalace>
        <hromosvod>${c.photovoltaicPowerPlant.lightningRod ? t.nk.yes : t.nk.no}</hromosvod>
        <material_krytiny>${c.photovoltaicPowerPlant.roofMaterial}</material_krytiny>
        <typ_tasek>${c.photovoltaicPowerPlant.tileType}</typ_tasek>
        <stari_krytiny>${c.photovoltaicPowerPlant.roofAge}</stari_krytiny>
        <pouzit_optimizatory>${c.photovoltaicPowerPlant.useOptimizers ? t.nk.yes : t.nk.no}</pouzit_optimizatory>
        <rozmer_1>${c.photovoltaicPowerPlant.size1}</rozmer_1>
        <orientace_1>${c.photovoltaicPowerPlant.orientation1}</orientace_1>
        <sklon_1>${c.photovoltaicPowerPlant.slope1}</sklon_1>
        <rozmer_2>${c.photovoltaicPowerPlant.size2}</rozmer_2>
        <orientace_2>${c.photovoltaicPowerPlant.orientation2}</orientace_2>
        <sklon_2>${c.photovoltaicPowerPlant.slope2}</sklon_2>
        <rozmer_3>${c.photovoltaicPowerPlant.size3}</rozmer_3>
        <orientace_3>${c.photovoltaicPowerPlant.orientation3}</orientace_3>
        <sklon_3>${c.photovoltaicPowerPlant.slope3}</sklon_3>
        <rozmer_4>${c.photovoltaicPowerPlant.size4}</rozmer_4>
        <orientace_4>${c.photovoltaicPowerPlant.orientation4}</orientace_4>
        <sklon_4>${c.photovoltaicPowerPlant.slope4}</sklon_4>
        <baterie>${c.photovoltaicPowerPlant.battery.checked ? t.nk.yes : t.nk.no}</baterie>
        <baterie_kapacita>${c.photovoltaicPowerPlant.battery.text}</baterie_kapacita>
        <voda>${c.photovoltaicPowerPlant.water ? t.nk.yes : t.nk.no}</voda>
        <sit>${c.photovoltaicPowerPlant.network.checked ? t.nk.yes : t.nk.no}</sit>
        <sit_vykon>${c.photovoltaicPowerPlant.network.text}</sit_vykon>
        <dobijeni>${c.photovoltaicPowerPlant.charging ? t.nk.yes : t.nk.no}</dobijeni>
    </fve>` : ''}
    <poznamka>
        <kontakty>${c.contacts.note}</kontakty>
        <detail_objektu>${c.objectDetails.note}</detail_objektu>
        <tv_tc_nadrz_a_os>${c.system.note}</tv_tc_nadrz_a_os>
        <bazen>${c.pool.note}</bazen>
        <doplnkove_zdroje>${c.additionalSources.note}</doplnkove_zdroje>
        <prislusenstvi>${c.accessories.note}</prislusenstvi>
        <fve>${c.photovoltaicPowerPlant.note}</fve>
    </poznamka>
</xml>`.trimStart();