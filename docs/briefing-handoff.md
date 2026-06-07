# Hand-off Briefing PropAfterCare

> **Zweck dieser Datei:** Lückenloser Einstieg für eine neue Claude-Code-Session. Alles was du brauchst, um den Code-Stand, die Architektur und alle Workflows in 10 Minuten zu verstehen.
> **Datum:** Juni 2026 · **Stand:** Commit `60dc90e` auf Branch `claude/propaftercare-mvp-MVJBG`

---

## 0. Quick Status

PropAfterCare ist ein lauffähiges Next.js-14-MVP (App Router, TypeScript, Tailwind). Es bildet die **gesamte Pilot-Demo Paderborn** ab – Marketing-Landing, Käufer-Journey (Onboarding → Dashboard → Formular-Hub → KI-Chat → Profil → Meine Formulare) und Makler-Cockpit (Kundenliste + Live-Sync mit Käufer-Milestones, Reputations-Cockpit, Mitkuratoren-Programm).

- **Echte Daten:** Adress-/Orts-Lookup (Nominatim + OpenPLZ), Anthropic-Chat (falls Key gesetzt, sonst Demo-Antworten), echte jsPDF-Generierung.
- **Mock-Daten:** 1 Makler (Thomas Kühn), 3 Käufer (Julia / Lukas / Sabine – ownUse / investment-self / investment-managed), 17 Formulare Paderborn, 13 Milestone-Templates.
- **Persistenz:** Browser-`localStorage` pro Käufer (Profile, Submissions, Milestones) + In-Memory-Server-Store für Submission-Receipts. Kein Supabase angebunden, kein Auth.
- **Build:** `npm run build` läuft sauber, `next lint` 0 Warnings.

---

## 1. Stack

| Schicht | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.15 |
| Sprache | TypeScript | 5.6 |
| UI | Tailwind CSS | 3.4 |
| i18n | next-intl | 3.21 |
| Auth/DB (vorbereitet) | Supabase + @supabase/ssr | 2.45 / 0.5 |
| KI | @anthropic-ai/sdk | 0.30 |
| PDF | jsPDF | 4.2 |

**Wichtige Scripts** (`package.json`):
```bash
npm run dev        # next dev :3000
npm run build      # next build (production)
npm run start      # next start
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

**Env (`.env.example`):**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=           # Ohne Key fällt /api/chat auf Demo-Antworten zurück
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. Repository-Layout

```
.
├── README.md                        Projekt-Pitch + Status-Übersicht
├── PropAfterCare-Pitch.pptx         Generierter Pitch-Deck (Investor/Partner/Pilot)
├── docs/
│   ├── briefing-v1.1.md             Konzept-Briefing v1.1 (14 Entscheidungen, Mai 2026)
│   └── briefing-handoff.md          ← DIESES DOKUMENT
├── public/
│   ├── logo.svg / logo-mark.svg     Markenlogo
│   ├── founder.jpg                  Forbes-Style-Section-Foto
│   └── promo.html                   Standalone-HTML-Promo (eingebettet via iframe in Hero)
├── scripts/build_pitch.py           Python-Skript zur PPTX-Generierung
├── src/                             siehe unten
└── tailwind.config.ts               Brand-Farben (#0469c4-Spektrum) + ink-Skala
```

---

## 3. Routen (App Router – `src/app/[locale]/`)

Alle Routen liegen unter `[locale]`; Middleware (`src/middleware.ts`) redirected `/` → `/de`. Im MVP ist `de` die einzige aktive Locale (siehe `src/i18n/config.ts`), TR/AR/RU sind nur infrastrukturell vorbereitet.

### Marketing
| Route | Datei | Zweck |
|---|---|---|
| `/de` | `page.tsx` | Landing: Nav · Hero (mit PromoVideo) · Pitch-Stats · Features · Demo-CTA · Forbes-Style Founder · **Pricing "Preis auf Anfrage"** (mailto an `finn.luca.wenzel@gmx.de`) · Footer |

### Käufer-Journey
| Route | Zweck |
|---|---|
| `/de/welcome` | White-Label-Begrüßung "Hallo {Käufer}, dein Makler {Broker} schenkt dir das Tool" |
| `/de/onboarding` | 2-Minuten-Setup-Formular (Profil-Typ-Auswahl + Basics), schreibt in `profileStore` |
| `/de/dashboard` | Hauptansicht Käufer: Profil-Vervollständigkeit, Quick-Actions (Documents/MyForms/Chat), `InteractiveDashboard` mit Phase-Sections und Milestone-Cards |
| `/de/documents` | Formular-Hub: Legende der 3 Quelltypen + alle Forms gruppiert nach Kategorie, gefiltert nach Käufer-Profil |
| `/de/documents/[docId]` | Einzelformular-Detail mit `DocumentForm` (Pre-Fill aus Profile, Submission über `/api/submissions` + lokal in `submissionStore`, optional PDF-Download) |
| `/de/my-forms` | Hub aller eigenen Submissions (Status, Receipts, PDF-Re-Download) |
| `/de/chat` | KI-Assistent (Anthropic Claude oder Demo-Antworten) – nimmt `propertyType` als Kontext |
| `/de/profile` | Profil-Editor (alle Felder inkl. Adress-Autocomplete via Nominatim) |

### Makler-Cockpit
| Route | Zweck |
|---|---|
| `/de/broker` | Kundenübersicht: 3 Käufer-Karten mit Live-Progress (poll-basiert via `BroadcastChannel` – Klick im Käufer-Dashboard wird im Cockpit sichtbar) |
| `/de/broker/reputation` | Reputations-Cockpit: Stats (Ø Sterne, Conversion, letzte Bewertung), Trigger-Bedingungen visualisiert |
| `/de/broker/curators` | Mitkuratoren-Programm: 3/6/9-Punkte-System, Bestenliste Top-5 |

### Demo-Helpers
- **`BuyerSwitcher`** in `BrokerHeader` (oben rechts) → wechselt aktiven Käufer per Cookie `pac-active-buyer` (Default: `julia-m`).
- **`DemoReset`** Komponente → leert localStorage-Stores.

---

## 4. API Routes (`src/app/api/`)

| Route | Methode | Zweck |
|---|---|---|
| `/api/chat` | POST | Proxy zu Anthropic (`claude-sonnet-4-6`, max 600 Tokens). System-Prompt aus `src/lib/chatSystem.ts`. Ohne API-Key → `findDemoAnswer()` mit 4 vorbereiteten Themen (Kaufpreis · Wohnsitz · Versorger · Versicherungen). Antwort-Modus: `live` / `demo` / `fallback`. |
| `/api/submissions` | POST/GET/DELETE | Server-side In-Memory-Store für Submission-Receipts. `persistSubmission()` erzeugt `SRV-XXXX-YYYY`-Quittungs-ID, idempotent über `clientReceiptId`. Maximal 500 Einträge. |
| `/api/active-buyer` | POST | Setzt Cookie `pac-active-buyer` (30 Tage). Validiert gegen `mockBuyers`. |
| `/api/lookup/address` | GET | Nominatim-Proxy (OpenStreetMap) für Adress-Autocomplete. Timeout 3.5 s, fällt sonst auf Mock zurück. Caching 30 s. |
| `/api/lookup/place` | GET | OpenPLZ-Proxy für PLZ/Ort-Lookup. Caching 60 s. |

**Wichtig:** Alle API-Routen sind `runtime: 'nodejs'`, `dynamic: 'force-dynamic'`.

---

## 5. Domain-Modell (`src/types/index.ts`)

```ts
PropertyType   = 'ownUse' | 'investment-self' | 'investment-managed'
Phase          = 1 | 2 | 3 | 4
MilestoneStatus = 'open' | 'in_progress' | 'done'
FormSourceType = 'inhouse' | 'external_link' | 'communal_pdf'
FormStatus     = 'active' | 'under_review' | 'outdated'
SubmissionMethod = 'in_person' | 'postal' | 'online_portal' | 'email'

MilestoneId    = 13 IDs (auflassung, faelligkeit, kaufpreis, grunderwerb,
                 wohngebaeude, handwerker, verwaltung, mietvertrag,
                 uebergabe, ummeldung, versorger, afa, nebenkosten)

DocumentId     = 17 IDs (wohnsitz-paderborn, kfz-paderborn, grundsteuer,
                 strom-westfalenweser, strom-stadtwerke-pb, gas, wasser,
                 asp-abfall, internet, wohngebaeude, hausrat, gez, post,
                 bank, verwaltung, mietvertrag, vermieterhaftpflicht)

Broker         { id, name, company, city, email, phone, photoUrl,
                 brandColor, googleReviewUrl, reviews{...}, curatorPoints{...} }

Buyer          { id, name, email, language:'de', propertyType, city,
                 address, oldAddress, moveInDate, brokerId,
                 milestones, profileCompleteness, aiChatUsed, createdAt }

FormEntry      { id, category, sourceType, officialSource, status,
                 lastCheckedAt, sourceVersion?, forPropertyType, region,
                 submissionMethod, submissionTarget?, triggerMilestone?,
                 urgencyDays?, estimatedTimeMin?, estimatedCost?,
                 estimatedProcessing?, consequenceIfMissing?,
                 prefillCopyFields?, externalUrl? }
```

---

## 6. Daten-Layer & Stores (`src/lib/`)

### Statische Kataloge (server-safe)
| Datei | Inhalt |
|---|---|
| `mockData.ts` | `mockBroker` (Thomas Kühn) + `mockBuyers` [Julia, Lukas, Sabine] + `topCurators` Bestenliste |
| `milestones.ts` | `milestoneCatalog` (13 Templates) · `buildMilestonesFor(propertyType)` · `progressFor()` · `milestonesByPhase()` |
| `documents.ts` | `formCatalog` (17 Forms Paderborn) · `formsFor(propertyType)` · `groupByCategory()` · `documentCategories` · `getForm(id)` · `formForMilestone()` · `formatDate()` |
| `chatSystem.ts` | `CHAT_SYSTEM_PROMPT` (Anthropic-Prompt mit Paderborn-Spezifika + RDG/StBerG-Guardrails) · `DEMO_RESPONSES` 4 Themen · `findDemoAnswer()` |
| `format.ts` | `formatDateDE()` Helper |
| `cn.ts` | `clsx` + `tailwind-merge` Wrapper |
| `pdf.ts` | jsPDF-Renderer für Demo-Quittungs-PDFs (Header, Felder, Receipt-ID, Quelle, "DEMO-AUSDRUCK"-Wasserzeichen) |

### Client-Stores (`localStorage`, `'use client'`)
| Datei | Key | Inhalt |
|---|---|---|
| `profileStore.ts` | `pac:profile:{buyerId}:v1` | `ProfileData` (Name, IBAN, Steuer-ID, Adressen, Zählerstände, Quellen) |
| `submissionStore.ts` | `pac:submissions:{buyerId}:v1` | Map<formId → Submission> mit Receipt-ID, Status, Channel, Daten |
| `milestoneStore.ts` | `pac:milestones:v1` | `{ [buyerId]: { [milestoneId]: status } }` – pro Käufer-Override |

**Pattern:** `getActiveBuyerId()` liest das Cookie `pac-active-buyer`; Migration vom Legacy-Key `:v1` (ohne Buyer-Prefix) ist eingebaut.

### Server-Stores
| Datei | Inhalt |
|---|---|
| `submissions/server.ts` | In-Memory `globalThis.__pacSubmissions` (überlebt nicht Server-Restart). Erzeugt `SRV-XXXX-YYYY` Receipts, idempotent über `clientReceiptId`, max 500 Records. |
| `activeBuyer.ts` | `getActiveBuyer()` server-side – liest Cookie, fällt auf `julia-m` zurück |
| `supabase.ts` | Vorbereitete Client-Factory mit `@supabase/ssr` – noch nicht in den Code-Pfad eingebunden |

### Lookup-Datasources
| Datei | Inhalt |
|---|---|
| `datasources/types.ts` | `LookupMeta`, `AddressSuggestion`, `PlaceSuggestion`, `LookupResponse<T>` |
| `datasources/server.ts` | `searchAddress()` → Nominatim · `searchPlace()` → OpenPLZ. Beide mit 3.5 s-Timeout und Fallback auf `mock.ts` |
| `datasources/client.ts` | Client-Helper für Fetch + Debounce |
| `datasources/mock.ts` | Paderborn-Mock-Suggestions als Fallback |

---

## 7. Komponenten-Inventar (`src/components/`)

| Komponente | Zweck |
|---|---|
| `Logo.tsx` | SVG-Logo (variants: `full` / `mark`) |
| `BrokerHeader.tsx` | Käufer-Header mit Logo, Broker-Branding, `BuyerSwitcher`, Profile-Link |
| `BuyerSwitcher.tsx` | Dropdown zum Käufer-Wechsel (Demo) – ruft `/api/active-buyer` |
| `OnboardingForm.tsx` | 2-Minuten-Setup, schreibt `profileStore` |
| `ProfileEditor.tsx` | 370-Zeilen-Editor mit Adress-Autocomplete, IBAN-Validierung, Zählerstände |
| `ProfileCompletenessCard.tsx` | Fortschrittsbalken + Link auf Editor |
| `InteractiveDashboard.tsx` | Käufer-Dashboard: 4 Phasen, Milestone-Klicks → `milestoneStore` + `BroadcastChannel` an Cockpit |
| `PhaseSection.tsx` | Phasen-Container mit Header |
| `MilestoneCard.tsx` | Einzelner Meilenstein, Status-Toggle, Link zum passenden Formular |
| `DocumentItem.tsx` | Formular-Kachel im Hub (Source-Type-Icon, Urgency-Badge, Status-Badge) |
| `DocumentForm.tsx` | 373-Zeilen-Detail-Renderer: 3 Branches je `sourceType` (Inhouse PDF / External Deep-Link / Communal PDF). Pre-Fill aus Profile, Submit → server + lokal |
| `MyFormsView.tsx` | Hub aller Submissions, PDF-Re-Download, Receipt-Anzeige |
| `ChatInterface.tsx` | Chat-UI, ruft `/api/chat`, zeigt Mode-Badge (Live/Demo) |
| `InteractiveBrokerList.tsx` | Cockpit-Käufer-Liste mit Live-Sync via `BroadcastChannel` |
| `ProgressBar.tsx` / `StatCard.tsx` / `StarRating.tsx` | UI-Primitives |
| `DemoReset.tsx` | Button: leert localStorage komplett |
| `PromoVideo.tsx` | iframe-Embed von `/promo.html` im Hero |
| `icons.tsx` | 12 Lucide-Style-SVGs (Check, Star, AlertTriangle, Info, Lightbulb, User, FileText, ExternalLink, Landmark, Clock, Search, Rotate) – keine Emojis im UI! |

---

## 8. Workflows (End-to-End)

### Workflow 1 – Käufer-Onboarding (Demo)
1. Nutzer öffnet `/de/welcome` → sieht Makler-Foto + persönliche Begrüßung
2. Klick "Loslegen" → `/de/onboarding`
3. Profil-Typ wählen, Basics ausfüllen → `profileStore.save()` → Redirect `/de/dashboard`
4. Dashboard zeigt Profil-Vervollständigkeit + Quick-Actions

### Workflow 2 – Meilenstein abhaken (mit Live-Sync)
1. Käufer im Dashboard klickt Milestone-Card → Status `open` → `in_progress` → `done`
2. `InteractiveDashboard` schreibt `milestoneStore.saveStatus()` + sendet `BroadcastChannel('pac-milestones').postMessage({buyerId, milestoneId, status})`
3. Geöffnetes `/de/broker` empfängt → `InteractiveBrokerList` aktualisiert die Käufer-Karte sofort

### Workflow 3 – Formular ausfüllen & einreichen
1. Käufer öffnet `/de/documents` → 17 Forms gefiltert nach Profil, gruppiert (Behörden / Versorger / Versicherung / Medien / Vermietung)
2. Klick auf Form → `/de/documents/[docId]` zeigt **profilspezifische UX je `sourceType`**:
   - **inhouse** → "PDF generieren"-Button → `jsPDF` mit Profile-Pre-Fill + Receipt-ID
   - **external_link** → "Daten zum Kopieren"-Box mit den 4–6 benötigten Feldern → Deep-Link-Button öffnet offizielle Behörden-Seite
   - **communal_pdf** → wie inhouse, aber mit "Offizielle Quelle: …"-Hinweis
3. Submission → `POST /api/submissions` (server-receipt) + lokal in `submissionStore`
4. Sichtbar in `/de/my-forms`

### Workflow 4 – KI-Chat
1. Käufer öffnet `/de/chat` → `ChatInterface` mit `propertyType`-Context
2. Eingabe → `POST /api/chat` mit kompletter Conversation-History + Profile-Hint
3. **Wenn `ANTHROPIC_API_KEY` gesetzt:** Live-Antwort von `claude-sonnet-4-6` (max 600 Tokens, System-Prompt mit Paderborn-Spezifika + Guardrails)
4. **Wenn nicht:** Keyword-Match auf 4 Demo-Antworten (`findDemoAnswer`), sonst Default-Erklärung
5. Trigger-Flag: `buyer.aiChatUsed = true` (Voraussetzung für Reputations-Trigger)

### Workflow 5 – Makler-Cockpit
1. `/de/broker` zeigt alle Käufer mit Progress-Bar (X/Y Milestones)
2. Klick auf Käufer → Drilldown (Käufer-Detail mit aktuellem Status)
3. `/de/broker/reputation` → Stats (18 Reviews, Ø 4.9, 64% Conversion), Trigger-Bedingungen sichtbar
4. `/de/broker/curators` → eigene Punkte (4 Q · 12 Total · Rang 2), Bestenliste OWL

### Workflow 6 – Mitkurations-Loop (UI vorbereitet, Backoffice manuell)
1. Makler meldet veraltetes Form (UI vorhanden, Endpoint NICHT verdrahtet)
2. Status → `under_review` (Type definiert, kein Persist-Pfad)
3. Backoffice-Prüfung manuell → Form-Update + Punkt-Vergabe → noch nicht implementiert

### Workflow 7 – Reputations-Trigger (KONZEPT, nicht implementiert)
Bedingungen alle drei: Eingezogen ≥ 7 Tage · ≥ 5 Milestones done · `aiChatUsed=true`. Aktuell nur als Doku, kein Cron-Job/Trigger.

---

## 9. Was fehlt (Backend-Lücken)

| Bereich | Status |
|---|---|
| Supabase-Schema + Migrations | Nicht angelegt |
| Auth (Magic Link / OAuth) | Nicht aktiv |
| Echtes Buyer/Broker-Persistieren | localStorage + In-Memory only |
| Submission-Receipts dauerhaft | Verlieren sich bei Server-Restart |
| CRM-Webhook-Endpoint | Konzeptionell ("Zapier-first") |
| Reputations-Trigger-Job | Nicht implementiert |
| Mitkurations-Workflow | UI-Hooks existieren, Persist fehlt |
| Echte PDF-Spiegelung der Kommunal-Formulare | Aktuell nur Receipts-PDF (kein Field-Mapping in Original-PDFs) |
| E-Mail-Versand (Welcome, Reminder, Review-Request) | Kein Mailer eingebunden |
| Mehrsprachigkeit | i18n-Layer steht, nur `de.json` befüllt (411 Zeilen) |

---

## 10. Wichtige Konventionen & Gotchas

- **Keine Emojis im UI** – alle Icons über `components/icons.tsx` (Commit `d52235a`).
- **`next-intl`-Pattern:** Server-Components nutzen `getTranslations()` + `setRequestLocale()`. Client-Components nutzen `useTranslations()`.
- **`async params`-Pattern (Next 14):** `params: Promise<{ locale: string }>` muss awaited werden.
- **Active-Buyer-Cookie ist die Single Source of Truth** für "wer bin ich gerade in der Demo". Client-Stores lesen das Cookie, Server-Routen ebenso.
- **PDF-Generation läuft client-side** (jsPDF) – kein Server-Roundtrip, kein Storage. Pure Demo.
- **`BroadcastChannel('pac-milestones')`** ist die einzige Live-Sync-Mechanik. Funktioniert nur im selben Browser über Tabs hinweg.
- **Server-Submission-Store ist `globalThis`-basiert** – in Dev OK, in Serverless-Production (Vercel) verloren bei jedem Cold-Start. Muss ersetzt werden, sobald Supabase live ist.
- **Brand-Farben:** `brand-{50–950}` (Hauptton `#0469c4`) + `ink` / `ink-soft` / `ink-muted`. Definiert in `tailwind.config.ts`.
- **Container-Klassen:** `container-page`, `card`, `btn-primary`, `btn-secondary`, `chip` – global in `src/app/globals.css`.
- **CSP / DSGVO:** Externe Assets (Unsplash für Broker-Foto, Nominatim, OpenPLZ) – beachte für Produktion EU-Hosting + AVV.

---

## 11. Letzte 10 Commits (Branch `claude/propaftercare-mvp-MVJBG`)

```
60dc90e feat(landing): replace pricing tiers with "Preis auf Anfrage" card  ← HEAD
a8b1f2d feat(landing): add founder headshot for Forbes-style section
3d4f03c feat(landing): add Forbes-style founder section before pricing
d52235a refactor(ui): replace all emojis with Lucide-style inline SVG icons
1254899 chore(landing): remove "Pilotplatz sichern" hero CTA
b7d735d feat(landing): embed promo animation in hero
daac804 feat(demo): real PDFs, per-buyer data isolation, Meine-Formulare hub
f2e5b09 feat(demo): end-to-end pilot demo flow
4e9fca0 feat: profile editor and server-side submission receipts
f6ae9d3 feat(documents): make form actions actually work
```

---

## 12. Sofort-Anlauf für eine neue Session

```bash
# 1. Branch sicherstellen
git checkout claude/propaftercare-mvp-MVJBG

# 2. Dependencies (falls Fresh-Clone)
npm install

# 3. Dev
npm run dev   # → http://localhost:3000 → redirect /de

# 4. Verify nach Änderungen
npm run lint && npm run build
```

**Häufige Einstiegspunkte für Folge-Aufgaben:**
- Marketing-Tweaks → `src/app/[locale]/page.tsx` + `src/i18n/locales/de.json` (`marketing.*`)
- Neues Paderborn-Formular → `src/types/index.ts` (DocumentId) + `src/lib/documents.ts` (Entry)
- Neuer Milestone → `src/types/index.ts` (MilestoneId) + `src/lib/milestones.ts` (Template) + `de.json` (`milestones.*`)
- Chat-System-Prompt → `src/lib/chatSystem.ts`
- Supabase verdrahten → `src/lib/supabase.ts` (Factory existiert, ersetzt In-Memory- und localStorage-Stores)
- Reputations-Trigger → neuer Cron / Edge-Function, liest Buyer + checkt 3 Bedingungen, sendet Mail

---

## 13. Referenzen

- **Konzept:** [`docs/briefing-v1.1.md`](./briefing-v1.1.md) – 14 Konzept-Entscheidungen, Personas, Inventar, Risiken
- **Pitch:** `PropAfterCare-Pitch.pptx` (generiert via `scripts/build_pitch.py`)
- **Pilot-Markt:** Paderborn, Sommer 2026 · 3–5 Pilotmakler aus persönlichem Netzwerk
- **Kontakt:** finn.luca.wenzel@gmx.de

---

*Dieses Dokument spiegelt den Code-Stand zum Branch-HEAD `60dc90e`. Bei substantiellen Änderungen am Datenmodell, neuen Routen oder Backend-Anbindung bitte hier nachziehen.*
