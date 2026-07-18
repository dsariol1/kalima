// Deutsche UI-Strings. Gegenstück: en.js (gleiche Schlüsselstruktur).
// Plural-Einträge sind { one, other } und werden über tn(key, count) gewählt.
// {var}-Platzhalter füllt t(key, vars) / tn(key, count, vars).

export const de = {
  common: {
    back: 'Zurück',
    start: 'Start',
    book: 'Buch',
    words: { one: '{count} Wort', other: '{count} Wörter' },
  },

  nav: {
    books: 'Bücher',
  },

  header: {
    settingsAria: 'Einstellungen',
    harakatOn: 'Harakat an',
    harakatOff: 'Harakat aus',
  },

  settings: {
    heading: 'Einstellungen',
    appearance: 'Darstellung',
    language: 'Sprache',
    theme: { system: 'System', light: 'Hell', dark: 'Dunkel' },
    retention: 'Ziel-Behaltensrate',
    newPerSession: 'Neue Karten pro Sitzung',
    newPerSessionHint: '(je Richtung)',
    account: 'Konto',
    logout: 'Abmelden',
    sync: {
      syncing: 'Wird synchronisiert …',
      error: 'Offline — Änderungen bleiben lokal gespeichert.',
      syncedAt: 'Synchronisiert · {time}',
      synced: 'Synchronisiert',
    },
  },

  grades: {
    again: 'Nochmal',
    good: 'Weiß ich',
    aria: '{label}, nächste Wiederholung in {interval}',
  },

  // Zeitintervall-Einheiten für Fälligkeits-Vorschauen.
  interval: {
    now: 'jetzt',
    min: '{n} Min',
    hr: '{n} Std',
    day: '{n} Tg',
    month: '{n} Mon',
    year: '{n} J',
  },

  dashboard: {
    greeting: { morning: 'Guten Morgen', day: 'Guten Tag', evening: 'Guten Abend' },
    goalRingWithGoal: '{done} von {goal} Karten heute gelernt',
    goalRingNoGoal: '{done} Karten heute gelernt',
    today: 'heute',
    dueSuffix: 'Karten heute fällig',
    freshSuffix: '· {fresh} neu',
    allLearned: 'Alles gelernt für heute',
    freshWaiting: ' · {fresh} neue Karten warten',
    reviewedToday: '{done} heute wiederholt',
    streak: { one: 'Tag-Serie', other: 'Tage-Serie' },
    streakNone: 'Starte deine Serie',
    toolsHeading: 'Lernwerkzeuge',
    badgeDue: '{due} fällig',
    beta: 'Beta',
    tools: {
      flashcards: { name: 'Karteikarten', desc: 'Spaced Repetition mit deinen Büchern.' },
      quiz: { name: 'Quiz', desc: 'Multiple-Choice mit bereits gelernten Wörtern.' },
      explorer: { name: 'Wurzel-Explorer', desc: 'Wurzelfamilien und Muster erkunden.' },
    },
  },

  review: {
    remaining: 'noch {remaining} · {reviewed} wiederholt',
    roundDone: 'Runde abgeschlossen',
    practiced: '{reviewed} Karten geübt',
    summaryKnown: ' · {known} gewusst, {again}× nochmal',
    summaryAll: ' · alle gewusst',
    backToBook: 'Zurück zum Buch',
  },

  flashcard: {
    badgeRecognition: 'Erkennen',
    badgeProduction: 'Produzieren',
    correct: '✓ Richtig',
    wrong: '✗ Nicht ganz',
    rootLabel: 'Wurzel',
    exploreFamily: 'Wurzelfamilie erkunden',
    showMeaning: 'Bedeutung zeigen',
    checkAnswer: 'Antwort prüfen',
    dontKnow: 'Ich weiß es nicht',
    showKeyboard: 'Tastatur einblenden',
    hideKeyboard: 'Tastatur ausblenden',
    inputPlaceholder: 'مَثَلًا: بَيْت',
  },

  quiz: {
    label: 'Quiz',
    notEnoughTitle: 'Noch nicht genug gelernte Wörter',
    notEnoughBody: 'Das Quiz fragt nur Wörter ab, die du schon in den Karteikarten gesehen hast. Wiederhole zuerst ein paar Karten — ab {min} gelernten Wörtern geht es hier los.',
    toFlashcards: 'Zu den Karteikarten',
    done: 'Quiz abgeschlossen',
    score: '{correct} von {total} richtig.',
    result: {
      perfect: 'Perfekt — alles richtig!',
      strong: 'Stark, weiter so!',
      good: 'Gut geübt — Wiederholung lohnt sich.',
      keepGoing: 'Dranbleiben — Wiederholung macht den Unterschied.',
    },
    again: 'Nochmal',
    toHome: 'Zur Startseite',
    progress: 'Frage {n}/{total} · {correct} richtig',
    whatMeaning: 'Was bedeutet das?',
    whichWord: 'Welches Wort passt?',
    showResult: 'Ergebnis anzeigen',
    nextQuestion: 'Nächste Frage',
  },

  books: {
    noBooksTitle: 'Noch keine Bücher',
    noBooksBody: 'Es sind aktuell keine Bücher mit Wörtern verfügbar.',
    dueSuffix: ' · {due} fällig',
    freshSuffix: ' · {fresh} neu',
  },

  bookDetail: {
    wholeBook: 'Ganzes Buch üben',
    wholeBookCounts: '· {due} fällig, {fresh} neu',
    unitPracticeAria: '{unit} üben',
    unitDueSuffix: ' · {due} fällig',
    addWord: 'Eigenes Wort hinzufügen',
    pasteList: 'Vokabelliste einfügen',
  },

  login: {
    titles: { login: 'Anmelden', register: 'Konto erstellen', reset: 'Passwort zurücksetzen', resetConfirm: 'Neues Passwort festlegen' },
    email: 'E-Mail',
    password: 'Passwort',
    passwordConfirm: 'Passwort bestätigen',
    minChars: 'Mindestens 8 Zeichen.',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort verbergen',
    pleaseWait: 'Bitte warten …',
    createAccount: 'Neues Konto erstellen',
    forgotPassword: 'Passwort vergessen?',
    backToLogin: '← Zurück zur Anmeldung',
    resetSent: 'Falls ein Konto zu dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.',
    resetDone: 'Passwort geändert. Du kannst dich jetzt anmelden.',
    registerConfirm: 'Konto erstellt. Bitte bestätige zuerst deine E-Mail-Adresse.',
    errors: {
      noConnection: 'Keine Verbindung zum Server. Bitte später erneut versuchen.',
      badCredentials: 'E-Mail oder Passwort ist falsch.',
      generic: 'Etwas ist schiefgelaufen.',
    },
  },

  addWord: {
    title: 'Eigenes Wort hinzufügen',
    arLabel: 'Arabisch (mit Harakat)',
    arPlaceholder: 'مَثَلًا: دَرْس',
    deLabel: 'Bedeutung (Deutsch)',
    enLabel: 'Bedeutung (Englisch, optional)',
    dePlaceholder: 'z. B. Unterricht, Lektion',
    enPlaceholder: 'z. B. lesson, class',
    translitLabel: 'Umschrift (optional)',
    translitPlaceholder: 'dars',
    lessonLabel: 'Lektion',
    ownWords: 'Eigene Wörter',
    rootLabel: 'Wurzel (optional)',
    rootPlaceholder: 'د ر س',
    rootMeaningLabel: 'Wurzelbedeutung',
    rootMeaningPlaceholder: 'lernen',
    add: 'Hinzufügen',
  },

  bulkAdd: {
    title: 'Vokabelliste einfügen',
    formatHelp: 'Ein Wort pro Zeile:',
    formatCode: 'Arabisch / Deutsch / Umschrift? / Wurzel? / Wurzelbedeutung?',
    formatNote: '— nur Arabisch und Deutsch sind Pflicht. Die Felder selbst dürfen kein „/" enthalten.',
    chapter: 'Kapitel',
    newChapter: '+ Neues Kapitel',
    newChapterName: 'Name des neuen Kapitels',
    newChapterPlaceholder: 'z. B. Essen & Trinken',
    wordList: 'Wortliste',
    recognized: { one: '{count} Wort erkannt', other: '{count} Wörter erkannt' },
    skipped: { one: ' · {count} Zeile übersprungen (Zeile {lines})', other: ' · {count} Zeilen übersprungen (Zeile {lines})' },
    addWords: '{count} Wörter hinzufügen',
    addWordsEmpty: 'Wörter hinzufügen',
  },

  backup: {
    note: 'Manuelle Sicherung als Datei — unabhängig von der Cloud-Synchronisierung.',
    export: 'Exportieren',
    import: 'Importieren',
    exported: 'Sicherung heruntergeladen.',
    exportFailed: 'Export fehlgeschlagen.',
    imported: 'Importiert: {vocab} eigene Wörter, {progress} Kartenstände.',
    importFailed: 'Import fehlgeschlagen — ist das eine gültige Sicherungsdatei?',
  },

  keyboard: {
    delete: 'Löschen',
  },

  rootExplorer: {
    patternQuiz: 'Muster-Quiz',
    scoreLine: '{correct}/{total} richtig · {noHint} ohne Tipp',
    hintRoot: 'Tipp: Wurzel',
    hintPattern: 'Tipp: Muster',
    rootLabel: 'Wurzel',
    patternLabel: 'Muster (وزن)',
    explain: '{ar} = {rootMeaning} (Wurzel) + {patternHead} (Muster)',
    viewInExplorer: 'Im Explorer ansehen',
    backToExplorer: 'Zurück zum Explorer',
    viewSwitch: { roots: 'Wurzeln', patterns: 'Muster', quiz: 'Quiz' },
    audioSoon: 'Audio folgt später',
    inVocab: 'Schon in deinem Wortschatz — {book}, {unit}',
    learnAsVocab: 'Als Vokabel lernen',
    samePattern: 'Gleiches Muster, andere Wurzeln',
    patternsTitle: 'Muster (وزن) über alle Wurzeln',
    patternsSubtitle: 'Gleiches Muster = gleiche Funktion — egal, welche Wurzel eingesetzt wird.',
    tapHint: 'Tippe ein Wort, um es ins Zentrum zu holen.',
    showRare: 'Weitere Ableitungen',
    hideRare: 'Seltene Ableitungen ausblenden',
    knownInTitle: 'schon in {book}',
    // relation-Kategorien: Schlüssel = interner (deutscher) Datenwert aus
    // rootFamilies.js, Wert = Anzeigetext.
    relation: { Handlung: 'Handlung', Person: 'Person', Ort: 'Ort', Ergebnis: 'Ergebnis' },
    freq: { 5: 'Sehr häufig', 4: 'Häufig', 3: 'Gebräuchlich', 2: 'Selten', 1: 'Sehr selten' },
  },
};
