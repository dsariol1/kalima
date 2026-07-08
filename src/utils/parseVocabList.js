// Parses a pasted word list into vocab entries — one word per line, the same
// fields as the single-word AddWord form, just slash-separated so a whole
// chapter can be typed/pasted at once instead of one form submission per word.
//
// Line format: "Arabisch / Deutsch / Umschrift? / Wurzel? / Wurzelbedeutung?"
// Only Arabisch + Deutsch are required. Blank lines and lines starting with
// # are skipped, so a pasted chapter heading or note doesn't break the import.
// Note: field values themselves must not contain "/" (e.g. a meaning like
// "Schule/Unterricht" would be split into two fields) — use "," or ";" instead.

const HARAKAT = /[ً-ْٰ]/g;
const stripHarakat = (s) => s.replace(HARAKAT, '');

export function parseVocabLines(text, { bookId, unit, unitDe }) {
  const entries = [];
  const errors = [];

  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;

    const [ar, de, translit, rootStr, rootMeaning] = line.split('/').map((p) => p.trim());
    if (!ar || !de) {
      errors.push({ line: i + 1, text: raw });
      return;
    }

    entries.push({
      id: `custom-${Date.now()}-${i}`,
      bookId,
      unit,
      unitDe,
      pos: 'custom',
      ar,
      bare: stripHarakat(ar),
      translit: translit || '',
      de,
      root: rootStr ? rootStr.split(/[\s-]+/).filter(Boolean) : null,
      rootMeaning: rootMeaning || null,
      custom: true,
    });
  });

  return { entries, errors };
}

// Turns a chapter title into a stable unit id, avoiding collisions with units
// that already exist in this book (so two chapters named similarly don't merge).
export function slugUnit(titleDe, existingUnitIds) {
  const base = titleDe.trim().toLowerCase()
    .replace(/[^a-z0-9äöüß\s-]/gi, '')
    .replace(/\s+/g, '-') || 'kapitel';
  let id = base;
  let n = 2;
  while (existingUnitIds.includes(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}
