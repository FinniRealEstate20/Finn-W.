# Projekt-Briefing: PropAfterCare

### Post-Transaction Betreuungsplattform für Immobilienmakler

**Version:** 1.1
**Datum:** Mai 2026
**Status:** Konzept-Vertiefung nach Pilotmarkt-Recherche und Workflow-Design

---

## Changelog ggü. v1.0

Dieses Dokument konsolidiert 14 Entscheidungen aus der gemeinsamen Konzept-Arbeit im Mai 2026 und ersetzt v1.0. Wesentliche Änderungen:

| Bereich | Änderung |
|---|---|
| **Pilotstadt** | Paderborn statt Frankfurt/München/Berlin |
| **Käufer-Profile** | Drei statt zwei: `ownUse`, `investment-self`, `investment-managed` |
| **Formular-Hub** | Drei Quelltypen formalisiert (A: Inhouse · B: Externer Deep-Link · C: Kommunal-PDF) |
| **Auto-Versand verworfen** | Aus RDG-/StBerG-Risiken: keine Software-seitige Behörden-Einreichung. Stattdessen Pre-Fill + transparente Submission-Wege |
| **Reputations-Trigger verschärft** | 7 Tage + ≥5 Milestones + KI-Chat ≥1× genutzt |
| **Anreiz-System für Makler** | Punktebasiert (3/6/9) für Mitkurations-Meldungen |
| **PDF-Storage** | Eigene Spiegelung mit transparenter Quellangabe (rechtlich okay nach §5 UrhG) |
| **Reminder-Frequenz** | Bei kritischen Fristen 2–3× pro Woche, sonst max. 1× |

---

## 1. Executive Summary

**PropAfterCare** ist eine B2B2C-SaaS-Plattform, die Immobilienmaklern ermöglicht, ihre Käufer und Verkäufer nach dem Notartermin automatisiert, strukturiert und professionell zu betreuen – von der Unterschrift bis zum Einzug. Der Makler zahlt, der Kunde profitiert kostenlos.

> **Strategische Neurahmung (unverändert):** PropAfterCare ist primär eine **Reputations- und Empfehlungsmaschine** für Makler, verpackt als Kundenservice. Der Käufer erlebt Fürsorge, der Makler erntet Bewertungen und Folgegeschäft.

**Pilot:** Paderborn, Sommer 2026. Drei bis fünf Pilotmakler aus persönlichem Netzwerk.

---

## 2. Problem & Marktlücke

(Unverändert ggü. v1.0)

Der Immobilienkauf endet für den Makler am Notartisch – für den Käufer beginnt dort die stressigste Phase. Zwischen Notartermin und Einzug entstehen typischerweise Unklarheiten bei Kaufpreiszahlung, Bankabwicklung, Handwerker-Koordination, Steuerthemen, Meldepflichten und bei Kapitalanlagen zusätzlich Mietrecht und Verwaltung. Kein bestehendes Tool adressiert diesen "Post-Closing Gap" gezielt für den deutschen Markt.

---

## 3. Produkt-Vision & Scope

(Unverändert ggü. v1.0)

Eine Web-App (mobile-optimiert), die nach CRM-Trigger automatisch aktiviert wird und dem Käufer eine personalisierte Betreuungsstrecke bietet. Kein CRM-Ersatz, kein Rechtsberatungsportal, kein Immobilien-Marktplatz.

---

## 4. Zielgruppen

### Primär-Kunde: Der Makler (Zahler)

Einzelmakler und kleine Maklerbüros (2–15 Mitarbeiter), digital-affin, mit Servicequalitäts-Anspruch. **Pilot-Markt Paderborn:** geschätzt 30–50 aktive Makler, davon 3–5 als Pilotpartner gewinnbar.

### End-Nutzer: Drei Profile statt zwei

| Profil | Beschreibung | Kernaufgaben |
|---|---|---|
| **ownUse** (Eigennutzer) | Selbstbewohnt, oft Erstkäufer/Familien | Einzug, Ummeldung, Versorger, Handwerker |
| **investment-self** | Kapitalanlage, selbst vermietend | Mietvertrag, IBAN-Konten, AfA-Doku, Vermieter-Haftpflicht, Mietersuche |
| **investment-managed** | Kapitalanlage mit Hausverwaltung | Verwaltungs-Auswahl, Steuer, Verträge – Versorger/Mieter/Abfall macht Verwaltung |

### Mehrsprachigkeit

Im Pilotmarkt Paderborn (~92% deutschsprachig) **nur Deutsch im MVP.** Türkisch, Arabisch, Russisch sind in der Infrastruktur vorbereitet (i18n-Layer, Locale-Routing), werden aber erst aktiviert, wenn wir in Großstädte expandieren.

---

## 5. Kernfunktionen (MVP)

### 5.1 Automatisiertes Onboarding via CRM-Trigger

- Integration in MVP: **Zapier-Webhook** (lowcode-first)
- Phase 2: Native Integrationen zu Flowfact, Propstack, OnOffice
- Datenpunkte: Käufer-Name, E-Mail, Objektadresse, Profil-Typ (3 Werte), Kaufpreis-Segment, geschätztes Übergabedatum, Makler-ID

### 5.2 Personalisierter Meilenstein-Tracker

**Selbst-Bestätigung:** Käufer hakt selbst ab. Vertrauensbasiert. Keine Foto-/Beleg-Pflicht im MVP.

**12 Meilensteine in 4 Phasen:**

```
Phase 1 (Woche 1–4): Direkt nach Notar
  - Auflassungsvormerkung erhalten
  - Fälligkeitsmitteilung von Notar
  - Kaufpreis überweisen
  - Grunderwerbsteuer

Phase 2 (Woche 4–12): Vor Übergabe
  - Wohngebäudeversicherung
  - Handwerker koordinieren
  - [investment-*] Mietvertrag vorbereiten

Phase 3 (Woche 12+): Übergabe & Einzug
  - Übergabeprotokoll
  - [ownUse] Anmeldung Bürgerservice (Pflicht 14 Tage)
  - Versorger anmelden

Phase 4 (Monat 3–12): Nach Einzug
  - [investment-self] AfA-Dokumentation
  - [investment-*] Nebenkostenabrechnung
```

### 5.3 KI-gestützter Assistent

- Anthropic Claude API
- **Klar definierte Rolle:** Übersetzer zwischen Lebenssituation und Bürokratie. Keine Versender-Funktion.
- Guardrail-Pflicht: "Dies ist keine Rechts- oder Steuerberatung."
- Eskalationspfad: Direktlink zu Experten im Partnernetzwerk

### 5.4 Formular-Hub mit drei Quelltypen

Statt einer einheitlichen Form-Implementierung formalisieren wir drei klar getrennte Quelltypen:

| Typ | Beispiel | Mechanik | Aufwand |
|---|---|---|---|
| **A – Inhouse vorausgefüllt** | GEZ, Nachsendeauftrag, Mustermietvertrag | Wir generieren das PDF mit Profildaten, Käufer prüft und sendet/druckt | Hoch (Pflege) |
| **B – Externer Deep-Link** | Strom (Westfalen Weser), KFZ (i-Kfz), Wohnsitzanmeldung (elektronisch) | "Daten zum Kopieren"-Box davor, dann Link ins offizielle Portal | Niedrig |
| **C – Kommunal-PDF** | Stadt-Formulare Paderborn (eigene Spiegelung, mit Pre-Fill) | Wir füllen das offizielle Behörden-PDF mit Profildaten via Field-Mapping | Mittel pro Form |

**Auto-Versand bewusst verworfen.** Begründung: Rechtsdienstleistungsgesetz (§5 RDG), Steuerberatungsgesetz (§5 StBerG), faktisch nicht-existente Behörden-E-Mail-Schnittstellen. Der Käufer bleibt immer Akteur.

### 5.5 Reputations-Modul

**Trigger-Bedingungen (verschärft ggü. v1.0):**

```
ALLE müssen wahr sein:
  - Meilenstein "Eingezogen" ✓ vor ≥7 Tagen
  - ≥5 Meilensteine insgesamt abgehakt
  - KI-Chat ≥1× genutzt
```

→ Dann: personalisierte E-Mail im Namen des Maklers mit Google-Bewertungs-Direktlink. Erwartete Conversion 35–45%, dafür Volumen bewusst niedriger gehalten – Qualität geht vor Quantität.

### 5.6 Makler-Cockpit & Mitkurations-Loop

**Reputations-Cockpit** mit Live-Metriken (Bewertungen generiert, Ø Sterne, Conversion-Rate).

**Makler-Feedback-Loop für Formular-Aktualität:**

```
Makler meldet veraltetes Form
   ├── Form-Status → 'under_review' (bleibt nutzbar mit Warnsymbol)
   ├── Backoffice-Prüfung binnen 48h (im MVP: Du selbst)
   ├── Bei Bestätigung: Form aktualisiert, Punkt für Makler vergeben
   └── Bei Zurückweisung: zurück auf 'active', kein Punkt, keine Strafe

Anreiz-System pro Quartal:
  3 Punkte → 1 Monat Abo kostenlos
  6 Punkte → 2 Monate kostenlos + "Top-Mitkurator OWL"-Badge
  9+ Punkte → persönliches Dankschreiben

Bestenliste pro Region öffentlich im Cockpit (Top 5).
```

---

## 6. UI/UX Leitlinien

(Unverändert ggü. v1.0 – Vertrauen durch Klarheit, Mobile-first, Progress sichtbar, Makler-Gesicht prominent, "Du"-Ansprache)

**Profil-Erfassung (Hybrid-Ansatz):**
- Onboarding: nur 2 Minuten, Basics
- Im Dashboard: "Profil vervollständigen"-Karte mit Fortschritt
- Käufer füllt freiwillig auf einmal aus, wenn er Lust hat
- Wenn ein Formular Zusatzdaten braucht: Inline-Eingabe-Modal

**Reminder-Frequenz:**
- Standard: max. 1× pro Woche
- Bei **kritischen Fristen** (Bürgerservice-Anmeldepflicht 14 Tage, Kaufpreis-Frist, Grunderwerbsteuer-Zahlung, Sonderkündigungsrecht Versicherung): 2–3× pro Woche bis erledigt

---

## 7. Technische Architektur

### Stack-Empfehlung MVP

Unverändert ggü. v1.0: Next.js + Supabase (EU-Region Frankfurt) + Anthropic Claude API + Vercel.

### Erweitertes Form-Datenmodell

Alle drei Schichten:

```ts
interface FormEntry {
  // KERN
  id: string;
  name: string;
  category: 'authorities' | 'utilities' | 'insurance' | 'media' | 'rental';
  sourceType: 'inhouse' | 'external_link' | 'communal_pdf';
  officialSource: string;
  status: 'active' | 'under_review' | 'outdated';
  lastCheckedAt: string;
  sourceVersion?: string;
  forPropertyType: 'ownUse' | 'investment-self' | 'investment-managed' | 'both';
  region?: string;
  submissionMethod: 'in_person' | 'postal' | 'online_portal' | 'email';
  submissionTarget?: string;
  whyNeeded: string;
  description: string;

  // ERWEITERT
  triggerMilestone?: MilestoneId;
  urgencyDays?: number;
  requiredDocs?: string[];
  estimatedTimeMin?: number;
  estimatedCost?: string;
  estimatedProcessing?: string;
  consequenceIfMissing?: string;

  // PREMIUM
  version: number;
  previousVersionId?: string;
  changelog?: Array<{ date: string; change: string; editor: string }>;
  translations: { de: { ... }; tr?: { ... }; ar?: { ... }; ru?: { ... } };
  feedbackCount: number;
  lastFeedbackAt?: string;
  successRate?: number;
}
```

Plus quelltyp-spezifische Felder via Discriminated Union (siehe Konzept-Notizen).

### PDF-Storage

**Eigene Spiegelung im EU-Storage** (Supabase Storage / Vercel Blob).
Rechtlicher Rahmen: Amtliche Werke sind nach §5 UrhG gemeinfrei. Wir spiegeln einmalig, versionieren und zeigen die Originalquelle transparent über jedem PDF an.

### Datenschutz & DSGVO

- EU-Hosting (Frankfurt)
- AVV mit jedem Makler
- Sensible Daten (IBAN, Steuer-ID, Geburtsdatum): gespeichert, **zweckgebunden** (nur Pre-Fill), Löschfrist 24 Monate post-Einzug
- Käufer-Daten gehören dem Makler – PropAfterCare ist Auftragsverarbeiter

### System-Trigger (7 Stück)

| # | Trigger | Auslöser | Aktion |
|---|---|---|---|
| 1 | Deal Closed | CRM-Webhook | Buyer + 12 Milestones anlegen, Welcome-Mail |
| 2 | Meilenstein abgehakt | Käufer-Klick | Nächste Karte freischalten |
| 3 | Phase-Wechsel | Erster Meilenstein der nächsten Phase fällig | Erklär-Karte |
| 4 | Zeitbasierter Reminder | Fälligkeit + X Tage ohne Aktion | E-Mail / Push (Frequenz abhängig von Kritikalität) |
| 5 | Profil-Daten-Bedarf | Käufer öffnet Formular, das Daten X braucht | Inline-Eingabe-Modal |
| 6 | **Reputations-Trigger** | Eingezogen ≥7 Tage + ≥5 Milestones + KI-Chat ≥1× | Bewertungs-Mail im Namen des Maklers |
| 7 | Phase-4-Wind-Down | Tag 365 nach Einzug | Letzter Check, Archiv-Modus |

---

## 8. Revenue-Modell

(Unverändert ggü. v1.0)

Säule 1: SaaS-Abo Starter 49 € / Pro 129 € / Agency 299 € pro Monat.
Säule 2: Dienstleister-Provisionen (5–15%).
Säule 3 (Phase 2): Premium-Inhalte.

**Anpassung Unit Economics für Pilotmarkt Paderborn:**

Da Paderborn deutlich kleinerer Markt ist als ursprünglich angenommen, sind die Briefing-v1.0-Zahlen (50 Makler × 100 €) nicht in Paderborn allein erreichbar. Realistische Erwartung für Jahr 2:

- 5 Pilot-Makler Paderborn × 100 € = 500 € MRR Pilot
- Skalierung in OWL (Bielefeld, Detmold) erforderlich, um Briefing-Ziele zu erreichen
- Alternativ: Vor-Skalierung in 1 Großstadt nach Paderborn-Validierung

---

## 9. Kritische Risiken

### 🔴 KRITISCH: Rechtliche Haftung (weiterhin offen)

Status unverändert ggü. v1.0. Anwalt für AGB-Erstellung und Haftungsrahmen-Definition ist nächster konkreter Schritt. **Wichtige Klärung:** Auto-Versand wurde verworfen – damit ist das RDG-/StBerG-Risiko deutlich reduziert, aber nicht eliminiert (KI-Antworten zu Steuer/Recht bleiben Haftungsthema).

### 🟡 MITTEL: CRM-Integration Komplexität

Zapier-first im MVP. Welche zwei nativ priorisieren bleibt offen.

### 🟡 MITTEL: Dienstleister-Qualität

**Lösung präzisiert:** Manuelles Onboarding in Paderborn, Bewertungssystem, 3-Strike-Rauswurf. Mit nur 3–5 Pilot-Maklern und der ersten Welle Dienstleistern ist das im MVP händisch beherrschbar.

### 🟡 MITTEL: Makler-Adoption

Onboarding < 15 Min. Demo-Video. Gewinner-Logik des Anreiz-Systems (3/6/9 Punkte) macht den Hub-Mehrwert nach erstem Quartal greifbar.

### 🟢 NIEDRIG: Mehrsprachige KI-Qualität

Im MVP irrelevant (nur DE). Wird relevant ab Großstadt-Expansion.

### 🟢 NIEDRIG (neu): Stadtwerke-Paderborn-Einschränkung

Vertragsabschluss nur persönlich. Wird durch Termin-Direktlink + Daten-PDF abgefangen. Kein Showstopper, eher Featurelücke.

---

## 10. Go-to-Market

### Phase 1: Pilotmarkt Paderborn (Monat 1–6)

**Erste 3–5 Makler aus eigenem Netzwerk:**
- Pilotpreis: 0 € für 6 Monate gegen Feedback und Testimonial
- Aktive Mitkuration des Formular-Hubs (Anreiz-System ab Tag 1)

**Erste Dienstleister:**
- 2 Steuerberater (Immobilien-Schwerpunkt)
- 2 Handwerker
- 1 Umzugsunternehmen
- 1 Hausverwaltung (für `investment-managed`-Profil)

### Phase 2: OWL-Skalierung (Monat 7–12)

Bielefeld + Detmold als Nachbar-Märkte (OWL-Region, ähnliche Versorger-Landschaft, ähnliche Behörden-Strukturen). Hier können wir Paderborn-Erkenntnisse direkt nutzen.

### Phase 3: Großstadt-Expansion (Monat 13+)

Ab hier wird Mehrsprachigkeit (TR/AR/RU) relevant. Reihenfolge tbd – Frankfurt oder Köln als erste Großstadt mit hoher Diversität.

---

## 11. Wettbewerbsanalyse

(Unverändert ggü. v1.0)

---

## 12. Nächste Schritte

### Sofort (Woche 1–4)

- [ ] Anwalt für AGB, Datenschutzhinweise, AVV beauftragen (Fokus: KI-Antworten + Form-Hub)
- [ ] Erste 2 Paderborner Pilot-Makler ansprechen
- [ ] Code-Update: 3-Profile-Erweiterung, neues FormEntry-Modell
- [ ] Erstes Paderborn-Inventar konkret: 16 Forms in v1.0 → 17 mit ASP-Abfallanmeldung

### Kurzfristig (Monat 1–3)

- [ ] MVP-Backend (Supabase-Schema, API-Routen, Auth)
- [ ] KI-Chatbot mit Guardrails (Anthropic-Anbindung)
- [ ] Erste 5 Dienstleister-Paderborn onboarden
- [ ] Betriebshaftpflicht abschließen
- [ ] Reputations-Trigger-Logik implementieren

### Mittelfristig (Monat 3–6)

- [ ] CRM-Integration (Zapier-Webhook + die 2 priorisierten nativen)
- [ ] Feedback-Loop mit Pilot-Maklern: wöchentliche Calls
- [ ] OWL-Skalierung vorbereiten

---

## 13. Offene Entscheidungen

| # | Frage | Status | Dringlichkeit |
|---|---|---|---|
| 1 | Pilotstadt | ✅ **Paderborn** | erledigt |
| 2 | Haftungsstrategie (Anwalt) | 🔴 offen | sofort |
| 3 | Welche 2 CRMs zuerst integrieren | 🟡 offen | Monat 1 |
| 4 | Produktname (final) | 🟡 offen | Monat 1 |
| 5 | Eigenentwicklung vs. Entwickler-Partner | 🟡 offen | Monat 1 |
| 6 | Dienstleister-Qualitätssicherung | ✅ **manuelles Onboarding + 3-Strike** | erledigt |
| 7 | Österreich-Expansion | 🟢 offen | Monat 6+ |

---

## 14. Formular-Hub – Paderborn-spezifisches Inventar (Stand 05/2026)

| # | Form | Typ | Profil | Submission |
|---|---|---|---|---|
| 1 | Wohnsitz-Anmeldung Paderborn | B | ownUse | Elektronisch (Online-Ausweis) ODER Termin Bürgerservice |
| 2 | KFZ-Ummeldung Kreis Paderborn | B | ownUse | i-Kfz Stufe 4 online (3 Min) |
| 3 | Grundsteuer-Erklärung | B | both | ELSTER (bundesweit) |
| 4 | Strom – Westfalen Weser Energie | B | ownUse | Online-Portal |
| 5 | Strom – Stadtwerke Paderborn | A+B | ownUse | Termin-Buchung + Daten-PDF zum Mitnehmen |
| 6 | Gas | B/A | ownUse | Wie Strom |
| 7 | Wasser – Wasserwerke Paderborn | A | investment-self | Nur Eigentümer/Vermieter (selbst) |
| 8 | ASP Abfallanmeldung Paderborn | C | investment-self | Online-Formular, 20 € pro Änderung |
| 9 | Internet & Telefon | B | ownUse | Verivox/Check24 |
| 10 | Wohngebäudeversicherung-Übergang | A | both | Kündigungs-/Bestätigungs-Brief vorausgefüllt |
| 11 | Hausratversicherung | B | ownUse | Vergleichsportale |
| 12 | Rundfunkbeitrag (GEZ) | A | ownUse | Vorausgefülltes Formular, dann Online-Portal |
| 13 | Nachsendeauftrag | B | ownUse | Deutsche Post (kostenpflichtig) |
| 14 | Daueraufträge aktualisieren | A | both | Persönliche Checkliste |
| 15 | Hausverwaltung beauftragen | – | investment-managed | Vermittlung über PropAfterCare-Partnernetzwerk |
| 16 | Mietvertrag-Template | A | investment-self | Rechtlich geprüftes Template, an Objekt anpassbar |
| 17 | Vermieter-Haftpflicht | B | investment-self | Deep-Link Versicherer |

---

## 15. Personas (aktualisiert)

### Persona A – Der Makler: Thomas K., 42, Paderborn

- 12 Jahre Erfahrung, 20–30 Deals/Jahr
- Nutzt Onoffice oder Propstack, iPhone, WhatsApp intensiv
- Problem: Käufer rufen ihn nach dem Notar ständig mit Fragen an, die er nicht beantworten kann
- Motivation: Endlich einen professionellen "Abschluss" für Kunden bieten, ohne nacharbeiten zu müssen
- Zahlungsbereitschaft: 100–150 €/Monat bei klarem Reputations-Mehrwert

### Persona B – Eigennutzerin: Julia M., 34, Paderborn-Schloß Neuhaus

- Kauft Erstimmobilie mit Partner, 3-Zimmer-Wohnung, 320.000 €
- Emotional investiert, überwältigt von Bürokratie
- Fragen: Wann kann ich einziehen? Wen rufe ich bei Mängeln an? Wie melde ich um?
- Wünscht sich: "Jemand der mir sagt, was das Nächste ist."

### Persona C – Kapitalanleger: Lukas B., 38, Paderborn, selbstvermietend

- Kauft 2-Zimmer-Wohnung in Stadtmitte als Kapitalanlage, 220.000 €
- Tech-affin (arbeitet bei dSPACE/Atos), aber kein Steuerexperte
- Fragen: Wann genau überweise ich? Was ist AfA? Mietvertrag – wo bekomme ich ein rechtssicheres Template?
- Wünscht sich: strukturierte To-Do-Liste, Steuerberater-Empfehlung, Mustervertrag

### Persona D – Kapitalanleger mit Verwaltung: Sabine R., 51, Paderborn, mit Hausverwaltung

- Kauft 4. Wohnung als Kapitalanlage, 270.000 €
- Will sich nur um Steuer und Verträge kümmern, alles andere delegiert
- Fragen: Welche Verwaltung empfiehlst du? Wann macht die Verwaltung was? Wo brauche ich aktiv Daten?
- Wünscht sich: minimaler Berührungspunkt, klare Verantwortungs-Trennung Verwaltung vs. Eigentümer

---

## 16. Reputations- & Empfehlungsmaschine

### Verschärfte Trigger-Bedingungen

**Alle drei Bedingungen müssen erfüllt sein, bevor die Bewertungs-E-Mail rausgeht:**

1. Meilenstein "Eingezogen ✓" liegt **mindestens 7 Tage** zurück (Einzugschaos abklingen lassen)
2. **Mindestens 5 Meilensteine** insgesamt abgehakt (echte Wertschöpfung sichtbar)
3. **KI-Chat mindestens 1× genutzt** (Käufer hat das System wirklich kennengelernt)

Diese Verschärfung reduziert die Bewertungs-Anfrage-Menge, erhöht aber die erwartete Conversion deutlich – Qualität geht vor Quantität.

### Erwartete Conversion

- v1.0-Annahme: 25–40%
- v1.1-Erwartung mit strengeren Bedingungen: **35–50%**
- Compensiert das geringere Volumen vermutlich vollständig

### Verkaufsargument im Makler-Pitch

> "Ein Makler mit 25 Deals/Jahr in Paderborn und 40% Conversion bekommt automatisch 10 neue Google-Bewertungen pro Jahr – ohne einen einzigen Anruf zu machen. Nach 2 Jahren stehst du mit 20 neuen Bewertungen an der Spitze deines lokalen Marktes."

---

*Dieses Dokument konsolidiert Konzept-Entscheidungen vom Mai 2026. Es ist ein lebendes Dokument und wird bei jedem signifikanten Erkenntnisgewinn aktualisiert.*

**Erstellt:** Mai 2026
**Vorherige Version:** v1.0 (Mai 2026)
**Nächstes geplantes Review:** Nach Anwalts-Beratung zur Haftungsstrategie
