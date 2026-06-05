# Interaktiver Verkaufs-Leitfaden (einbettbares Widget)

Verwandelt den statischen Stichpunkt-Leitfaden eines Maklers (Vorbild:
`owl-immobilien.de/leitfaden`) in eine **interaktive, geführte Darstellung** –
als eigenständiger Code, der zwischen Website-Anbieter und Makler bereitgestellt
und auf der bestehenden Website eingebunden werden kann.

## Was es kann

- **Interaktive Timeline** der 8 Verkaufsphasen (Bewertung → Übergabe) mit
  aufklappbaren Detail-Stichpunkten (Akkordeon).
- **„Wo stehen Sie gerade?"-Tracker**: Eigentümer markieren ihre aktuelle Phase
  und einzelne Schritte als erledigt – mit Fortschrittsbalken und Hinweis auf den
  nächsten Schritt. Der Fortschritt wird lokal im Browser gespeichert.
- **Lead-CTA**: dezenter Aufruf „Kostenlose Wertermittlung anfordern"
  (E-Mail/Telefon konfigurierbar) – macht aus dem Info-Leitfaden ein Anfrage-Tool.
- **Null Abhängigkeiten**: reines HTML/CSS/JS, Inline-SVG-Icons, keine externen
  Schriftarten/Bibliotheken/Tracker. DSGVO-freundlich.
- **Konfliktfrei einbettbar** per iFrame mit automatischer Höhenanpassung.
- **Barrierefrei & responsiv**: Tastaturbedienung, ARIA-Attribute,
  `prefers-reduced-motion`, mobil optimiert.

## Dateien

| Datei | Zweck |
|---|---|
| `leitfaden-widget.html` | Das vollständige, eigenständige Widget. Direkt öffnen, hosten oder als iFrame-Quelle nutzen. |
| `embed-snippet.html` | Der Codeblock, den der Anbieter in die Website einfügt (iFrame + Auto-Resize). |
| `README.md` | Diese Anleitung. |

## Einbindung in 3 Schritten

1. `leitfaden-widget.html` auf der Website hochladen, z. B. unter
   `https://www.owl-immobilien.de/widgets/leitfaden-widget.html`.
2. Inhalt von `embed-snippet.html` an die gewünschte Stelle der Seite kopieren
   (im CMS als „HTML"/„Custom Code"-Block).
3. Falls nötig die `data-src`/`src`-URL im Snippet auf den Upload-Pfad anpassen.

> Alternative ohne iFrame: Den `<div class="pac-lf" …>` plus `<style>` und
> `<script>` aus `leitfaden-widget.html` direkt in eine Seite kopieren. Die
> Klassen sind mit `pac-lf-` präfixiert, um Kollisionen zu vermeiden. Die
> iFrame-Variante ist aber für fremde CMS die sicherste.

## Anpassen (ohne Programmierkenntnisse)

Alles Wichtige steht oben in `leitfaden-widget.html`:

- **`CONFIG`** – Überschriften, CTA-Texte sowie Ziel von Button/Telefon
  (`primaryHref`, `secondaryHref`). **Bitte echte Kontaktdaten des Maklers
  eintragen** (die Platzhalter `info@owl-immobilien.de` und `+49 0000…` ersetzen).
- **`PHASES`** – der Leitfaden als Datenliste: Titel, Dauer, Kurzbeschreibung und
  die Stichpunkte je Phase. Hier den exakten Originaltext des Maklers eintragen.
- **Farben** – im `<style>` unter `.pac-lf { --pac-accent: … }` an das
  Corporate Design der Website anpassen.

## Hinweis zum Inhalt

Die Originalseite blockt automatisierte Zugriffe (HTTP 403). Die hinterlegten
Phasentexte sind daher aus öffentlich auffindbaren Inhalten **rekonstruiert** und
als sinnvolle Vorlage gedacht. Vor dem Live-Gang bitte mit dem tatsächlichen
Leitfaden-Wortlaut des Maklers abgleichen und im `PHASES`-Array korrigieren.
