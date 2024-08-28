import { changePassword } from "$lib/client/auth"
import { template as t } from "$lib/helpers/templates"

export default {
    controllerRegistration: `Registrace nového regulátoru`,
    longAppName: `Evidence regulátorů IR`,
    appName: `Evidence IR`,
    requiredField: `Toto pole je povinné`,
    controllerType: `Typ regulátoru`,
    serialNumber: `Sériové číslo regulátoru`,
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
    doYouWantRemoteAccess: `Chcete založit vzdálený přístup k regulátoru?`,
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
    loadingData: `Načítání dat...`,
    sorrySomethingWentWrong: `Omlouváme se, něco se nepovedlo.`,
    linkInvalid: `Buď je odkaz na tuto stránku nesprávný, nebo je již záznam o evidenci odstraněný.`,
    linkToThis: `Odkaz na tuto stránku`,
    copy: `Kopírovat`,
    regulusRouteForm: `Formulář o zpřístupnění regulátoru službě RegulusRoute`,
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
    controllerSearch: `Vyhledávání evidencí`,
    home: `Nová registrace`,
    changeController: `Změnit sériové číslo regulátoru`,
    confirm: `Potvrdit`,
    changeWentWrong: `Něco ne nepovedlo. Obnovte stránku a zkuste to znovu.`,
    note: `Poznámka`,
    routeGuide: `Návod na přihlášení k RegulusRoute`,
    warranty: `Záruční list k TČ`,
    instalationProtocol: `Protokol o instalaci TČ`,
    installationApproval: `Schválení instalace TČ`,
    yearlyCheck: `Roční kontrola TČ`,
    doYearlyCheck: `Udělat roční kontrolu TČ`,
    filledYearlyCheck: `Roční kontroly TČ`,
    wrongTime: `Pokud po otevření souborů dostáváte chybu 401: Unathorized, zkontrolujte prosím nastavení času svého zařízení.`,
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
}