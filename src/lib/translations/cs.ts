// noinspection SpellCheckingInspection

import { template as t } from '$lib/helpers/templates';

export default {
    controllerRegistration: `Registrace nového regulátoru`,
    longAppName: `SEIR – Evidence regulátorů IR`,
    appName: `SEIR`,
    requiredField: `Toto pole je povinné`,
    irFVE: `Žádný – pouze FVE`,
    controllerType: `Typ regulátoru`,
    serialNumber: `Sériové číslo regulátoru`,
    serialNumberIndoor: `Sériové číslo vnitřní jednotky`,
    recognised: t`Rozpoznáno: ${0}`,
    newSerialNumber: `Nové sériové číslo`,
    wrongNumberFormat: `Nesprávný formát čísla`,
    heatPumpType: `Typ tepelného čerpadla`,
    heatPumpsType: `Typ tepelných čerpadel`,
    airToWater: `vzduch/voda`,
    groundToWater: `země/voda`,
    hpCount: 'Počet tepelných čerpadel',
    heatPumpModelNr: t`Model ${0}tepelného čerpadla`,
    noPump: `Žádný`,
    first: `prvního`,
    second: `druhého`,
    third: `třetího`,
    fourth: `čtvrtého`,
    fifth: `pátého`,
    sixth: `šestého`,
    seventh: `sedmého`,
    eighth: `osmého`,
    ninth: `devátého`,
    tenth: `desátého`,
    heatPumpManufactureNumberNr: t`Výrobní číslo ${0} tepelného čerpadla`,
    endUser: `Koncový uživatel`,
    individual: `Jednotlivec (FO)`,
    company: `Společnost (PO)`,
    name: `Jméno`,
    surname: `Příjmení`,
    birthday: `Datum narození`,
    companyName: `Název`,
    wrongCompanyType: `Pozor, zadaná forma společnosti není správně formátovaná!`,
    establishment: `Pobočka/závod`,
    wrongDateFormat: `Nesprávný formát datumu`,
    phone: `Telefon`,
    wrongPhoneFormat: `Nesprávný formát telefoního čísla`,
    email: `Email`,
    wrongEmailFormat: `Nesprávný formát emailu`,
    realizationLocation: `Místo realizace`,
    town: `Obec`,
    street: `Číslo popisné nebo ulice a číslo orientační`,
    zip: `Poštovní směrovací číslo`,
    wrongZIPFormat: `Nesprávný formát PSČ`,
    assemblyCompany: `Montážní firma`,
    crn: `IČO`,
    wrongCRNFormat: `Nesprávný formát IČO`,
    representativeName: `Jméno zástupce`,
    commissioning: `Uvedení do provozu`,
    dateOfCommission: `Datum uvedení`,
    commissionedByAssemblyCompany: `Do provozu uváděla montážní firma`,
    remoteAccess: `Vzdálený přístup`,
    doYouWantRemoteAccess: `Založit vzdálený přístup k regulátoru`,
    whoHasAccess: `Kdo k němu bude mít přístup?`,
    endCustomer: `Koncový zákazník`,
    commissioningCompany: `Firma uvádějicí do provozu`,
    whoWillBeInvoiced: `Komu bude vzdálený přístup fakturován? (jednorázová cena 1000 Kč včetně DPH)`,
    doNotInvoice: `Nefakturovat`,
    responsiblePerson: `Zodpovědná osoba`,
    chosenCompany: `Vybraná firma`,
    chosenFile: `Vybráno:`,
    cancel: `Zrušit`,
    close: `Zavřít`,
    settings: {
        title: `Nastavení`,
        userSettings: `Uživatelská nastavení`,
        appTheme: `Téma aplikace`,
        language: `Jazyk`,
        appInfo: `Informace o aplikaci`,
        appVersion: t`Verze aplikace: ${'version'} (${'build'}) (${'type'})`,
        clearBrowserData: `Vyčistit data z prohlížeče`,
        clearDataInfo: `Data stránky v prohlížeči obsahují vaše uživatelská nastavení, stránky uložené do offline režimu, offline frontu neodeslaných dat a všechny rozepsané formuláře. Neodstraní se žádná data, která již byla uložena a odeslána na server. Nebudete odhlášeni ze svého účtu.`,
    },
    password: `Heslo`,
    confirmPassword: `Potvrdit heslo`,
    no_Person: `Žádná`,
    notChosen: `Nevybráno`,
    unknown_Company: `Neznámá`,
    checkInternet: `Zkontrolujte připojení k internetu!`,
    nonexistentEmailHtml: t`Takový účet neexistuje! <a href="${'link'}">Vytvořit ho?</a>`,
    wrongPasswordHtml: t`Špatné heslo! <a href="${'link'}">Zapomenuté heslo?</a>`,
    tooManyRequests: `Moc žádostí! Počkejte prosím chvíli`,
    somethingWentWrong: `Něco se nepovedlo :\\`,
    somethingWentWrongContactUsHtml: `Omlouváme se, něco se nepovedlo, kontaktujte nás prosím na <a href="mailto:Regulus SEIR<aplikace.regulus@gmail.com>?subject=Chyba při ukládání formuláře" target="_blank">aplikace.regulus@gmail.com</a>`,
    passwordTooWeak: `Heslo je příliš slabé!`,
    pleaseUseBusinessEmail: `Prosím zadejte Váš firemní email`,
    emailInUse: `Tento účet již existuje`,
    passwordsDoNotMatch: `Hesla se neshodují!`,
    save: `Uložit`,
    saveAndSend: `Uložit a odeslat emaily`,
    saving: `Ukládání...`,
    youHaveAMistake: t`Ve formuláři máte chybu. Prosím, zkontrolujte vyplněné informace. Chybná pole: ${'fields'}`,
    logInNeeded: `Pro zobrazení a vyplnění formuláře je nutné se přihlásit!`,
    evidenceDetailsHtml: t`Podrobnosti o instalaci s ${'irType'} ${'irNumber'}`,
    evidenceDetails: `Podrobnosti o instalaci`,
    protocolDetails: `Podrobnosti protokolu`,
    loadingData: `Načítání dat...`,
    sorrySomethingWentWrong: `Omlouváme se, něco se nepovedlo.`,
    offline: `Jste offline!`,
    linkInvalid: `Buď záznam o evidenci neexistuje nebo k němu nemáte přístup.`,
    linkToThis: `Odkaz na tuto stránku`,
    copy: `Kopírovat`,
    regulusRouteForm: `Souhlas s RegulusRoute`,
    regulusRouteTitle: `Souhlas se zpřístupněním regulátoru IR službě RegulusRoute`,
    openPdf: `Otevřít pdf`,
    changeLang: `Změnit jazyk`,
    deleteThisEvidence: `Odstranit tento záznam evidence`,
    signUp: `Registrace`,
    toSignUp: `Registrovat`,
    back: `Zpět`,
    logIn: `Přihlášení`,
    toLogIn: `Přihlásit se`,
    toLogOut: `Odhlásit se`,
    dontHaveAccount: `Nemáte účet?`,
    or: `nebo`,
    scanBarcode: `Naskenujte čárový kód z TČ`,
    scanCode: `Naskenujte kód`,
    residence: `Bydliště`,
    headquarters: `Sídlo`,
    whatToAddInfoTo: `K čemu byste chtěli přidat podrobnější informace?`,
    heatPump: `Tepelné čerpadlo`,
    heatPumps: `Tepelná čerpadla`,
    solarCollector: `Solární kolektor`,
    solarSystem: `Solární systém`,
    solarCollectorType: `Typ solárního kolektoru`,
    solarCollectorCount: `Počet solárních kolektorů`,
    ventilation: `Větrání s rekuperací tepla`,
    recoveryVentilationUnitType: `Typ rekuperační jednotky`,
    photovoltaicPowerPlant: 'Fotovoltaická elektrárna',
    otherDevice: 'Jiné zařízení',
    fve: {
        onFamilyHouse: 'Na rodinném domě',
        onOtherBuilding: 'Na jiné stavbě',
        onLand: 'Na pozemku',
        withNetworkSupplyPossibility: 'S možností dodávky do sítě (provedeno PPP)',
        withoutOverflows: 'Systém bez přetoků',
        islandSystem: 'Ostrovní systém',
        otherPanels: 'Jiné (nejsou od firmy Regulus)',
    },
    pleaseFillInIrType: `Prosím, vyplňte typ IR.`,
    fillInPassword: `Prosím, zadejte heslo.`,
    independentServiceProtocol: `Nezávislý servisní protokol`,
    search: `Vyhledat`,
    controllerSearch: `Vyhledávání instalací`,
    searching: `Vyhledávání`,
    controllerAndServiceProtocolSearch: `Vyhledávání instalací a nezávislých servisních protokolů`,
    new: `Nová registrace`,
    changeController: `Změnit sériové číslo regulátoru`,
    confirm: `Potvrdit`,
    changeWentWrong: `Něco ne nepovedlo. Obnovte stránku a zkuste to znovu.`,
    note: `Poznámka`,
    routeGuide: `Návod na přihlášení k regulátoru`,
    warrantyNr: t`Záruční list TČ${'n'} (${'cislo'})`,
    heatPumpCommissionProtocol: `Protokol o instalaci TČ`,
    heatPumpCommissionProtocolTitle: `Protokol o uvedení tepelného čerpadla do trvalého provozu`,
    solarCollectorCommissionProtocol: `Protokol o uvedení solárního systému do trvalého provozu`,
    photovoltaicSystemCommissionProtocol: `Protokol o uvedení fotovoltaického systému do trvalého provozu`,
    yearlyHPCheckNr: t`Roční kontrola TČ${0}`,
    yearlyCheckTitle: `Popis úkonů při provádění preventivní roční prohlídky vzduchového tepelného čerpadla`,
    doYearlyCheckNr: t`Udělat roční kontrolu TČ${'n'}`,
    checkDate: `Datum kontroly`,
    filledYearlyCheckNr: t`Roční kontroly TČ${'n'} (${'cislo'})`,
    searchCompanyInList: `Vyhledat firmu v seznamu`,
    searchRepresentative: `Vyhledat zástupce`,
    representative: `Zástupce`,
    newPassword: `Nové heslo`,
    sendConfirmEmail: `Odeslat potvrzovací email`,
    passwordReset: `Obnovení hesla`,
    passwordResetEmailHtml: t`<p>Dobrý den,</p>
<p>pomocí tohoto odkazu můžete obnovit heslo pro aplikaci Evidence IR pro váš účet ${'email'}:</p>
<p><a href="${'link'}">${'link'}</a></p>
<p>Pokud jste o obnovení hesla nepožádali, můžete tento e-mail ignorovat.</p>
<p>S pozdravem</p>
<p>Evidence IR</p>`,
    emailNotSent: t`Email se nepodařilo odeslat: ${'status'} ${'statusText'}`,
    redirectFailedHtml: t`Přesměrování se nezdařilo. Prosím, přejděte na tuto adresu: <a href="${'link'}">${'link'}</a>`,
    irExistsHtml: t`Tento regulátor je již zaevidovaný (<a href="${'link'}">detail</a>)`,
    editRegistration: `Upravit údaje o instalaci`,
    viewInfo: `Zobrazit vyplněné údaje`,
    sendDocuments: `Odeslat podepsané dokumenty`,
    requiresLogIn: `Tato stránka vyžaduje přihlášení.`,
    emptyForm: `Vymazat data`,
    importData: `Importovat data`,
    siteNotFound: `Stránka nenalezena.`,
    changePassword: `Změnit heslo`,
    year: `Rok`,
    redirecting: `Přesměrování…`,
    editing: `Editace`,
    passwordEdited: `Heslo upraveno, přihlašte se prosím`,
    registered: `Registrace proběhla úspěšně, přihlašte se prosím`,
    passwordHasBeenReset: `Heslo resetováno, přihlašte se prosím`,
    yes: 'Ano',
    no: 'Ne',
    iDoNotKnow: 'Nevím',
    clearSelection: `Vymazat výběr`,
    commission: 'Zaznamenat uvedení do provozu',
    hpWarranty: `Záruční list tepelného čerpadla`,
    performingPerson: `Provádějící osoba`,
    samePlaceAsResidence: `Shodné s bydlištěm`,
    samePlaceAsHeadquarters: `Shodné se sídlem`,
    agreeWIthRRPrice: `Souhlasím s jednorázovou cenou 1000 Kč včetně DPH za tuto službu.`,
    suits: `vyhovuje`,
    suitsNot: `nevyhovuje`,
    characteristicsAndSizeOfHeatPumpBreaker: `Charakteristika a velikost jističe TČ`,
    characteristicsAndSizeOfIndoorUnitBreaker: `Charakteristika a velikost jističe vnitřní jednotky`,
    distanceFromWall: `Vzdálenost TČ od zdi`,
    isCompensatorInstalled: `Instalován kompenzátor pro zvýšení ochrany výměníku TČ`,
    isCirculationPumpFilterInstalled: `Instalován filtr oběhového čerpadla na zpátečce k TČ`,
    tanks: `Nádrže`,
    typeOfAccumulationTank: `Typ akumulační nádrže`,
    typeOfStorageTank: `Typ zásobníku`,
    heatingSystem: `Otopný systém`,
    heatingSystemConsistsOf: `Otopný systém tvoří`,
    radiators: `Radiátory`,
    underfloorHeating: `Podlahové topení`,
    combinationHeating: `Kombinace (podlahové topení a radiátory)`,
    otherHeatingSystem: `Jiné`,
    isAdditionalHeatingSourceConnected: `V systému je připojen doplňkový zdroj topení`,
    typeAndPowerOfAdditionalHeatingSource: `Typ a výkon doplňkového zdroje pro topení`,
    doesHeatPumpPrepareHotWater: `TČ připravuje i teplou vodu`,
    additionalHotWaterSource: `Doplňkový zdroj přípravy teplé vody`,
    mainHotWaterSource: `Hlavní zdroj přípravy teplé vody`,
    volumeOfExpansionTankOfHeatingSystem: `Objem expanzní nádoby otopného systému`,
    pressureOfExpansionTankOfHeatingSystem: `Nastavený tlak v expanzní nádobě otopného systému`,
    pressureOfHeatingSystem: `Nastavený tlak v otopném systému`,
    volumeOfExpansionTankForWater: `Objem expanzní nádoby pitné vody`,
    pressureOfExpansionTankForWater: `Nastavený tlak v expanzní nádobě pitné vody`,
    isPoolHeatingManagedByHeatPump: `Prostřednictvím tepelného čerpadla je také řešen ohřev bazénu`,
    controlAndElectricalInstallation: `Regulace a elektroinstalace`,
    internetConnection: `Připojení k internetu`,
    connectedViaRegulusRoute: `Připojen pomocí RegulusRoute`,
    connectedWithPublicIpAddress: `Připojen veřejnou IP adresou`,
    notConnected: `Nepřipojen`,
    isElectricalBondingComplete: `Bylo provedeno kompletní elektrické pospojení`,
    areElectricalDevicesTested: `Byly odzkoušeny všechny elektrické spotřebiče zapojené do regulace`,
    isBackupPowerSourceInstalled: `Je instalován záložní zdroj oběhového čerpadla`,
    primaryCircuit: `Primární okruh`,
    typeOfPrimaryCircuit: `Typ primárního okruhu`,
    groundBoreholes: `Hlubinné vrty`,
    surfaceCollector: `Plošný kolektor`,
    otherCollector: `Jiné`,
    numberAndDepthOfBoreholes: `Počet a hloubka vrtů`,
    numberAndLengthOfCircuits: `Počet a délka okruhů`,
    collectorDescription: `Popis okruhu`,
    heatingSystemDescription: `Popis systému`,
    typeOfAntifreezeMixture: `Typ použité nemrznoucí směsi`,
    onPrimaryCircuitInstalled: `Na primárním okruhu byla instalována`,
    expansionTankInstalled: `expanzní nádoba`,
    bufferTankInstalled: `vyrovnávací nádrž`,
    wasPrimaryCircuitTested: `Provedeno řádné odvzdušení a tlaková zkouška primárního okruhu`,
    commissioningSteps: `Informace o krocích provedených v průběhu uvádění do provozu`,
    wasInstallationAccordingToManual: `Instalace a uvedení do provozu tepelného čerpadla byla provedena dle podmínek uvedených v návodu na montáž, připojení a obsluhu, instalačních podmínek a obecně platných norem`,
    wasControllerSetToParameters: `Regulátor tepelného čerpadla byl nastaven na předepsané parametry`,
    wasOwnerFamiliarizedWithFunction: `Vlastník nebo provozovatel byl seznámen se základní funkcí tep. čerpadla a jeho obsluhou`,
    isExtendedWarrantyDesired: `Má vlastník TČ zájem o prodlouženou záruku?`,
    isInstallationInWarrantyConditions: `Instalace a uvedení do provozu jsou v souladu s podmínkami prodloužené záruky`,
    successfullyDeleted: `Záznam úspěšně odstraněn`,
    mandatoryFields: `povinná pole`,
    cascadeSee: `kaskáda – viz níže`,
    cascade: `Kaskáda:`,
    pumpDetails: t`TČ${'n'}: ${'model'} – ${'cislo'}`,
    theme: {
        dark: 'Tmavý',
        light: 'Světlý',
        auto: 'Podle prohlížeče',
    },
    sp: {
        yearlyHPCheck: `Roční kontrola TČ`,
        warrantyRepair: `Záruční oprava`,
        postWarrantyRepair: `Pozáruční oprava`,
        installationApproval: `Schválení instalace`,
        otherType: `Jiné`,
        regulusRoute: `RegulusRoute`,
        extendedWarranty: `Prodloužená záruka`,
        warrantyExtended: `Prodloužená`,
        warrantyCommon: `Běžná`,
        commissioningTC: `Uvedení TČ do provozu`,
        commissioningSOL: `Uvedení SOL do provozu`,
        commissioningFVE: `Uvedení FVE do provozu`,
        withoutCode: `Obchodní činnost`,
        yearlySOLCheck: `Roční kontrola SOL`,
        technicalAssistance: `Technická pomoc`,
        assemblyWork: `Montážní práce`,
        technicalAssistance12: `Technická pomoc – 12% DPH`,
    },
    check: {
        kontrolniElektroinstalace: 'Kontrolní elektroinstalace',
        kontrolniUkonyTepelnehoCerpadla: 'Kontrolní úkony tepelného čerpadla',
        kontrolniUkonyRegulace: 'Kontrolní úkony regulace',
        kontrolniUkonyOtopneSoustavy: 'Kontrolní úkony otopné soustavy',
        kontrolaZasobnikuTv: 'Kontrola zásobníku TV',
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: 'Kontrola funkce všech elektrických spotřebičů zapojených do regulace',
        kontrolaDotazeniSvorkovychSpoju: 'Kontrola dotažení svorkových spojů',
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: 'Vizuální kontrola všech přístupných vodičů v instalaci (natavení, mech.poškození)',
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: 'Kontrola sepnutí dohřevu (sepnutí stykače, případně relé)',
        kontrolaChoduKompresoru: 'Kontrola chodu kompresoru',
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: 'Optická kontrola těsnosti trubkových spojů jednotky a chladivového okruhu',
        kontrolaOdvoduKondenzatu: 'Kontrola odvodu kondenzátu',
        kontrolaUchyceniVentilatoru: 'Kontrola uchycení ventilátoru',
        vycisteniVzduchovychCestJednotky: 'Vyčištění vzduchových cest jednotky',
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: 'Kontrola lamel výparníku, případné odstranění nečistot vzduchem',
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: 'Prověřit, zda nic nebrání optimální cirkulaci vzduchu',
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: 'Kontrola teplotního rozdílu tepelného čerpadla dle návodu',
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: 'Kontrola elektrické části jednotky tepelného čerpadla',
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: 'Kontrola chybových a informačních hlášení regulátoru a jejich příčin',
        kontrolaNastaveniParametruRegulatoru: 'Kontrola nastavení parametrů regulátoru',
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: 'Preventivní proškolení obsluhy z hlediska uživatelského nastavení',
        stavPocitadlaCelkovychProvoznichHodinKompresoru: 'Stav počítadla celkových provozních hodin kompresoru',
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: 'Stav počítadla provozních hodin do TV (umožňuje-li to regulace)',
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: 'Stav celkového počtu startů tep. čerpadla (umožňuje-li to regulace)',
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: 'Stav počtu startů tepel. čerpadla do TV (umožňuje-li to regulace)',
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: 'Stav počítadla celkových provozních hodin doplňkového zdroje',
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: 'Stav počítadla celkových provozních hodin doplňkového zdroje TV',
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: 'Průměrná celková doba chodu kompresoru [min] - od poslední kontroly',
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: 'Průměrná doba chodu kompresoru do TV [min] - od poslední kontroly',
        kontrolaFunkceObehovychCerpadel: 'Kontrola funkce oběhových čerpadel',
        vycisteniFiltruObehovychCerpadel: 'Vyčištění filtrů oběhových čerpadel',
        odvzdusneniZdrojeTc: 'Odvzdušnění zdroje (TČ)',
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: 'Kontrola funkce všech motorických ventilů (směšovací, zónových)',
        kontrolaTesnostiOtopneSoustavy: 'Kontrola těsnosti otopné soustavy',
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: 'Kontrola tlaku v expanzní nádobě otopné soustavy',
        nastavenyTlakPriUvadeniDoProvozu: 'Nastavený tlak při uvádění do provozu',
        pripadneProvedteKontroluTlakuVOtopneSoustave: 'Případně proveďte kontrolu tlaku v otopné soustavě',
        kontrolaMgAnodyVZasobnikuPripVymena: 'Kontrola Mg anody v zásobníku, příp. výměna',
        kontrolaPojistovacihoVentilu: 'Kontrola pojišťovacího ventilu',
        pripadneProvedteKontroluTlakuVEnTepleVody: 'Případně proveďte kontrolu tlaku v EN pitné vody',
    },
    demand: {
        demandForm: 'Dotazník poptávky',
        contacts: {
            contacts: 'Kontakty a místo realizace',
            surname: 'Příjmení',
            name: 'Jméno',
            street: 'Ulice, č. p.',
            city: 'Město',
            zip: 'PSČ',
            phone: 'Telefon',
            email: 'Email',
            chooseAssemblyCompanyHere: 'Vyberte montážní firmu:',
            chooseCompany: 'Vybrat firmu',
            chooseAssemblyCompany: 'Vyberte montážní firmu',
            searchCompany: 'Vyhledat firmu',
            crn: 'IČO monážní firmy',
            demandOrigin: 'Původ poptávky',
            originQuestionEmail: 'Dotaz poslaný emailem od koncového zákazníka',
            originQuestionExhibition: 'Dotaz z výstavy',
            originQuestionInPerson: 'Dotaz při osobní návštěvě u koncového zákazníka',
            originDistributionCompany: 'Poptávka od distribuční firmy',
            originAssembleres: 'Poptávka od montážníků',
            originDesigner: 'Poptávka od projektanta',
            demandSubject: 'Předmět poptávky',
            heatPump: 'Tepelné čerpadlo',
            fve: 'FVE',
        },
        objectDetail: {
            objectDetail: 'Detail objektu',
            heatLoss: 'Tepelná ztráta',
            heatNeedsForHeating: 'Potřeba tepla – vytápění',
            heatNeedsForHotWater: 'Potřeba tepla – teplá voda',
            area: 'Vytápěná plocha',
            volume: 'Vytápěný objem',
            costs: 'Náklady na vytápění',
            type: 'Druh paliva',
            usage: 'Spotřeba paliva',
            type2: 'Druh 2. paliva',
            usage2: 'Spotřeba 2. paliva',
        },
        fve: {
            fve: 'FVE',
            currentSituation: 'Současný stav',
            currentHeating: 'Současný zdroj vytápění',
            currentHotWater: 'Současný zdroj přípravy teplé vody',
            currentTanks: 'Instalované nádrže/zásobníky',
            currentConsumption: 'Aktuální roční spotřeba el. energie',
            breakerSize: 'Velikost hlavního jističe',
            tariff: 'Sazba',
            breakerBoxLocation: 'Umístění domovního rozvaděče',
            requirements: 'Požadavky na FVE',
            requiredPower: 'Požadovaný výkon',
            locationBuidingType: 'Typ budovy pro instalaci kolektorů',
            lightningRod: 'Na střeše pro instalaci je umístěn hromosvod',
            familyHouseEtc: 'Rodinný dům, stodola, pergola, …',
            avaiableAreas: 'Dostupné plochy pro instalaci',
            roofMaterial: 'Materiál střesní krytiny',
            roofAge: 'Stáří střešní krytiny',
            tile: 'Taška',
            tileType: 'Typ tašek',
            metalSheetFolded: 'Plech falcovaný',
            metalSheetTrapezoidal: 'Plech trapézový',
            foil: 'Fólie',
            asphaltShingle: 'Asfaltový šindel',
            useOptimizers: 'Použít optimizéry',
            size: t`Rozměr ${0}. plochy`,
            orientation: t`Orientace ${0}. plochy`,
            slope: t`Sklon ${0}. plochy`,
            battery: 'Akumulace do baterií',
            batteryCapacity: 'Kapacita baterií',
            water: 'Akumulace do vody',
            network: 'Přetoky do sítě',
            networkPower: 'Přetoky do sítě – rezervovaný výkon',
            charging: 'Dobíjecí stanice – wallbox',
        },
        system: {
            system: 'Systém',
            hPType: 'Typ tepelného čerpadla',
            hPModel: 'Model tepelného čerpadla',
            storeType: 'Typ nádrže',
            storeNone: 'Žádná',
            storeVolume: 'Objem nádrže',
            tankType: 'Typ zásobníku',
            tankNone: 'Žádná',
            tankVolume: 'Objem zásobníku',
            indoorUnitType: 'Typ vnitřní jednotky',
            indoorUnitNone: 'Žádná',
            heatingSystem: 'Otopný systém',
            heatingSystem1circuit: '1 otopný okruh',
            heatingSystem2circuits: '2 otopné okruhy',
            heatingSystem3circuits: '3 otopné okruhy',
            heatingSystemInvertor: 'Invertor na přímo',
            heatingSystemOther: 'Jiný',
            hotWaterCirculation: 'Cirkulace teplé vody',
            poolHeating: 'Ohřev bazénu',
            airToWater: 'vzduch/voda',
            groundToWater: 'země/voda',
        },
        pool: {
            pool: 'Bazén',
            usagePeriod: 'Doba využívání',
            periodYearlong: 'celeroční',
            periodSeasonal: 'sezónní',
            location: 'Umístění',
            locationOutdoor: 'venkovní',
            locationIndoor: 'vnitřní',
            waterType: 'Druh vody',
            freshType: 'sladká',
            saltType: 'slaná',
            shape: 'Tvar',
            shapeRectangle: 'obdélníkový',
            shapeOval: 'oválný',
            shapeCircle: 'kruhový',
            length: 'Délka',
            width: 'Šířka',
            radius: 'Průměr',
            depth: 'Hloubka',
            coverage: 'Zakrytí',
            coverageNone: 'žádné',
            coverageSolid: 'pevná střecha',
            coveragePolycarbonate: 'polykarbonát',
            coverageOther: 'jiné',
            temperature: 'Požadovaná teplota',
        },
        additionalSources: {
            sources: 'Doplňkové zdroje',
            hotWater: 'Teplá voda',
            heating: 'Topení',
            heatingElement: 'Topné těleso v nádrži',
            electricBoiler: 'Elektrokotel',
            gasBoiler: 'Plynový kotel',
            fireplace: 'Krb nebo kotel na tuhá paliva',
            newNeuter: 'nové',
            newMasculine: 'nový',
            existing: 'stávající',
            toSocket: 'do zásuvky',
            fromRegulation: 'ovládané z regulace',
            otherSource: 'Jiný',
        },
        accessories: {
            accessories: 'Příslušenství',
            hose: 'Hadice',
            wallSupportBracket: 'Držák pro TČ',
            roomUnitsAndSensors: 'Pokojové jednotky a čidla',
            heatingCable: 'Topný kabel',
            onWall: 'Na stěnu',
            onIsolatedWall: 'Na izolovanou stěnu',
        },
        logIn: {
            logIn: 'Přihlášení',
            internetNeeded: 'Pro přihlášení je potřeba připojení k internetu!',
            iAmEmploee: 'Jsem zaměstanec Regulusu',
            iAmNotEmploee: 'Nejsem zaměstanec Regulusu',
            yourRepresentative: 'Váš obchodní zástupce',
            yourName: 'Vaše jméno',
            yourSurname: 'Vaše příjmení',
            yourCrn: 'Vaše IČO (nepovinné)',
            yourEmail: 'Váš email',
            chooseYourself: 'Vyber se:',
            selectedFullName: t`Jméno a příjmení: ${'jmeno'} ${'prijmeni'}`,
            selectedEmail: t`Email: ${'email'}`,
            selectedCode: t`Číslo KO: ${'kod'}`,
            selectedCrn: t`IČO: ${'ico'}`,
            nameAndSurname: 'Jméno a příjmení:',
            email: 'Email:',
            code: 'Číslo KO:',
            crn: 'IČO:',
            addMoreInfo: 'Doplntě, prosím, ještě nějaké informace o Vás:',
            youAreNotLoggedIn: 'Nejste přihlášeni!',
            logOut: 'Odhlásit se',
            representativeNeeded: 'Je potřeba vybrat obchodního zástupce',
            emailNeeded: 'Je potřeba vyplnit email',
            surnameNeeded: 'Je potřeba vyplnit příjmení',
            nameNeeded: 'Je potřeba vypllnit jméno',
        },
        export: {
            sending: 'Odesílání',
            emailIsBeingSend: 'Email se odesílá',
            emailSuccessfullySent: 'Email byl úspěšně odeslán!',
            doYouWantToSend: 'Odeslat?',
            missingField: 'Nevyplněné pole',
            pleaseFillInField: t`Pro odeslání prosím vyplňte ${'field'}.`,
            doYouReallyWantToSend: t`Opravdu chcete odeslat email na "${'email'}"?`,
            emailNotSent: t`Omlouvám se, ale email se nepodařilo odeslat. ${'chyba'}`,
            doYouRellyWantToRemoveData: 'Chcete odstranit všechna data?',
            youAreOffline: 'Pravděpodobně nejste připojeni k internetu. Zkontrolujte připojení a zkuste to znovu',
            errorReported: 'Chyba byla nahlášena.',
            send: 'Odeslat',
            nameAndSurnameNeeded: 'Je potřeba zadat alespoň jméno a příjmení',
            removeAll: 'Odstranit vše',
            thisIsTheIssue: 'Toto je chyba:',
            moreInfo: 'Podrobnější informace',
        },
        // internetConnectionNeeded: 'Je potřeba připojení k internetu',
        chooseUnits: 'Vybrat jednotky',
        remove: 'Odebrat',
        add: 'Přidat',
        currency: 'Kč',
    },
    units: {
        kW: 'kW',
        kWh: 'kWh',
        MWh: 'MWh',
        MWhPerYear: 'MWh/rok',
        m2: 'm²',
        q: 'q',
        m3: 'm³',
        dm3: 'dm³',
        m: 'm',
        km: 'km',
        h: 'h',
        A: 'A',
        l: 'l',
        degreeCelsius: '°C',
        degree: '°',
    },
    photos: 'Fotografie:',
    selectPhoto: 'Vybrat fotku',
    selectPhotos: 'Vybrat fotky',
    capturePhoto: 'Vyfotit fotku',
    capturePhotos: 'Vyfotit fotky',
    noPhotos: 'Zatím jste nepřidali žádné fotky',
    selectFile: 'Vybrat soubor',
    selectFiles: 'Vybrat soubory',
    noFiles: 'Zatím jste nepřidali žádné soubory',
    remove: 'Odstranit',
};