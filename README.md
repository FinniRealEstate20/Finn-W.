# PropAfterCare

Post-Transaction Betreuungsplattform für Immobilienmakler – B2B2C SaaS.

Aus jedem Notartermin werden vier Google-Bewertungen: Der Käufer erlebt Fürsorge, der Makler erntet Bewertungen und Folgegeschäft.

**Pilotmarkt:** Paderborn, Sommer 2026.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- next-intl (i18n, MVP nur DE; TR/AR/RU vorbereitet)
- Supabase (Auth + DB + Storage, EU/Frankfurt)
- Stripe Billing (3 Tarife · Customer Portal)
- Anthropic Claude API (KI-Chat mit Guardrails)

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Keys eintragen
npm run dev
```

Öffne http://localhost:3000 – Middleware leitet automatisch auf `/de`. Ohne Login funktioniert der komplette Demo-Pfad mit Mock-Daten.

## Production-Deployment

### 1. Supabase (EU-Region/Frankfurt)

1. Neues Projekt anlegen, Region **eu-central-1**.
2. SQL-Editor: `supabase/migrations/0001_init.sql` ausführen.
3. SQL-Editor: `supabase/migrations/0002_storage.sql` ausführen.
4. Env-Vars notieren: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Auth → URL-Konfiguration → Redirect-URL `https://<dein-host>/auth/callback` eintragen.

### 2. Stripe

1. Im Dashboard 3 wiederkehrende Preise anlegen (€49, €149, €399 / Monat).
2. Price-IDs in Env-Vars eintragen: `STRIPE_PRICE_ID_STARTER`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_BUSINESS`.
3. Webhook-Endpoint anlegen für `https://<dein-host>/api/stripe/webhook`, abonnierte Events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Webhook-Secret in `STRIPE_WEBHOOK_SECRET` ablegen, `STRIPE_SECRET_KEY` aus Dashboard.

### 3. Encryption-Key (PII at rest)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

In `DATA_ENCRYPTION_KEY_V1` ablegen. **Niemals rotieren ohne Re-Encryption-Job.**

### 4. Cron-Job

`vercel.json` aktiviert automatisch täglich 03:00 UTC den DSGVO-Sweeper.
`CRON_SECRET` (32+ Zeichen Zufall) als Env-Var hinterlegen.

### 5. Vercel Deploy

```bash
vercel --prod
```

Env-Vars vor dem Deploy alle im Vercel-Dashboard setzen.

## Routen

| Pfad | Zweck |
|---|---|
| `/de` | Marketing-Landing mit Pitch, Features, Pricing |
| `/de/welcome` | Begrüßung nach Notar-E-Mail (White-Label) |
| `/de/onboarding` | 2-Minuten-Setup für Käufer |
| `/de/dashboard` | Käufer-Dashboard mit Meilenstein-Tracker |
| `/de/documents` | Formular-Hub Paderborn |
| `/de/documents/[docId]` | Einzelnes Formular |
| `/de/chat` | KI-Assistent mit Guardrails |
| `/de/dsgvo` | Datenexport + 14-Tage-Löschung |
| `/de/auth/buyer` · `/de/auth/broker` | Magic-Link-Login |
| `/de/broker` | Makler-Cockpit |
| `/de/broker/invitations` | Käufer-Einladungs-Codes |
| `/de/broker/billing` | Stripe-Tarif + Customer-Portal |
| `/de/broker/reputation` | Reputations-Cockpit |
| `/de/broker/curators` | Mitkuratoren-Programm |

## Datenmodell (Production)

- **buyer_profiles**: PII verschlüsselt (`*_enc` Felder, AES-256-GCM, `key_version`)
- **broker_profiles** + **organizations**: White-Label, Stripe-Subscription-Status, Plan
- **invitations**: Code-basierte Käufer-Onboarding (1 Code = 1 Käufer)
- **submissions** + **fill_audits**: Formular-Status-Lebenszyklus mit Audit-Trail
- **milestones_completed**: 13 Meilensteine in 4 Phasen, Per-Buyer-Override
- **data_delete_requests**: 14-Tage-Grace-Period mit `scheduled_for`

Alle PII-Felder werden über `src/lib/security/encryption.ts` versionsfähig verschlüsselt. Re-Encryption-Jobs nutzen `key_version` zur Migration.

## Sicherheit

- RLS aktiv auf allen User-Daten-Tabellen
- Magic-Link-Auth (kein Passwort-Storage)
- Stripe-Webhook-Signatur-Verifikation
- Cron-Endpoint geschützt mit `Bearer ${CRON_SECRET}`
- DSGVO-Export rate-limited (3/Tag pro User)

## Status

✅ MVP komplett · ✅ Supabase-Schema + RLS · ✅ Stripe Billing · ✅ DSGVO Export+Delete · ✅ PII-Verschlüsselung · ✅ Build sauber

📍 Pilotmarkt Paderborn (17 Formulare) · 📍 EU-Hosting (Frankfurt) · 📍 14-Tage-Grace-Period bei Account-Löschung
