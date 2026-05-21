# PropAfterCare

Post-Transaction Betreuungsplattform für Immobilienmakler – B2B2C SaaS.

Aus jedem Notartermin werden vier Google-Bewertungen: Der Käufer erlebt Fürsorge, der Makler erntet Bewertungen und Folgegeschäft.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- next-intl (i18n, aktuell nur DE aktiv; TR/AR/RU vorbereitet)
- Supabase (Auth + DB, Setup vorbereitet)
- Anthropic Claude API (KI-Assistent mit Guardrails, Setup vorbereitet)

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Keys eintragen (optional im MVP)
npm run dev
```

Öffne http://localhost:3000 – die Middleware leitet automatisch auf `/de`.

## Routen

| Pfad | Zweck |
|---|---|
| `/de` | Marketing-Landing mit Pitch, Features, Pricing |
| `/de/welcome` | Begrüßung nach Notar-E-Mail (White-Label) |
| `/de/onboarding` | 2-Minuten-Setup für Käufer |
| `/de/dashboard` | Käufer-Dashboard mit Meilenstein-Tracker |
| `/de/documents` | Formular-Hub (Behörden, Versorger, Versicherungen) |
| `/de/documents/[docId]` | Einzelnes Formular mit Auto-Fill |
| `/de/chat` | KI-Assistent mit Guardrails |
| `/de/broker` | Makler-Cockpit (Kundenübersicht) |
| `/de/broker/reputation` | Reputations-Cockpit (Bewertungs-Mechanik) |

## Projektstruktur

```
src/
├── app/                Next.js App Router
│   ├── layout.tsx
│   ├── globals.css
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx                Landing
│       ├── welcome/page.tsx
│       ├── onboarding/page.tsx
│       ├── dashboard/page.tsx
│       ├── documents/
│       │   ├── page.tsx
│       │   └── [docId]/page.tsx
│       ├── chat/page.tsx
│       └── broker/
│           ├── page.tsx
│           └── reputation/page.tsx
├── components/         Wiederverwendbare UI-Bausteine
├── i18n/               next-intl Setup + Locale-Dateien
├── lib/                Mock-Daten, Milestone-Logik, Formular-Katalog
├── middleware.ts       Locale-Routing
└── types/              TypeScript-Modelle
```

## Datenmodell (Auszug)

- **Buyer**: Profildaten, Objekttyp (`ownUse` | `investment`), Sprache, 12 Meilensteine in 4 Phasen
- **Broker**: White-Label-Daten, Google-Review-URL, Reputations-Metriken
- **Milestone**: Phase 1–4, Status, Filterung nach Objekttyp
- **Document**: 16 Formulare in 5 Kategorien, mit/ohne Auto-Fill

## Status

✅ UI-Scaffold komplett · ✅ Mock-Daten · ✅ Deutsche UI-Texte komplett

🚧 Backend (Supabase-Schema, API-Routen) · 🚧 Echte KI-Chat-Anbindung · 🚧 CRM-Webhook-Endpoints · 🚧 Reputations-Trigger-Logik · 🚧 TR/AR/RU-Übersetzungen
