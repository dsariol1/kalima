# PocketBase Schema — Collections + API-Rules

In der Admin-UI (`https://api.kalima.sariol.ch/_/`) anlegen. Vier Collections, jeweils
mit Bezug zum eingebauten `users` und einem client-gestempelten `clientUpdatedAt`
(für last-write-wins — **nicht** PocketBases eigenes `updated`, das trägt die
Sync-Zeit, nicht die Edit-Zeit).

Feld `owner` überall: **Relation → `users`**, required, „Cascade delete" an (löscht
Nutzer → löscht dessen Zeilen), Max select 1.

`clientUpdatedAt`: Typ **Date**, required.

> Hinweis: PocketBase reserviert `id`, `created`, `updated` selbst. Deshalb heißt der
> ursprüngliche Dexie-Schlüssel hier `cardId` bzw. `vocabId`, nicht `id`.

---

## Collection `progress`

Der komplette FSRS-Kartenzustand liegt als **ein JSON-Feld** (`card`), nicht als
Einzelspalten. Grund: ts-fsrs kann Kartenfelder ergänzen/umbenennen (z. B.
`learning_steps`); ein JSON-Blob überträgt jedes Feld verlustfrei, statt bei jedem
ts-fsrs-Update das Schema nachziehen zu müssen. `cardId`/`vocabId`/`direction`/
`bookId` bleiben echte Spalten (lesbar in der Admin-UI, natürlicher Schlüssel).

| Feld | Typ | Notiz |
|------|-----|-------|
| `owner` | Relation → users | required, cascade delete |
| `cardId` | Text | required — Wert `${vocabId}::${direction}` |
| `vocabId` | Text | |
| `direction` | Select (single) | Werte: `recognition`, `production` |
| `bookId` | Text | |
| `card` | JSON | ganzer FSRS-Kartenzustand (due, stability, difficulty, reps, lapses, state, last_review, …) |
| `clientUpdatedAt` | Date | required |

**Index (unique):** `owner`, `cardId` → in der Collection unter „Indexes":
`CREATE UNIQUE INDEX idx_progress_owner_card ON progress (owner, cardId)`

## Collection `customVocab`

| Feld | Typ |
|------|-----|
| `owner` | Relation → users (required, cascade) |
| `vocabId` | Text (required) |
| `bookId` | Text |
| `unit` | Text |
| `unitDe` | Text |
| `pos` | Text |
| `ar` | Text |
| `bare` | Text |
| `translit` | Text |
| `de` | Text |
| `root` | Text |
| `rootMeaning` | Text |
| `example` | Text |
| `clientUpdatedAt` | Date (required) |

**Index (unique):** `CREATE UNIQUE INDEX idx_customvocab_owner_vocab ON customVocab (owner, vocabId)`

## Collection `reviews` (append-only)

| Feld | Typ |
|------|-----|
| `owner` | Relation → users (required, cascade) |
| `localId` | Text (required) — client-UUID |
| `vocabId` | Text |
| `direction` | Select: `recognition`, `production` |
| `grade` | Number |
| `reviewedAt` | Date |

**Index (unique):** `CREATE UNIQUE INDEX idx_reviews_owner_local ON reviews (owner, localId)`
— macht das Hochladen idempotent (kein Duplikat bei Re-Sync).

## Collection `settings`

| Feld | Typ |
|------|-----|
| `owner` | Relation → users (required, cascade) |
| `key` | Text (required) |
| `value` | JSON |
| `clientUpdatedAt` | Date (required) |

**Index (unique):** `CREATE UNIQUE INDEX idx_settings_owner_key ON settings (owner, key)`

---

## API-Rules — SICHERHEITSKRITISCH

Für **jede** der vier Collections unter „API Rules" **alle** Regeln so setzen.
Eine leere Regel = öffentlich; das würde fremde Daten freigeben.

**List / View / Update / Delete rule:**
```
@request.auth.id != "" && owner = @request.auth.id
```

**Create rule** (zusätzlich Payload festnageln, damit niemand mit fremdem `owner`
anlegt):
```
@request.auth.id != "" && @request.data.owner = @request.auth.id
```

### users-Collection
Standard von PocketBase ist bereits recht zu. Sicherstellen, dass List/View **nicht**
offen sind — auf `id = @request.auth.id` beschränken, damit niemand fremde
E-Mail-Adressen auflisten kann.

---

## Verifikation vor Frontend-Anbindung

Zwei Wegwerf-Konten anlegen (A, B). Mit A einloggen, eine `progress`-Zeile anlegen.
Dann mit A versuchen, Bs Zeile per ID zu lesen/ändern → muss 403/404 liefern.
Geht das durch, sind die Rules falsch — erst fixen, dann Client-Code anbinden.
