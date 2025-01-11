import { template as t } from "$lib/helpers/templates"
import type { PlainTranslations } from "$lib/translations"
import cs from "./cs"
import en from "./en"

const de: PlainTranslations = {
    ...cs,
    ...en,
    name: `Vorname`,
    surname: `Nachname`,
    phone: `Telefonnummer`,
    email: `Email`,
    birthday: `Geburtsdatum`,
    street: `Straße und/oder Haus Nummer`,
    controllerRegistration: `Registrierung eines neuen Reglers`,
    longAppName: `SEIR – Verwaltung der IR-Regler`,
    appName: `SEIR`,
    requiredField: `Dieses Feld ist erforderlich`,
    controllerType: `Reglertyp`,
    serialNumber: `Seriennummer des Reglers`,
    serialNumberIndoor: `Seriennummer der Inneneinheit`,
    newSerialNumber: `Neue Seriennummer`,
    wrongNumberFormat: `Falsches Zahlenformat`,
    heatPumpType: `Typ der Wärmepumpe`,
    heatPumpsType: `Typ der Wärmepumpen`,
    airToWater: `Luft/Wasser`,
    groundToWater: `Erdreich/Wasser`,
    heatPumpModelNr: t`${0}Wärmepumpenmodell`,
    heatPumpManufactureNumberNr: t`Fertigungsnummer der ${0}Wärmepumpe`,
    first: `erste`,
    second: `zweite`,
    third: `dritte`,
    fourth: `fierte`,
    endUser: `Endbenutzer`,
    wrongDateFormat: `Falsches Datumsformat`,
    wrongPhoneFormat: `Falsches Telefonformat`,
    wrongEmailFormat: `Falsches E-Mail-Format`,
    roalizationLocation: `Ort der Ausführung`,
    town: `Stadt`,
    zip: `Postleitzahl`,
    wrongZIPFormat: `Falsches PLZ-Format`,
    assemblyCompany: `Montagefirma`,
    crn: `Steuer-ID`,
    wrongCRNFormat: `Falsches ID-Format`,
    representativeName: `Name der Kontaktperson`,
    commissioning: `Inbetriebnahme`,
    commissionedByAssemblyCompany: `Inbetriebnahme durch die Montagefirma`,
    remoteAccess: `Fernzugriff`,
    doYouWantRemoteAccess: `Fernzugriff auf den Regler einrichten?`,
    whoHasAccess: `Wer wird Zugriff darauf haben?`,
    endCustomer: `Endkunde`,
    commissioningCompany: `Inbetriebnahme-Firma`,
    whoWillBeInvoiced: `Wem wird der Fernzugriff in Rechnung gestellt? (einmaliger Preis 50 € inkl. MwSt.)`,
    doNotInvoice: `Nicht in Rechnung stellen`,
    responsiblePerson: `Verantwortliche Person`,
    chosenCompany: `Ausgewählte Firma`,
    cancel: `Abbrechen`,
    password: `Passwort`,
    confirmPassword: `Passwort bestätigen`,
    no_Person: `Keine`,
    notChosen: `Nicht ausgewählt`,
    unknown_Company: `Unbekannt`,
    checkInternet: `Überprüfen Sie die Internetverbindung!`,
    inexistantEmailHtml: t`Ein solches Konto existiert nicht! <a href="${'link'}">Möchten Sie es erstellen?</a>`,
    wrongPasswordHtml: t`Falsches Passwort! <a href="${'link'}">Passwort vergessen?</a>`,
    tooManyRequests: `Zu viele Anfragen! Bitte warten Sie einen Moment`,
    somethingWentWrong: `Etwas ist schiefgelaufen :\\`,
    passwordTooWeak: `Das Passwort ist zu schwach!`,
    pleaseUseBuisnessEmail: `Bitte verwenden Sie Ihre Firmen-E-Mail-Adresse`,
    emailInUse: `Dieses Konto existiert bereits`,
    passwordsDoNotMatch: `Passwörter stimmen nicht überein!`,
    save: `Speichern`,
    saving: `Speichern...`,
    youHaveAMistake: `Im Formular liegt ein Fehler vor. Bitte überprüfen Sie die eingegebenen Informationen.`,
    logInNeeded: `Zum Anzeigen und Ausfüllen des Formulars ist eine Anmeldung erforderlich!`,
    evidenceDetailsHtml: t`Details zur Installation mit ${'irType'} ${'irNumber'}`,
    evidenceDetails: `Details zur Installation`,
    loadingData: `Daten werden geladen...`,
    sorrySomethingWentWrong: `Entschuldigung, etwas ist schiefgelaufen.`,
    somethingWentWrongContactUsHtml: `Entschuldigung, etwas ist schiefgelaufen, bitte kontaktieren Sie uns unter <a href="mailto:aplikace.regulus@gmail.com">aplikace.regulus@gmail.com</a>`,
    linkInvalid: `Entweder ist der Link zu dieser Seite falsch oder der Eintrag wurde bereits gelöscht.`,
    linkToThis: `Link zu dieser Seite`,
    copy: `Kopieren`,
    regulusRouteForm: `Formular für den Zugriff auf den Regler durch den RegulusRoute-Dienst`,
    regulusRouteTitle: `Zustimmung zur Bereitstellung des IR-Controllers RegulusRoute`,
    regulusRouteFileName: `RegulusRoute Zustimmung`,
    openPdf: `PDF öffnen`,
    changeLang: `Sprache ändern`,
    deleteThisEvidence: `Diesen Eintrag löschen`,
    signUp: `Registrierung`,
    toSignUp: `Registrieren`,
    back: `Zurück`,
    logIn: `Anmeldung`,
    toLogIn: `Anmelden`,
    toLogOut: `Abmelden`,
    dontHaveAccount: `Haben Sie kein Konto?`,
    or: `oder`,
    scanBarcode: `Scannen Sie den Barcode von der Wärmepumpe`,
    scanCode: `Code scannen`,
    residence: `Wohnung`,
    whatToAddInfoTo: `Wozu möchten Sie genauere Informationen hinzufügen?`,
    heatPump: `Wärmepumpe`,
    heatPumps: `Wärmepumpen`,
    noPump: `Kein`,
    pleaseFillInIrType: `Bitte geben Sie den IR-Typ ein.`,
    fillInPassword: `Bitte geben Sie das Passwort ein.`,
    search: `Suchen`,
    controllerSearch: `Installation suchen`,
    new: `Neue Registrierung`,
    changeController: `Seriennummer des Reglers ändern`,
    confirm: `Bestätigen`,
    changeWentWrong: `Etwas ist schiefgelaufen. Aktualisieren Sie die Seite und versuchen Sie es erneut.`,
    note: `Hinweis`,
    routeGuide: `Anleitung zur Anmeldung zum Regler`,
    warrantyNr: t`Garantie für die Wärmepumpe ${0}`,
    heatPumpCommissionProtocol: `Inbetriebnahmeprotokoll für die Wärmepumpe`,
    heatPumpCommissionProtocolTitle: `Protokoll zur Inbetriebnahme der Wärmepumpe `,
    heatPumpCommissionProtocolFileName: `Wärmepumpe Inbetriebnahmeprotokoll`,
    yearlyHPCheck: `Jährliche Überprüfung der Wärmepumpe`,
    yearlyCheckFileName: `Jährlichen Inspektion.pdf`,
    yearlyCheckTitle: `Aufgabenbeschreibung bei Durchführung der jährlichen vorbeugenden Inspektion der Luft-Wärmepumpe`,
    doYearlyCheck: `Jährliche Überprüfung der Wärmepumpe durchführen`,
    filledYearlyCheck: `Durchgeführte jährliche Überprüfung der Wärmepumpe`,
    searchCompanyInList: `Der Firma in der Liste suchen`,
    searchRepresentative: 'Kontaktperson suchen',
    newPassword: `Neues Passwort`,
    sendConfirmEmail: `Bestätigungs-E-Mail senden`,
    passwordReset: `Passwort zurücksetzen`,
    passwordResetEmailHtml: t`<p>Guten Tag,</p>
<p>über diesen Link können Sie das Passwort für Ihr Konto in der Anwendung Regler IR zurücksetzen: ${'email'}:</p>
<p><a href="${`link`}">${`link`}</a></p>
<p>Wenn Sie nicht um eine Passwortzurücksetzung gebeten haben, können Sie diese E-Mail ignorieren.</p>
<p>Mit freundlichen Grüßen</p>
<p>Reglerverwaltung IR</p>`,
    emailNotSent: t`E-Mail konnte nicht gesendet werden: ${'status'} ${'statusText'}`,
    redirectFailedHtml: t`Die Weiterleitung ist fehlgeschlagen. Bitte gehen Sie zu dieser Adresse: <a href="${`link`}">${`link`}</a>`,
    irExistsHtml: t`Dieser Regler ist bereits registriert (<a href="${`link`}">Detail</a>)`,
    editRegistration: `Registrierungsdaten bearbeiten`,
    requiresLogIn: `Diese Seite erfordert eine Anmeldung.`,
    emptyForm: `Daten löschen`,
    siteNotFound: `Seite nicht gefunden.`,
    changePassword: `Passwort ändern`,
    year: `Jahr`,
    redirecting: `Weiterleitung…`,
    editation: `Bearbeitung`,
    passwordEdited: `Passwort geändert, bitte melden Sie sich an`,
    registered: `Registrierung erfolgreich, bitte melden Sie sich an`,
    passwordHasBeenReset: `Passwort zurückgesetzt, bitte melden Sie sich an`,
    yes: `ja`,
    no: `nein`,
    commission: `Inbetriebnahme erfassen`,
    hpWarranty: `Garantieschreiben für Wärmepumpe`,
    warrantyFileName: `Garantieschreiben.pdf`,
    performingPerson: `Durchführende Person`,
    realisedAtResidence: `Gleich wie Wohnsitz`,
    agreeWIthRRPrice: `Ich stimme dem einmaligen Preis von 50 € inklusive MwSt. für diese Dienstleistung zu.`,
    suits: `entspricht`,
    suitsNot: `nicht entspricht`,
    characteristicsAndSizeOfHeatPumpBreaker: `Charakteristik und Größe des Schutzschalters für die Wärmepumpe`,
    characteristicsAndSizeOfIndoorUnitBreaker: `Charakteristik und Größe des Schutzschalters für die Innengerät`,
    distanceFromWall: `Entfernung der WP von der Rückwand`,
    isCompensatorInstalled: `Ist ein Kompensator als Frostschutz installiert?`,
    isCirculationPumpFilterInstalled: `Im Rücklauf ist ein Filter vor der Umwälzpumpe installiert?`,
    tanks: `Pufferspeicher/Boiler`,
    typeOfAccumulationTank: `Pufferspeicher typ`,
    typeOfStorageTank: `Speicher typ`,
    heatingSystem: `Heizungsystem und Warmwasseraufbereitung`,
    heatingSystemConsistsOf: `Heizungsystem`,
    radiators: `Heizkörper`,
    underfloorHeating: `Fußbodenheizung`,
    combinationHeating: `Kombination (Fußbodenheizung und Heizkörper)`,
    otherHeatingSystem: `Andere`,
    isAdditionalHeatingSourceConnected: `Ist im System eine zusätzliche Wärmequelle angeschlossen?`,
    typeAndPowerOfAdditionalHeatingSource: `Typ und Leistung der zusätzlichen Heizquelle`,
    doesHeatPumpPrepareHotWater: `Bereitet die Wärmepumpe warmes Wasser auf?`,
    additionalHotWaterSource: `Zusätzquelle für Warmwasser`,
    mainHotWaterSource: `Hauptquelle für Warmwasser`,
    volumeOfExpansionTank: `Volumen Ausgleichsgefäß`,
    isPoolHeatingManagedByHeatPump: `Wird auch die Poolheizung durch die Wärmepumpe geregelt?`,
    controlAndElectricalInstallation: `Regulierung und Verkabelung`,
    internetConnection: `Internet verbunden`,
    connectedViaRegulusRoute: `Verbunden über RegulusRoute`,
    connectedWithPublicIpAddress: `Verbunden über öffentliche IP-Adresse`,
    notConnected: `Nicht verbunden`,
    isElectricalBondingComplete: `Wurde ein kompletter elektrischer Anschluss hergestellt?`,
    areElectricalDevicesTested: `Wurden alle an die Steuerung angeschlossenen Geräte getestet?`,
    isBackupPowerSourceInstalled: `Ist ein Backup-Kreislauf-Netzteil installiert?`,
    primaryCircuit: `Primärkreis`,
    typeOfPrimaryCircuit: `Typ des Primärkreises`,
    groundBoreholes: `Tiefenbohrungen`,
    surfaceCollector: `Flächenkollektor`,
    otherCollector: `Sonstiges`,
    numberAndDepthOfBoreholes: `Tiefe und Anzahl der Bohrungen`,
    numberAndLengthOfCircuits: `Länge und Anzahl der Kreise`,
    collectorDescription: `Beschreibung des Primärkreises`,
    heatingSystemDescription: `Beschreibung des Heizungsystem`,
    typeOfAntifreezeMixture: `Typ der verwendeten Frostschutzmischung`,
    onPrimaryCircuitInstalled: `Im Primärkreis wurde installiert`,
    expansionTankInstalled: `Ausdehnungsgefäß`,
    bufferTankInstalled: `Ausgleichsbehälter`,
    wasPrimaryCircuitTested: `Wurde eine ordnungsgemäße Entlüftung und Druckprüfung des Primärkreises durchgeführt?`,
    commissioningSteps: `Informationen zu den bei der Inbetriebnahme ergriffenen Maßnahmen`,
    wasInstallationAccordingToManual: `Erfolgte die Installation und Inbetriebnahme der Wärmepumpe gemäß den in der Installations-, Anschluss- und Betriebsanleitung festgelegten Bedingungen, den Einbaubedingungen und den allgemein gültigen Normen?`,
    wasControllerSetToParameters: `Wurde die Regulationseinheit der WP auf die vorgeschriebenen Parameter eingestellt?`,
    wasOwnerFamiliarizedWithFunction: `Wurde der Besitzer in die Grundfunktionen der WP und ihre Bedienung eingewiesen?`,
    isExtendedWarrantyDesired: `Hat der Eigentümer der Wärmepumpe Interesse an einer verlängerten Garantie?`,
    extendedWarranty7Years: `ja – 7 Jahre auf Kompressor`,
    extendedWarranty10Years: `ja – 10 Jahre auf Kompressor (gegen Aufpreis)`,
    isInstallationInWarrantyConditions: `Entsprechen die Installation und Inbetriebnahme den Bedingungen der verlängerten Garantie?`,
    offline: `Sie sind offline!`,
    mandatoryFields: `Pflichtfelder`,
    cascadeSee: `Kaskade – siehe unten`,
    cascade: `Kaskade:`,
    pumpDetails: t`WP${'n'}: ${'model'} – ${'cislo'}`,
}
export default de