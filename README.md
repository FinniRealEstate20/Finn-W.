# PropAfterCare

Post-Transaction Betreuungsplattform für Immobilienmakler – B2B2C SaaS.

Aus jedem Notartermin werden vier Google-Bewertungen: Der Käufer erlebt Fürsorge, der Makler erntet Bewertungen und Folgegeschäft.

**Pilotmarkt:** Paderborn, Sommer 2026.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- next-intl (i18n, MVP nur DE; TR/AR/RU vorbereitet)
- Supabase (Auth + DB, Setup vorbereitet)
- Anthropic Claude API (KI-Assistent mit Guardrails, Setup vorbereitet)

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Keys eintragen (optional im MVP)
npm run dev
```

Öffne http://localhost:3000 – Middleware leitet automatisch auf `/de`.

## Routen

| Pfad | Zweck |
|---|---|
| `/de` | Marketing-Landing mit Pitch, Features, Pricing |
| `/de/welcome` | Begrüßung nach Notar-E-Mail (White-Label) |
| `/de/onboarding` | 2-Minuten-Setup für Käufer (3 Profile) |
| `/de/dashboard` | Käufer-Dashboard mit Meilenstein-Tracker + kritische Fristen |
| `/de/documents` | Formular-Hub Paderborn mit Quelltyp-Legende |
| `/de/documents/[docId]` | Einzelnes Formular mit Quelltyp-spezifischer UX |
| `/de/chat` | KI-Assistent mit Guardrails |
| `/de/broker` | Makler-Cockpit (Kundenübersicht) |
| `/de/broker/reputation` | Reputations-Cockpit (Bewertungs-Mechanik) |
| `/de/broker/curators` | Mitkuratoren-Programm (Anreiz-System 3/6/9) |

## Konzept-Stand

Vollständig dokumentiert in [`docs/briefing-v1.1.md`](docs/briefing-v1.1.md):

- 3 Käufer-Profile (`ownUse` / `investment-self` / `investment-managed`)
- 3 Formular-Quelltypen (📝 Inhouse / 🔗 Externer Deep-Link / 🏛️ Kommunal-PDF)
- Pilotstadt Paderborn mit 17 spezifischen Formularen
- Reputations-Trigger: Eingezogen + ≥7 Tage + ≥5 Milestones + KI-Chat ≥1×
- Anreiz-System: 3/6/9 Punkte für aktive Mitkuratoren
- Reminder-Frequenz: 2–3× pro Woche bei kritischen Fristen

## Projektstruktur

```
src/
├── app/[locale]/        Next.js App Router (Käufer + Broker Routen)
├── components/          BrokerHeader, MilestoneCard, DocumentItem, etc.
├── i18n/                next-intl Setup + Locale-Dateien (de.json)
├── lib/                 Mock-Daten, Milestone-Logik, Formular-Katalog
├── middleware.ts        Locale-Routing
└── types/               TypeScript-Modelle (FormEntry, Buyer, Broker, ...)

docs/
└── briefing-v1.1.md     Vollständiges Konzept-Briefing
```

## Datenmodell (Auszug)

- **Buyer**: 3 Profile, Profil-Vervollständigkeit, KI-Chat-Nutzung (für Trigger), 13 Meilensteine in 4 Phasen
- **Broker**: White-Label-Daten, Google-Review-URL, Reputations-Metriken, Mitkurations-Punkte
- **Milestone**: Phase 1–4, Status, Filterung nach Profil, `isCriticalDeadline`-Flag
- **FormEntry**: 3 Quelltypen, Status-Lebenszyklus, Versionierung, Region-Filter, Submission-Methode

## Status

✅ UI-Scaffold komplett · ✅ Mock-Daten Paderborn · ✅ Deutsche UI-Texte komplett · ✅ Build sauber

🚧 Backend (Supabase-Schema, API-Routen) · 🚧 Echte KI-Chat-Anbindung · 🚧 CRM-Webhook-Endpoints · 🚧 Reputations-Trigger-Logik · 🚧 PDF-Spiegelung & Field-Mapping
