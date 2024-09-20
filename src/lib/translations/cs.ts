import { template as t } from "$lib/helpers/templates"

export default {
    controllerRegistration: `Registrace nového regulátoru`,
    longAppName: `SEIR – Evidence regulátorů IR`,
    appName: `SEIR`,
    requiredField: `Toto pole je povinné`,
    controllerType: `Typ regulátoru`,
    serialNumber: `Sériové číslo regulátoru`,
    serialNumberIndoor: `Sériové číslo vnitřní jednotky`,
    newSerialNumber: `Nové sériové číslo`,
    wrongNumberFormat: `Nesprávný formát čísla`,
    heatPumpType: `Typ tepelného čerpadla`,
    airToWater: `vzduch/voda`,
    groundToWater: `země/voda`,
    heatPumpModel: `Model tepelného čerpadla`,
    heatPumpManufactureNumber: `Výrobní číslo tepelného čerpadla`,
    endUser: `Koncový uživatel`,
    name: `Jméno`,
    surname: `Příjmení`,
    birthday: `Datum narození`,
    wrongDateFormat: `Nesprávný formát datumu`,
    phone: `Telefon`,
    wrongPhoneFormat: `Nesprávný formát telefoního čísla`,
    email: `Email`,
    wrongEmailFormat: `Nesprávný formát emailu`,
    roalizationLocation: `Místo realizace`,
    town: `Obec`,
    street: `Číslo popisné nebo ulice a číslo orientační`,
    zip: `Poštovní směrovací číslo`,
    wrongZIPFormat: `Nesprávný formát PSČ`,
    assemblyCompany: `Montážní firma`,
    crn: `IČO`,
    wrongCRNFormat: `Nesprávný formát IČO`,
    representativeName: `Jméno zástupce`,
    commissioning: `Uvedení do provozu`,
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
    cancel: `Zrušit`,
    password: `Heslo`,
    confirmPassword: `Potvrdit heslo`,
    no_Person: `Žádná`,
    notChosen: `Nevybráno`,
    unknown_Company: `Neznámá`,
    checkInternet: `Zkontrolujte připojení k internetu!`,
    inexistantEmailHtml: t`Takový účet neexistuje! <a href="${'link'}">Vytvořit ho?</a>`,
    wrongPasswordHtml: t`Špatné heslo! <a href="${'link'}">Zapomenuté heslo?</a>`,
    tooManyRequests: `Moc žádostí! Počkejte prosím chvíli`,
    somethingWentWrong: `Něco se nepovedlo :\\`,
    passwordTooWeak: `Heslo je příliš slabé!`,
    pleaseUseBuisnessEmail: `Prosím zadejte Váš firemní email`,
    emailInUse: `Tento účet již existuje`,
    passwordsDoNotMatch: `Hesla se neshodují!`,
    save: `Uložit`,
    saving: `Ukládání...`,
    youHaveAMistake: `Ve formuláři máte chybu. Prosím, zkontrolujte vyplněné informace.`,
    logInNeeded: `Pro zobrazení a vyplnění formuláře je nutné se přihlásit!`,
    evidenceDetailsHtml: t`Podrobnosti o instalaci s ${'irType'} ${'irNumber'}`,
    evidenceDetails: `Podrobnosti o instalaci`,
    loadingData: `Načítání dat...`,
    sorrySomethingWentWrong: `Omlouváme se, něco se nepovedlo.`,
    offline: `Jste offline!`,
    linkInvalid: `Buď je záznam o evidenci neexistuje nebo k němu nemáte přístup.`,
    linkToThis: `Odkaz na tuto stránku`,
    copy: `Kopírovat`,
    regulusRouteForm: `Formulář o zpřístupnění regulátoru službě RegulusRoute`,
    regulusRouteTitle: `Souhlas se zpřístupněním regulátoru IR službě RegulusRoute`,
    regulusRouteFileName: `Formulář RegulusRoute.pdf`,
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
    whatToAddInfoTo: `K čemu byste chtěli přidat podrobnější informace?`,
    heatPump: `Tepelné čerpadlo`,
    pleaseFillInIrType: `Prosím, vyplňte typ IR.`,
    fillInPassword: `Prosím, zadejte heslo.`,
    search: `Vyhledat`,
    controllerSearch: `Vyhledávání instalací`,
    new: `Nová registrace`,
    changeController: `Změnit sériové číslo regulátoru`,
    confirm: `Potvrdit`,
    changeWentWrong: `Něco ne nepovedlo. Obnovte stránku a zkuste to znovu.`,
    note: `Poznámka`,
    routeGuide: `Návod na přihlášení k regulátoru`,
    warranty: `Záruční list k TČ`,
    commissionProtocol: `Protokol o instalaci TČ`,
    commissionProtocolTitle: `Protokol o uvedení tepelného čerpadla do trvalého provozu`,
    commissionProtocolFileName: `Protokol uvedení TČ`,
    installationApproval: `Schválení instalace TČ`,
    yearlyCheck: `Roční kontrola TČ`,
    yearlyCheckFileName: `Roční prohlídka.pdf`,
    yearlyCheckTitle: `Popis úkonů při provádění preventivní roční prohlídky vzduchového tepelného čerpadla`,
    doYearlyCheck: `Udělat roční kontrolu TČ`,
    filledYearlyCheck: `Roční kontroly TČ`,
    chooseFromList: `Vyberte ze seznamu`,
    chooseCompanyFromList: `Vyberte firmu ze seznamu:`,
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
    requiresLogIn: `Tato stránka vyžaduje přihlášení.`,
    emptyForm: `Vymazat data`,
    siteNotFound: `Stránka nenalezena.`,
    changePassword: `Změnit heslo`,
    year: `Rok`,
    redirecting: `Přesměrování…`,
    editation: `Editace`,
    passwordEdited: `Heslo upraveno, přihlašte se prosím`,
    registered: `Registrace proběhla úspěšně, přihlašte se prosím`,
    passwordHasBeenReset: `Heslo resetováno, přihlašte se prosím`,
    yes: 'Ano',
    no: 'Ne',
    commission: 'Zaznamenat uvedení do provozu',
    hpWarranty: `Záruční list tepelného čerpadla`,
    warrantyFileName: `Záruční list.pdf`,
    performingPerson: `Provádějící osoba`,
    realisedAtResidence: `Shodné s bydlištěm`,
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
    volumeOfExpansionTank: `Objem expanzní nádoby otopného systému`,
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
    extendedWarranty7Years: `ano – 7 let na kompresor`,
    extendedWarranty10Years: `ano – 10 let na kompresor (příplatek)`,
    isInstallationInWarrantyConditions: `Instalace a uvedení do provozu jsou v souladu s podmínkami prodloužené záruky`,
}