# PropAfterCare – Analysten-Briefing: Workflows & Verbesserungen

> **Zweck dieser Datei:** Wissensbasis für die Projektfunktion „Analyst". Verdichtet das technische Hand-off ([`briefing-handoff.md`](./briefing-handoff.md)) auf das, was ein Analyst braucht, um (a) die Workflows zu verstehen, (b) sie zu bewerten und (c) priorisierte Verbesserungen abzuleiten.
> **Stand:** Branch `claude/propaftercare-mvp-MVJBG`, Commit `60dc90e` · **Datum:** Juni 2026
> **Lesart:** Dieses Dokument ist bewusst meinungsstark. Es benennt Lücken und Hebel – nicht nur den Ist-Zustand.

---

## 1. Produkt in einem Satz

PropAfterCare ist ein White-Label-Tool, das Immobilienmakler ihren Käufern nach dem Kauf schenken: Es führt Käufer durch alle Behörden-, Versorger- und Versicherungs-Formalitäten (Pilot Paderborn) und gibt dem Makler ein Cockpit, das Käufer-Fortschritt, Reputation und ein Mitkuratoren-Programm bündelt.

**Geschäftsmodell-Kern:** Makler zahlt → Käufer erlebt mühelosen Einzug → Makler bekommt Reputation (Reviews) + Folgegeschäft. Das Tool ist der Loyalitäts- und Reputations-Motor des Maklers.

**Reifegrad:** Lauffähiges MVP / Pilot-Demo. Frontend vollständig, Backend bewusst dünn (localStorage + In-Memory). Noch kein Auth, kein Supabase, keine echte Persistenz.

---

## 2. Akteure & ihre Ziele (Analyst-Linse)

| Akteur | Will | Erfolgsmetrik (heute messbar?) |
|---|---|---|
| **Käufer** | Stressfreier Einzug, nichts vergessen | Profil-Vervollständigkeit, Milestones done, eingereichte Formulare – **lokal, nicht aggregierbar** |
| **Makler** | Reputation + Kundenbindung, geringer Aufwand | Reviews, Conversion, Curator-Punkte – **Mock-Zahlen, nicht real erhoben** |
| **Betreiber (Finn)** | Skalierbarer Formular-Katalog je Region | Form-Aktualität, Mitkurations-Durchsatz – **kein Persist-Pfad** |

> **Analyst-Kernbefund:** Das Produkt erzählt eine vollständige Story, aber **keine der Erfolgsmetriken wird heute serverseitig erhoben**. Alles ist Demo-/Mock-Daten im Browser. Das ist die größte Lücke zwischen Pitch und Realität.

---

## 3. Die 7 Workflows – mit Bewertung & Friktionspunkten

Jeder Workflow ist hier nicht nur beschrieben, sondern bewertet: **Reife** (✅ live / 🟡 teilweise / 🔴 nur Konzept) und der wichtigste **Verbesserungshebel**.

### W1 – Käufer-Onboarding ✅
`/de/welcome` → `/de/onboarding` → `profileStore` → `/de/dashboard`
- **Reife:** Funktioniert end-to-end (lokal).
- **Friktion:** Keine echte Identität → kein Wiederfinden auf anderem Gerät. „2-Minuten-Setup" verlangt sensible Daten (IBAN, Steuer-ID) ohne erkennbaren Trust-Anker.
- **Hebel:** Magic-Link-Auth + Vertrauenselemente (Makler-Branding, Datenschutz-Hinweis) **vor** der IBAN-Abfrage.

### W2 – Meilenstein abhaken (Live-Sync) 🟡
Dashboard-Klick → `milestoneStore` + `BroadcastChannel` → Cockpit aktualisiert sofort.
- **Reife:** Beeindruckend in der Demo, aber `BroadcastChannel` synchronisiert **nur Tabs im selben Browser**.
- **Friktion:** Makler und Käufer sitzen real an verschiedenen Geräten → der „Live-Sync" funktioniert in echt nicht.
- **Hebel:** Echte Server-Persistenz + Realtime (Supabase Realtime / SSE) als Voraussetzung für jede echte Maklernutzung.

### W3 – Formular ausfüllen & einreichen 🟡
`/de/documents` → Detail je `sourceType` (inhouse PDF / external Deep-Link / communal PDF) → `/api/submissions` + `submissionStore` → `/de/my-forms`.
- **Reife:** Kern-Wertversprechen, gut umgesetzt; 3 Quelltypen sauber differenziert.
- **Friktion:** PDFs sind **Demo-Quittungen mit Wasserzeichen**, kein Field-Mapping in echte Behörden-PDFs. Server-Receipts überleben keinen Restart.
- **Hebel:** Echtes PDF-Field-Mapping für die wichtigsten kommunalen Formulare = der Schritt von „Demo" zu „spart wirklich Zeit".

### W4 – KI-Chat ✅ (mit Key) / 🟡 (Demo)
`/de/chat` → `/api/chat` → Claude `claude-sonnet-4-6` oder 4 Demo-Antworten.
- **Reife:** Funktioniert mit `ANTHROPIC_API_KEY`; sauberer Fallback.
- **Friktion:** Nur 4 Demo-Themen ohne Key. Guardrails (RDG/StBerG) vorhanden, aber Antwortqualität ungetestet/ungemessen.
- **Hebel:** Konversations-Logging (anonymisiert) → echte häufige Fragen → daraus neue Formulare/Milestones ableiten (Feedback-Loop Produkt ↔ Inhalt).

### W5 – Makler-Cockpit 🟡
`/de/broker` (Käuferliste) · `/reputation` (Stats) · `/curators` (Punkte).
- **Reife:** UI vollständig, Zahlen sind **hartkodierter Mock** (18 Reviews, Ø 4.9, 64 % Conversion).
- **Friktion:** Keine echten Daten → Cockpit ist heute eine Attrappe für die Demo.
- **Hebel:** Sobald W2/W3 serverseitig persistieren, wird das Cockpit automatisch echt. Reihenfolge: erst Persistenz, dann Cockpit-Verkabelung.

### W6 – Mitkurations-Loop 🔴
Makler meldet veraltetes Formular → `under_review` → Backoffice-Prüfung → Punkt-Vergabe.
- **Reife:** Nur UI-Hooks, **kein Persist-Pfad, kein Endpoint**.
- **Hebel:** Dies ist das Skalierungs-Geheimnis (Katalog über Crowd aktuell halten). Sobald >1 Region: höchste strategische Priorität. Heute: niedrig (kein Volumen).

### W7 – Reputations-Trigger 🔴
Bedingung (alle 3): eingezogen ≥ 7 Tage · ≥ 5 Milestones done · `aiChatUsed=true` → Review-Request.
- **Reife:** Reines Konzept, kein Cron/Job, kein Mailer.
- **Hebel:** Das ist der **monetäre Kern** für den Makler (Reviews = ROI). Ohne Mailer + Trigger-Job liefert das Produkt sein Hauptversprechen nicht ein.

---

## 4. Verbesserungs-Backlog (priorisiert)

Priorisierung nach **Wert × Reife-Lücke**, nicht nach Aufwand. Drei Wellen.

### Welle 1 – „Demo → echtes Pilotprodukt" (Fundament)
| # | Verbesserung | Warum kritisch | Bezug |
|---|---|---|---|
| 1 | **Supabase-Schema + Auth (Magic Link)** | Ohne echte Identität & Persistenz ist kein Live-Pilot mit echten Käufern möglich | §9, W1 |
| 2 | **Buyer/Broker/Submissions in DB statt localStorage/In-Memory** | Daten überleben Gerät & Restart; Voraussetzung für echtes Cockpit | W2, W3, W5 |
| 3 | **Realtime statt BroadcastChannel** | Live-Sync muss geräteübergreifend funktionieren | W2 |
| 4 | **E-Mail-Versand (Welcome / Reminder / Review-Request)** | Liefert das Reputations-Versprechen ein | W7, §9 |

### Welle 2 – „Echter Zeitspar-Nutzen & Reputation"
| # | Verbesserung | Warum wertvoll |
|---|---|---|
| 5 | **Field-Mapping in echte kommunale PDFs** | Macht aus Demo-Quittung echte Arbeitsersparnis (Kern-USP) |
| 6 | **Reputations-Trigger-Job (Cron/Edge)** | Automatisiert Review-Anfragen = Makler-ROI |
| 7 | **Cockpit an echte Daten verkabeln** | Mock-Zahlen → reale KPIs |
| 8 | **Anonymisiertes Chat- & Event-Logging** | Erste echte Produkt-Analytics; Basis für Datenentscheidungen |

### Welle 3 – „Skalierung über Paderborn hinaus"
| # | Verbesserung | Warum strategisch |
|---|---|---|
| 9 | **Mitkurations-Workflow verdrahten** | Hält Katalog je Region per Crowd aktuell (Skalierungs-Hebel W6) |
| 10 | **Mehrsprachigkeit befüllen (TR/AR/RU)** | Layer steht, nur `de.json` gefüllt – großer Markt im Zuzug |
| 11 | **Mehr-Regionen-Modell (Form-Katalog je Stadt)** | Aus „Paderborn-MVP" wird Produkt |
| 12 | **CRM-Webhook (Zapier-first)** | Anbindung an Makler-Bestandssysteme |

---

## 5. Risiken & offene Fragen für den Analysten

- **Datenschutz/DSGVO:** IBAN & Steuer-ID werden erhoben. Externe Assets (Unsplash, Nominatim, OpenPLZ) → für Produktion EU-Hosting + AVV nötig. **Vor echtem Pilot klären.**
- **Rechtsrahmen:** Chat hat RDG/StBerG-Guardrails – aber wer haftet bei falscher Formular-Auskunft? Juristische Prüfung offen.
- **Metrik-Lücke:** Alle Pitch-Zahlen (Reviews, Conversion) sind Mock. Vor Investoren-/Partner-Gesprächen klarstellen, was real vs. illustrativ ist.
- **Lock-in-Frage:** Was passiert mit Käuferdaten, wenn der Makler kündigt? Datenportabilität ungeklärt.

---

## 6. Wie der Analyst dieses Projekt befragen sollte

Nützliche Einstiegsfragen, die diese Wissensbasis beantworten kann:
1. *„Welche Workflows funktionieren heute wirklich vs. nur in der Demo?"* → §3 (Reife-Ampel)
2. *„Was muss vor einem echten Pilot mit Käufern passieren?"* → §4 Welle 1
3. *„Welche Funktion liefert dem Makler den größten ROI?"* → W7 + Backlog #6
4. *„Wo ist die größte Lücke zwischen Pitch und Realität?"* → §2 Kernbefund + §5 Metrik-Lücke
5. *„Was ist der Skalierungs-Hebel über Paderborn hinaus?"* → W6 + Backlog #9–11

---

## 7. Referenzen

- **Technisches Hand-off:** [`docs/briefing-handoff.md`](./briefing-handoff.md) – vollständige Architektur, Routen, Stores, Konventionen
- **Konzept:** [`docs/briefing-v1.1.md`](./briefing-v1.1.md) – 14 Konzept-Entscheidungen, Personas, Risiken
- **Pilot-Markt:** Paderborn, Sommer 2026 · 3–5 Pilotmakler
- **Kontakt:** finn.luca.wenzel@gmx.de

---

*Diese Datei verdichtet den Code-Stand zum Branch-HEAD `60dc90e` für analytische Zwecke. Bei strukturellen Änderungen (neue Workflows, Backend-Anbindung) bitte hier und im Hand-off nachziehen.*
