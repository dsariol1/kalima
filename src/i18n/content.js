// Sprachwahl für INHALTE (Vokabeln, Bücher, Kapitel) — getrennt von den
// UI-Strings in de.js/en.js. Ein Vokabel-Eintrag trägt deutsche Felder plus
// englische Zwillinge (en, unitEn, rootMeaningEn, example.en). Fehlt der
// englische Zwilling (z.B. Nutzer-Eigenwort ohne Englisch), fällt die Anzeige
// auf Deutsch zurück — nie leer.

const pick = (lang, en, de) => (lang === 'en' ? (en ?? de) : de);

// Bedeutung einer Vokabel.
export const meaning = (entry, lang) => pick(lang, entry.en, entry.de);

// Wurzel-Bedeutung (kann null sein).
export const rootMeaningText = (entry, lang) => pick(lang, entry.rootMeaningEn, entry.rootMeaning);

// Muster-Bedeutung (وزن) — nur im Wurzel-Explorer verwendet.
export const patternMeaningText = (entry, lang) => pick(lang, entry.patternMeaningEn, entry.patternMeaning);

// Wortart-Beschreibung (z.B. "Verb (Perfekt)") — nur im Wurzel-Explorer.
export const typeText = (entry, lang) => pick(lang, entry.typeEn, entry.type);

// Kapitelname aus einem Vokabel-Eintrag (roh, ohne Nummerierung).
export const unitName = (entry, lang) => pick(lang, entry.unitEn, entry.unitDe);

// Beispiel-Übersetzung (example ist { ar, de, en? } oder fehlt ganz).
export const exampleText = (example, lang) => (example ? pick(lang, example.en, example.de) : '');

// Buch-Titel / -Beschreibung aus BOOK_META.
export const bookTitle = (book, lang) => pick(lang, book.titleEn, book.titleDe);
export const bookDesc = (book, lang) => pick(lang, book.descEn, book.descDe);
