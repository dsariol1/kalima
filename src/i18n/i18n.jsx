// Leichtgewichtige i18n ohne externe Dependency. Eine App-weite Sprache
// ('de' | 'en') liegt im LangContext; useT() liefert die Übersetzungsfunktionen.
// Bewusste Ausnahme vom sonstigen Prop-Drilling: Sprache ist querschnittlich
// (fast jede Komponente braucht sie), deshalb Context statt Props.

import { createContext, useContext, useMemo } from 'react';
import { de } from './de.js';
import { en } from './en.js';

const DICTS = { de, en };
export const LANGS = ['de', 'en'];
export const DEFAULT_LANG = 'de';

const LangContext = createContext(DEFAULT_LANG);

// Punkt-Pfad im Dict auflösen ("quiz.result.perfect").
function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

// {var}-Platzhalter aus vars ersetzen. Nicht gefundene Platzhalter bleiben roh.
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

// Übersetzungsfunktionen für eine feste Sprache bauen. Fällt bei fehlendem
// Schlüssel auf Deutsch zurück, dann auf den Schlüssel selbst (sichtbar im UI,
// damit fehlende Übersetzungen beim Testen auffallen statt leer zu bleiben).
export function makeT(lang) {
  const dict = DICTS[lang] || DICTS[DEFAULT_LANG];

  const t = (key, vars) => {
    const hit = lookup(dict, key);
    const val = hit === undefined ? lookup(DICTS[DEFAULT_LANG], key) : hit;
    return interpolate(val === undefined ? key : val, vars);
  };

  // Plural: erwartet einen Eintrag { one, other } unter key. Deutsch und
  // Englisch teilen dieselbe one/other-Regel (count === 1 -> one).
  const tn = (key, count, vars) => {
    const hit = lookup(dict, key) ?? lookup(DICTS[DEFAULT_LANG], key);
    const form = hit && typeof hit === 'object' ? (count === 1 ? hit.one : hit.other) : hit;
    return interpolate(form === undefined ? key : form, { count, ...vars });
  };

  return { t, tn, lang };
}

export function LangProvider({ lang, children }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useT() {
  const lang = useContext(LangContext);
  return useMemo(() => makeT(lang), [lang]);
}

// Direkter Zugriff auf die aktive Sprache (ohne t/tn), für Content-Helfer.
export function useLang() {
  return useContext(LangContext);
}
