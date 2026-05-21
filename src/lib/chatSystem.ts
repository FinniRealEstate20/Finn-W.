export const CHAT_SYSTEM_PROMPT = `Du bist der digitale Assistent von PropAfterCare – einer Plattform, die Immobilienkäufer von der Notar-Unterschrift bis zum Einzug begleitet. Der Pilotmarkt ist Paderborn.

Deine Aufgabe ist es, Fragen rund um den Immobilienkauf nach dem Notartermin zu beantworten: Behörden, Versorger, Versicherungen, Meldepflichten, Einzug, Übergabe.

Verhaltensregeln:
- Du-Form, warm aber präzise. Keine Floskeln.
- Antworten kurz halten – maximal 4–6 Sätze. Bei komplexen Fragen Struktur mit kurzen Stichpunkten.
- Beziehe dich konkret auf Paderborn, wenn relevant (z.B. Bürgerservice Bahnhofstraße 50, Stadtwerke Paderborn vs. Westfalen Weser, i-Kfz Stufe 4, ASP-Abfallanmeldung).
- KEINE konkrete Rechts- oder Steuerberatung. Bei steuerlichen oder rechtlichen Detailfragen verweise auf einen geprüften Experten aus dem Partnernetzwerk und ergänze "Das ist keine Rechtsberatung."
- Bei Unsicherheit ehrlich sagen: "Da bin ich nicht sicher – frag am besten deinen Makler."
- Erwähne, wo es sinnvoll ist, das passende Formular im Hub (z.B. "Im Formular-Hub findest du den Direktlink zur elektronischen Wohnsitz-Anmeldung").

Zielgruppen-Profile, die der Nutzer haben kann:
- ownUse: zieht selbst ein, klassischer Eigennutzer
- investment-self: Kapitalanleger, vermietet selbst
- investment-managed: Kapitalanleger mit Hausverwaltung

Wenn dir das Profil mitgegeben wird, passe die Antwort an (z.B. Eigennutzer brauchen keine Wasseranmeldung, Kapitalanleger mit Verwaltung muss Versorger nicht selbst beauftragen).`;

interface DemoResponse {
  keywords: string[];
  answer: string;
}

export const DEMO_RESPONSES: readonly DemoResponse[] = [
  {
    keywords: ['kaufpreis', 'überweisen', 'überweisung', 'wann', 'fälligkeit'],
    answer:
      'Den Kaufpreis darfst du **erst nach der Fälligkeitsmitteilung** vom Notar überweisen – nie vorher. Die Fälligkeitsmitteilung kommt typisch 2–4 Wochen nach dem Notartermin, wenn drei Bedingungen erfüllt sind: Auflassungsvormerkung im Grundbuch, alle Vorkaufsrechte geklärt, lastenfreie Übergabe gesichert.\n\nSobald sie da ist, hast du meist 14 Tage Zeit. Achte penibel auf die Kontoverbindung – und wenn deine Bank finanziert, informiere sie sofort, damit der Geldeingang zum Tag X passt.\n\nDas ist keine Rechtsberatung – bei Unsicherheit frag deinen Makler oder den Notar.'
  },
  {
    keywords: ['wohnsitz', 'anmeld', 'bürgerservice', 'einwohner', 'meldeamt', 'paderborn'],
    answer:
      'In Paderborn hast du zwei Wege:\n\n• **Elektronisch (empfohlen)** – mit aktiviertem Online-Ausweis und PIN über mein-digiport.de. Du brauchst keinen Termin, dauert 10–15 Min.\n• **Persönlich** – mit Termin in Bahnhofstraße 50 (oder Schloß Neuhaus / Elsen). Termin online unter termine-reservieren.de/termine/paderborn oder telefonisch 05251 88-11188.\n\nWichtig: Pflicht innerhalb von **14 Tagen nach Einzug**, sonst Bußgeld bis 1.000 €. Im Formular-Hub findest du den Direktlink zur elektronischen Variante.'
  },
  {
    keywords: ['stadtwerke', 'westfalen weser', 'strom', 'gas', 'anbieter', 'versorger'],
    answer:
      'Beides legitime Optionen in Paderborn:\n\n• **Stadtwerke Paderborn** – kommunaler Versorger, aber Vertragsabschluss nur persönlich im Kundenzentrum (Rolandsweg 80). Plane für einen Termin etwa 30 Min ein.\n• **Westfalen Weser Energie** – online buchbar in 5 Min. Auch regional verankert (Sitz Paderborn), oft etwas günstiger.\n\nFür reine Effizienz und Vorab-Erledigung ist Westfalen Weser meist die schnellere Wahl. Im Formular-Hub hast du beide Optionen mit Direktlinks bzw. Termin-Buchung.'
  },
  {
    keywords: ['versicherung', 'wohngebäude', 'hausrat', 'haftpflicht'],
    answer:
      'Drei wichtige Versicherungen rund um den Kauf:\n\n• **Wohngebäudeversicherung** – Pflicht für Eigentümer. Die des Verkäufers geht **automatisch** mit dem Grundbucheintrag auf dich über. Du hast **1 Monat Sonderkündigungsrecht** – nutze die Zeit für einen Vergleich.\n• **Hausratversicherung** – optional, aber sehr zu empfehlen. Neue Adresse melden oder neuen Vertrag.\n• **Privathaftpflicht** – Adressänderung melden, neue Wohnsituation prüfen.\n\nFür Kapitalanlagen zusätzlich: Vermieter-Haftpflicht. Alle Anbieter im Formular-Hub.'
  }
];

export function findDemoAnswer(userMessage: string): string {
  const normalized = userMessage.toLowerCase();
  for (const r of DEMO_RESPONSES) {
    if (r.keywords.some(k => normalized.includes(k))) {
      return r.answer;
    }
  }
  return 'Ich bin gerade im Demo-Modus mit vorbereiteten Antworten zu typischen Fragen rund um Kaufpreis, Wohnsitz-Anmeldung, Versorger und Versicherungen. Probier eine der vorgeschlagenen Fragen aus, oder verbinde einen Anthropic-API-Schlüssel in `.env.local` für volle KI-Antworten.\n\nBei steuerlichen oder rechtlichen Detailfragen ist immer ein geprüfter Experte die richtige Adresse.';
}
