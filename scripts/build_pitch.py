"""Generiert das PropAfterCare Pitch-Deck (.pptx)."""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree
from pathlib import Path

# ─── Brand colors ────────────────────────────────────────────────────────
BRAND_BLUE = RGBColor(0x3B, 0x82, 0xF6)
BRAND_BLUE_LIGHT = RGBColor(0x5B, 0x9C, 0xF6)
BRAND_BLUE_BG = RGBColor(0xE0, 0xEF, 0xFE)
INK = RGBColor(0x18, 0x19, 0x1C)
INK_SOFT = RGBColor(0x33, 0x41, 0x55)
INK_MUTED = RGBColor(0x6B, 0x72, 0x80)
BORDER = RGBColor(0xE2, 0xE4, 0xE9)
BG_LIGHT = RGBColor(0xF8, 0xFA, 0xFC)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
EMERALD = RGBColor(0x10, 0xB9, 0x81)
AMBER = RGBColor(0xF5, 0x9E, 0x0B)
RED = RGBColor(0xEF, 0x44, 0x44)

# ─── Slide dimensions (16:9) ────────────────────────────────────────────
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

# ─── Helpers ─────────────────────────────────────────────────────────────


def add_rect(slide, x, y, w, h, fill=None, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shape.shadow.inherit = False
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(0.75)
    return shape


def add_rounded(slide, x, y, w, h, fill=None, line=None, radius=0.06):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    shape.shadow.inherit = False
    shape.adjustments[0] = radius
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(0.75)
    return shape


def add_text(
    slide, x, y, w, h, text, size=18, bold=False, color=INK, align="left", anchor="top"
):
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)
    tf.vertical_anchor = {
        "top": MSO_ANCHOR.TOP,
        "middle": MSO_ANCHOR.MIDDLE,
        "bottom": MSO_ANCHOR.BOTTOM,
    }[anchor]
    p = tf.paragraphs[0]
    p.alignment = {
        "left": PP_ALIGN.LEFT,
        "center": PP_ALIGN.CENTER,
        "right": PP_ALIGN.RIGHT,
    }[align]
    run = p.add_run()
    run.text = text
    run.font.name = "Inter"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return box


def add_multi_text(slide, x, y, w, h, runs, align="left", anchor="top", line_spacing=1.15):
    """runs = list of dicts: {text, size, bold, color}"""
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)
    tf.vertical_anchor = {
        "top": MSO_ANCHOR.TOP,
        "middle": MSO_ANCHOR.MIDDLE,
        "bottom": MSO_ANCHOR.BOTTOM,
    }[anchor]
    for i, r in enumerate(runs):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.alignment = {
            "left": PP_ALIGN.LEFT,
            "center": PP_ALIGN.CENTER,
            "right": PP_ALIGN.RIGHT,
        }[align]
        p.line_spacing = line_spacing
        if r.get("space_before") is not None:
            p.space_before = Pt(r["space_before"])
        run = p.add_run()
        run.text = r["text"]
        run.font.name = "Inter"
        run.font.size = Pt(r.get("size", 16))
        run.font.bold = r.get("bold", False)
        run.font.color.rgb = r.get("color", INK)
    return box


def add_logo_mark(slide, x, y, size=Inches(0.7)):
    """PropAfterCare icon: rounded blue square + white check inside dark circle."""
    # Rounded square background
    bg = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, size, size)
    bg.shadow.inherit = False
    bg.adjustments[0] = 0.22
    bg.fill.solid()
    bg.fill.fore_color.rgb = BRAND_BLUE
    bg.line.fill.background()

    # Pentagon "house" (using regular pentagon, points up)
    house_w = int(size * 0.5)
    house_h = int(size * 0.5)
    house_x = x + (size - house_w) // 2
    house_y = y + int(size * 0.15)
    house = slide.shapes.add_shape(MSO_SHAPE.PENTAGON, house_x, house_y, house_w, house_h)
    house.shadow.inherit = False
    house.fill.background()
    house.line.color.rgb = WHITE
    house.line.width = Pt(1.5)

    # Checkmark badge (dark circle with check, bottom-right)
    badge_size = int(size * 0.4)
    badge_x = x + size - badge_size + int(size * 0.05)
    badge_y = y + size - badge_size + int(size * 0.05)
    badge = slide.shapes.add_shape(MSO_SHAPE.OVAL, badge_x, badge_y, badge_size, badge_size)
    badge.shadow.inherit = False
    badge.fill.solid()
    badge.fill.fore_color.rgb = INK
    badge.line.color.rgb = WHITE
    badge.line.width = Pt(0.75)
    # check character
    check = slide.shapes.add_textbox(badge_x, badge_y, badge_size, badge_size)
    tf = check.text_frame
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "✓"
    r.font.name = "Inter"
    r.font.size = Pt(int(size.pt * 0.28))
    r.font.bold = True
    r.font.color.rgb = WHITE


def add_logo_full(slide, x, y, height=Inches(0.55)):
    """Logo mark + wordmark next to each other."""
    mark_size = height
    add_logo_mark(slide, x, y, size=mark_size)

    wm_x = x + mark_size + Inches(0.18)
    wm_w = Inches(3.2)
    box = slide.shapes.add_textbox(wm_x, y, wm_w, height)
    tf = box.text_frame
    tf.word_wrap = False
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    for txt, color in [("Prop", INK), ("After", BRAND_BLUE_LIGHT), ("Care", INK)]:
        run = p.add_run()
        run.text = txt
        run.font.name = "Inter"
        run.font.size = Pt(int(height.pt * 0.55))
        run.font.bold = True
        run.font.color.rgb = color


def add_footer(slide, page_num, total):
    """Subtle footer with logo + page indicator."""
    add_logo_mark(slide, Inches(0.5), Inches(6.85), size=Inches(0.35))
    add_text(
        slide,
        Inches(0.95),
        Inches(6.88),
        Inches(4),
        Inches(0.3),
        "PropAfterCare · Pitch 2026",
        size=9,
        color=INK_MUTED,
    )
    add_text(
        slide,
        Inches(12),
        Inches(6.88),
        Inches(0.83),
        Inches(0.3),
        f"{page_num} / {total}",
        size=9,
        color=INK_MUTED,
        align="right",
    )


def add_section_label(slide, text):
    add_text(
        slide,
        Inches(0.6),
        Inches(0.55),
        Inches(6),
        Inches(0.35),
        text.upper(),
        size=10,
        bold=True,
        color=BRAND_BLUE,
    )


def add_h1(slide, text, y=Inches(0.95)):
    add_text(slide, Inches(0.6), y, Inches(12), Inches(1.1), text, size=34, bold=True, color=INK)


def add_h2(slide, text, y=Inches(1.6)):
    add_text(slide, Inches(0.6), y, Inches(12), Inches(0.5), text, size=18, color=INK_SOFT)


# ─── Slide builders ─────────────────────────────────────────────────────


def slide_title(s):
    # Background gradient strip
    add_rect(s, 0, 0, SLIDE_W, Inches(1.2), fill=BRAND_BLUE)
    add_rect(s, 0, Inches(1.2), SLIDE_W, Inches(0.08), fill=BRAND_BLUE_LIGHT)

    # Logo + Wordmark
    add_logo_full(s, Inches(0.7), Inches(0.35), height=Inches(0.55))

    # Subtle eyebrow chip
    add_rounded(
        s, Inches(0.7), Inches(2.4), Inches(3.4), Inches(0.4), fill=BRAND_BLUE_BG, radius=0.5
    )
    add_text(
        s,
        Inches(0.7),
        Inches(2.4),
        Inches(3.4),
        Inches(0.4),
        "Pilotmarkt Paderborn · 2026",
        size=11,
        bold=True,
        color=BRAND_BLUE,
        align="center",
        anchor="middle",
    )

    # Title
    add_text(
        s,
        Inches(0.7),
        Inches(3.0),
        Inches(12),
        Inches(1.5),
        "Aus jedem Notartermin werden",
        size=44,
        bold=True,
        color=INK,
    )
    add_text(
        s,
        Inches(0.7),
        Inches(3.85),
        Inches(12),
        Inches(1.5),
        "vier Google-Bewertungen.",
        size=44,
        bold=True,
        color=BRAND_BLUE,
    )

    # Subtitle
    add_text(
        s,
        Inches(0.7),
        Inches(5.1),
        Inches(11),
        Inches(0.9),
        "Post-Closing Betreuung für Immobilienmakler – als automatische\nReputations- und Empfehlungsmaschine.",
        size=18,
        color=INK_SOFT,
    )

    # Author line
    add_text(
        s,
        Inches(0.7),
        Inches(6.6),
        Inches(8),
        Inches(0.3),
        "Finn Wenzel · finn.luca.wenzel@gmx.de",
        size=11,
        color=INK_MUTED,
    )


def slide_problem(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Problem")
    add_h1(s, "Der Notartisch ist nicht das Ende.")
    add_text(
        s,
        Inches(0.6),
        Inches(1.55),
        Inches(12),
        Inches(0.6),
        "Es ist der Anfang des Chaos – und der Moment, in dem du als Makler aus dem Leben deines Kunden verschwindest.",
        size=18,
        color=INK_SOFT,
    )

    # Two columns
    col_w = Inches(5.9)
    col_h = Inches(3.8)
    col_y = Inches(2.6)

    # Left column: Käufer
    add_rounded(s, Inches(0.6), col_y, col_w, col_h, fill=BG_LIGHT, line=BORDER, radius=0.04)
    add_text(
        s,
        Inches(0.95),
        col_y + Inches(0.35),
        col_w,
        Inches(0.4),
        "FÜR DEN KÄUFER",
        size=10,
        bold=True,
        color=INK_MUTED,
    )
    add_text(
        s,
        Inches(0.95),
        col_y + Inches(0.75),
        col_w,
        Inches(0.55),
        "Die stressigste Phase beginnt jetzt.",
        size=20,
        bold=True,
        color=INK,
    )
    bullets_left = [
        "Auflassungsvormerkung & Fälligkeitsmitteilung verstehen",
        "Kaufpreis korrekt überweisen – Frist nicht verpassen",
        "Grunderwerbsteuer, Versicherungs-Übergang",
        "Versorger, Ummeldung, Handwerker koordinieren",
        "Behörden-Bürokratie ohne klaren Leitfaden",
    ]
    runs = [
        {"text": "• " + b, "size": 13, "color": INK_SOFT, "space_before": 6 if i > 0 else 0}
        for i, b in enumerate(bullets_left)
    ]
    add_multi_text(s, Inches(0.95), col_y + Inches(1.5), col_w - Inches(0.6), Inches(2.5), runs)

    # Right column: Makler
    add_rounded(
        s, Inches(6.85), col_y, col_w, col_h, fill=BRAND_BLUE_BG, line=BRAND_BLUE, radius=0.04
    )
    add_text(
        s,
        Inches(7.2),
        col_y + Inches(0.35),
        col_w,
        Inches(0.4),
        "FÜR DEN MAKLER",
        size=10,
        bold=True,
        color=BRAND_BLUE,
    )
    add_text(
        s,
        Inches(7.2),
        col_y + Inches(0.75),
        col_w,
        Inches(0.55),
        "Du verschwindest – und verlierst.",
        size=20,
        bold=True,
        color=INK,
    )
    bullets_right = [
        "Keine systematischen Google-Bewertungen",
        "Keine warmen Empfehlungen aus Bestandskunden",
        "Folgegeschäft (nächster Kauf, Verkauf, Erbe) geht verloren",
        "Käufer-Anrufe mit Fragen, die du nicht beantworten kannst",
        "Reputation entsteht zufällig statt strukturiert",
    ]
    runs = [
        {"text": "• " + b, "size": 13, "color": INK_SOFT, "space_before": 6 if i > 0 else 0}
        for i, b in enumerate(bullets_right)
    ]
    add_multi_text(s, Inches(7.2), col_y + Inches(1.5), col_w - Inches(0.6), Inches(2.5), runs)

    # Bottom stat
    add_text(
        s,
        Inches(0.6),
        Inches(6.55),
        Inches(12),
        Inches(0.35),
        "Branchenrealität: nur 5–8 % zufriedener Käufer hinterlassen eine Bewertung – wenn niemand sie strukturiert anstößt.",
        size=11,
        color=INK_MUTED,
        align="center",
    )


def slide_reframe(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Die strategische Neurahmung")
    add_h1(s, "Es ist keine Service-App.")
    add_text(
        s,
        Inches(0.6),
        Inches(1.75),
        Inches(12),
        Inches(1.1),
        "Es ist eine Reputations-Maschine.",
        size=44,
        bold=True,
        color=BRAND_BLUE,
    )

    # Big quote-style box
    box_y = Inches(3.6)
    add_rounded(
        s, Inches(1.5), box_y, Inches(10.3), Inches(2.4), fill=BG_LIGHT, line=BORDER, radius=0.05
    )
    add_text(
        s,
        Inches(2),
        box_y + Inches(0.35),
        Inches(9.3),
        Inches(0.5),
        "„",
        size=60,
        color=BRAND_BLUE_LIGHT,
        bold=True,
    )
    add_text(
        s,
        Inches(2.6),
        box_y + Inches(0.65),
        Inches(8.4),
        Inches(1.5),
        "Der Käufer erlebt Fürsorge.\nDer Makler erntet Bewertungen und Folgegeschäft.\nDas ist das eigentliche Verkaufsargument.",
        size=20,
        color=INK,
    )


def slide_market(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Marktchance")
    add_h1(s, "Ein riesiger, fragmentierter, unterversorgter Markt.")
    add_h2(s, "Adressierbare Zielgruppe in Deutschland – mit klarem Pilot-Beachhead in Paderborn.")

    # 3 stat cards
    card_y = Inches(2.7)
    card_w = Inches(3.95)
    card_h = Inches(2.5)
    cards = [
        ("~25.000", "aktive Immobilienmakler in DE", "BITKom 2024 / IVD-Branchenreport"),
        ("~10.000", "digital-affine Einzel-\n& kleine Büros (Zielgruppe)", "Geschätzt 40 % des Gesamtmarkts"),
        ("~600", "Makler allein im\nPilot-Korridor OWL", "Paderborn, Bielefeld, Detmold"),
    ]
    for i, (big, label, hint) in enumerate(cards):
        x = Inches(0.6 + i * 4.2)
        add_rounded(s, x, card_y, card_w, card_h, fill=WHITE, line=BORDER, radius=0.04)
        add_text(
            s,
            x + Inches(0.4),
            card_y + Inches(0.4),
            card_w,
            Inches(0.9),
            big,
            size=44,
            bold=True,
            color=BRAND_BLUE,
        )
        add_text(
            s,
            x + Inches(0.4),
            card_y + Inches(1.3),
            card_w - Inches(0.5),
            Inches(0.7),
            label,
            size=14,
            color=INK,
            bold=True,
        )
        add_text(
            s,
            x + Inches(0.4),
            card_y + Inches(2),
            card_w - Inches(0.5),
            Inches(0.4),
            hint,
            size=10,
            color=INK_MUTED,
        )

    # Bottom line
    add_text(
        s,
        Inches(0.6),
        Inches(5.6),
        Inches(12),
        Inches(0.6),
        "Bei nur 50 zahlenden Maklern und 100 €/Monat sind wir bei 60.000 € ARR – allein im Paderborn-Pilot finanzierungsfähig.",
        size=14,
        color=INK_SOFT,
    )


def slide_solution(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Lösung")
    add_h1(s, "Vier Kernfunktionen. Eine Mission.")
    add_h2(s, "Vom Notartermin bis zur Google-Bewertung – vollautomatisch.")

    features = [
        ("📋", "Meilenstein-Tracker", "12 Aufgaben in 4 Phasen – von Auflassungs-vormerkung bis Nebenkostenabrechnung. Klar erklärt, mit kritischen Fristen."),
        ("🏛️", "Formular-Hub Paderborn", "17 lokal kuratierte Formulare. Vorausgefüllt, mit Direktlinks zu Behörden und Versorgern. Quelle und Stand transparent."),
        ("🤖", "KI-Assistent mit Guardrails", "Antwortet auf Käuferfragen in deren Sprache. Keine konkrete Rechts-/Steuerberatung – Eskalation an geprüfte Experten."),
        ("⭐", "Reputations-Cockpit", "Bewertungs-Trigger 7 Tage nach Einzug. Live-Metriken im Makler-Cockpit. 35–45 % erwartete Bewertungs-Conversion."),
    ]
    grid_y = Inches(2.5)
    cell_w = Inches(5.9)
    cell_h = Inches(1.9)
    for i, (icon, title, body) in enumerate(features):
        row = i // 2
        col = i % 2
        x = Inches(0.6 + col * 6.2)
        y = grid_y + Inches(row * 2.05)
        add_rounded(s, x, y, cell_w, cell_h, fill=WHITE, line=BORDER, radius=0.04)
        add_text(s, x + Inches(0.35), y + Inches(0.3), Inches(0.6), Inches(0.6), icon, size=22)
        add_text(
            s,
            x + Inches(1.05),
            y + Inches(0.3),
            cell_w - Inches(1.4),
            Inches(0.5),
            title,
            size=16,
            bold=True,
            color=INK,
        )
        add_text(
            s,
            x + Inches(1.05),
            y + Inches(0.8),
            cell_w - Inches(1.4),
            Inches(1.1),
            body,
            size=11,
            color=INK_SOFT,
        )


def slide_workflow(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Workflow")
    add_h1(s, "Tag 0 bis Tag 365.")
    add_h2(s, "Eine durchgehende Strecke – das System tut den Großteil.")

    # Timeline phases
    phases = [
        ("Tag 0", "Notar", "CRM-Trigger\nWelcome-Mail\nOnboarding 2 Min"),
        ("Wochen 1–4", "Phase 1", "Auflassung\nFälligkeit\nKaufpreis\nGrunderwerb"),
        ("Wochen 4–12", "Phase 2", "Versicherung\nHandwerker\nMietvertrag"),
        ("Wochen 12+", "Phase 3", "Übergabe\nUmmeldung\nVersorger"),
        ("Tag 87", "Trigger", "+ 7 Tage Wartezeit\n+ ≥ 5 Milestones\n+ KI-Chat genutzt\n→ Bewertungs-Mail"),
    ]
    tl_y = Inches(2.8)
    total_w = Inches(12.1)
    step_w = total_w / len(phases)

    # Connecting line
    add_rect(s, Inches(0.6), tl_y + Inches(0.6), total_w, Inches(0.04), fill=BRAND_BLUE_LIGHT)

    for i, (when, name, body) in enumerate(phases):
        x = Inches(0.6) + step_w * i
        # Node circle
        node_size = Inches(0.4)
        node_x = x + (step_w - node_size) // 2
        is_last = i == len(phases) - 1
        node_fill = EMERALD if is_last else BRAND_BLUE
        node = s.shapes.add_shape(MSO_SHAPE.OVAL, node_x, tl_y + Inches(0.4), node_size, node_size)
        node.shadow.inherit = False
        node.fill.solid()
        node.fill.fore_color.rgb = node_fill
        node.line.color.rgb = WHITE
        node.line.width = Pt(2)

        # When (above)
        add_text(
            s,
            x,
            tl_y,
            step_w,
            Inches(0.35),
            when,
            size=9,
            bold=True,
            color=INK_MUTED,
            align="center",
        )
        # Name
        add_text(
            s,
            x,
            tl_y + Inches(1),
            step_w,
            Inches(0.4),
            name,
            size=13,
            bold=True,
            color=INK,
            align="center",
        )
        # Body
        add_text(
            s,
            x + Inches(0.05),
            tl_y + Inches(1.45),
            step_w - Inches(0.1),
            Inches(2.5),
            body,
            size=10,
            color=INK_SOFT,
            align="center",
        )


def slide_reputation_trigger(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Die geheime Sauce")
    add_h1(s, "Der Reputations-Trigger.")
    add_h2(s, "Timing ist alles. Drei Bedingungen müssen erfüllt sein, bevor wir fragen.")

    # 3 conditions
    cond_y = Inches(2.7)
    cond_w = Inches(3.95)
    cond_h = Inches(2.3)
    conditions = [
        ("7", "Tage nach Einzug", "Einzugschaos abklingen lassen – kein 'kalte Frage'-Effekt."),
        ("5", "Meilensteine erledigt", "Käufer hat die Hilfe wirklich erlebt, nicht nur den Login gesehen."),
        ("1×", "KI-Chat genutzt", "System wurde aktiv eingesetzt – Beziehung ist real."),
    ]
    for i, (big, label, hint) in enumerate(conditions):
        x = Inches(0.6 + i * 4.2)
        add_rounded(s, x, cond_y, cond_w, cond_h, fill=BRAND_BLUE_BG, line=None, radius=0.04)
        add_text(
            s,
            x,
            cond_y + Inches(0.35),
            cond_w,
            Inches(0.9),
            big,
            size=56,
            bold=True,
            color=BRAND_BLUE,
            align="center",
        )
        add_text(
            s,
            x,
            cond_y + Inches(1.35),
            cond_w,
            Inches(0.4),
            label,
            size=13,
            bold=True,
            color=INK,
            align="center",
        )
        add_text(
            s,
            x + Inches(0.3),
            cond_y + Inches(1.75),
            cond_w - Inches(0.6),
            Inches(0.5),
            hint,
            size=10,
            color=INK_SOFT,
            align="center",
        )

    # Bottom: math
    math_y = Inches(5.6)
    add_rounded(s, Inches(0.6), math_y, Inches(12.1), Inches(0.9), fill=INK, radius=0.05)
    add_text(
        s,
        Inches(1),
        math_y + Inches(0.15),
        Inches(11),
        Inches(0.6),
        "Beispielrechnung: 25 Deals/Jahr × 40 % Conversion =  10 neue Google-Bewertungen jährlich – ohne einen einzigen Anruf.",
        size=15,
        color=WHITE,
        bold=True,
        anchor="middle",
    )


def slide_competition(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Wettbewerb")
    add_h1(s, "Niemand bedient den Post-Closing Gap.")
    add_h2(s, "CRMs hören am Notartisch auf. Wir fangen dort an.")

    # Comparison table
    headers = ["Anbieter", "CRM bis Notar", "Post-Closing", "Lokal kuratiert", "Reputations-Mechanik"]
    rows = [
        ("Propstack / OnOffice", "✓", "–", "–", "–"),
        ("Immowelt / ImmoScout", "–", "–", "–", "–"),
        ("PriceHubble", "–", "–", "–", "–"),
        ("Generic Checklisten-Apps", "–", "teils", "–", "–"),
        ("PropAfterCare", "–", "✓", "✓", "✓"),
    ]
    tbl_y = Inches(2.7)
    tbl_x = Inches(0.6)
    col_widths = [Inches(3.2), Inches(2.2), Inches(2.2), Inches(2.2), Inches(2.3)]
    row_h = Inches(0.5)

    # Header row
    x_cursor = tbl_x
    for i, h in enumerate(headers):
        add_rect(s, x_cursor, tbl_y, col_widths[i], row_h, fill=INK)
        add_text(
            s,
            x_cursor + Inches(0.2),
            tbl_y,
            col_widths[i],
            row_h,
            h,
            size=11,
            bold=True,
            color=WHITE,
            anchor="middle",
        )
        x_cursor += col_widths[i]

    # Data rows
    for r_idx, row in enumerate(rows):
        y = tbl_y + row_h * (r_idx + 1)
        x_cursor = tbl_x
        is_us = row[0] == "PropAfterCare"
        bg = BRAND_BLUE_BG if is_us else (WHITE if r_idx % 2 == 0 else BG_LIGHT)
        for i, val in enumerate(row):
            add_rect(s, x_cursor, y, col_widths[i], row_h, fill=bg, line=BORDER)
            txt_color = INK if not is_us else BRAND_BLUE
            txt_bold = is_us
            if val == "✓":
                txt_color = EMERALD
                txt_bold = True
            elif val == "–":
                txt_color = INK_MUTED
            add_text(
                s,
                x_cursor + Inches(0.2),
                y,
                col_widths[i],
                row_h,
                val,
                size=11,
                bold=txt_bold,
                color=txt_color,
                anchor="middle",
            )
            x_cursor += col_widths[i]


def slide_business_model(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Geschäftsmodell")
    add_h1(s, "Drei Einnahme-Säulen.")
    add_h2(s, "SaaS-Abo zahlt die Lichter. Provisionen liefern die Skalierung.")

    pillars = [
        ("SaaS-Abo", "49 – 299 €/Monat", "Starter / Pro / Agency-Tier. 20 % Rabatt bei Jahreszahlung. Wiederkehrende, planbare Umsätze.", BRAND_BLUE),
        ("Dienstleister-Provisionen", "5 – 15 %", "Steuerberater, Handwerker, Hausverwaltungen. Provision auf vermittelte Aufträge. Skaliert mit dem Käufer-Volumen.", EMERALD),
        ("Premium-Inhalte (Phase 2)", "Einmalig 29 – 49 €", "Steuer-Guides für Kapitalanleger. Renovierungs-Planung mit lokalen Preisindizes.", AMBER),
    ]
    p_y = Inches(2.7)
    p_w = Inches(3.95)
    p_h = Inches(3)
    for i, (name, price, body, accent) in enumerate(pillars):
        x = Inches(0.6 + i * 4.2)
        add_rounded(s, x, p_y, p_w, p_h, fill=WHITE, line=BORDER, radius=0.04)
        # Color stripe
        add_rect(s, x, p_y, p_w, Inches(0.12), fill=accent)
        add_text(s, x + Inches(0.4), p_y + Inches(0.45), p_w, Inches(0.4), name, size=12, bold=True, color=INK_MUTED)
        add_text(s, x + Inches(0.4), p_y + Inches(0.9), p_w, Inches(0.7), price, size=24, bold=True, color=accent)
        add_text(s, x + Inches(0.4), p_y + Inches(1.7), p_w - Inches(0.7), Inches(1.2), body, size=12, color=INK_SOFT)


def slide_pricing(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Pricing")
    add_h1(s, "Faires Preismodell – fair für Pilot-Makler.")
    add_h2(s, "Erste 6 Monate kostenlos für die Pilotpartner in Paderborn.")

    tiers = [
        ("Starter", "49 €", "/ Monat", "bis 12 Deals / Jahr", "Einzelmakler", False),
        ("Pro", "129 €", "/ Monat", "bis 40 Deals / Jahr", "Kleines Büro", True),
        ("Agency", "299 €", "/ Monat", "unbegrenzt", "5–15 Mitarbeiter", False),
    ]
    t_y = Inches(2.8)
    t_w = Inches(3.95)
    t_h = Inches(3.2)
    for i, (name, price, period, deals, audience, popular) in enumerate(tiers):
        x = Inches(0.6 + i * 4.2)
        line_color = BRAND_BLUE if popular else BORDER
        fill = BRAND_BLUE_BG if popular else WHITE
        add_rounded(s, x, t_y, t_w, t_h, fill=fill, line=line_color, radius=0.04)
        if popular:
            badge_w = Inches(1.2)
            badge_x = x + (t_w - badge_w) // 2
            add_rounded(s, badge_x, t_y - Inches(0.18), badge_w, Inches(0.36), fill=BRAND_BLUE, radius=0.5)
            add_text(
                s,
                badge_x,
                t_y - Inches(0.18),
                badge_w,
                Inches(0.36),
                "BELIEBT",
                size=9,
                bold=True,
                color=WHITE,
                align="center",
                anchor="middle",
            )

        add_text(s, x, t_y + Inches(0.45), t_w, Inches(0.5), name, size=18, bold=True, color=INK, align="center")
        # Price + period
        add_text(s, x, t_y + Inches(1.05), t_w, Inches(0.7), price, size=42, bold=True, color=BRAND_BLUE, align="center")
        add_text(s, x, t_y + Inches(1.85), t_w, Inches(0.3), period, size=12, color=INK_MUTED, align="center")
        # divider
        add_rect(s, x + Inches(0.6), t_y + Inches(2.25), t_w - Inches(1.2), Inches(0.02), fill=BORDER)
        # Deals + audience
        add_text(s, x, t_y + Inches(2.4), t_w, Inches(0.4), deals, size=13, color=INK, align="center", bold=True)
        add_text(s, x, t_y + Inches(2.75), t_w, Inches(0.4), audience, size=11, color=INK_MUTED, align="center")

    # Pilot banner
    pb_y = Inches(6.25)
    add_rounded(s, Inches(0.6), pb_y, Inches(12.1), Inches(0.6), fill=INK, radius=0.05)
    add_text(
        s,
        Inches(0.6),
        pb_y,
        Inches(12.1),
        Inches(0.6),
        "🎁  Pilot-Angebot Paderborn: 6 Monate kostenlos für die ersten 5 Maklerpartner",
        size=14,
        bold=True,
        color=WHITE,
        align="center",
        anchor="middle",
    )


def slide_pilot_strategy(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Pilot-Strategie")
    add_h1(s, "Paderborn first. Dann OWL. Dann Großstadt.")
    add_h2(s, "Tiefe vor Breite. Eine Kommune perfekt machen, dann replizieren.")

    phases = [
        (
            "Phase 1",
            "Monate 0–6",
            "Paderborn",
            "3–5 Pilot-Makler aus persönlichem Netzwerk · 17 lokal kuratierte Formulare · validiertes Reputations-Modul",
            BRAND_BLUE,
        ),
        (
            "Phase 2",
            "Monate 7–12",
            "OWL-Region",
            "Bielefeld + Detmold + Höxter · ähnliche Behörden-/Versorger-Struktur · Skaleneffekt durch Form-Wiederverwendung",
            EMERALD,
        ),
        (
            "Phase 3",
            "Monate 13–24",
            "Großstadt",
            "Frankfurt oder Köln · Mehrsprachigkeit (TR / AR / RU) wird relevant · Franchise-Makler-Tier (Engel & Völkers, von Poll)",
            AMBER,
        ),
    ]
    p_y = Inches(2.6)
    p_h = Inches(1.2)
    for i, (phase, when, where, body, color) in enumerate(phases):
        y = p_y + Inches(i * 1.4)
        # Bullet circle
        bs = Inches(0.6)
        bullet = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.6), y + Inches(0.3), bs, bs)
        bullet.shadow.inherit = False
        bullet.fill.solid()
        bullet.fill.fore_color.rgb = color
        bullet.line.fill.background()
        add_text(
            s,
            Inches(0.6),
            y + Inches(0.3),
            bs,
            bs,
            str(i + 1),
            size=20,
            bold=True,
            color=WHITE,
            align="center",
            anchor="middle",
        )
        # Content
        add_text(s, Inches(1.4), y + Inches(0.15), Inches(2.5), Inches(0.35), phase, size=11, bold=True, color=color)
        add_text(s, Inches(1.4), y + Inches(0.45), Inches(2.5), Inches(0.4), when, size=10, color=INK_MUTED)
        add_text(s, Inches(4.3), y + Inches(0.15), Inches(3), Inches(0.6), where, size=20, bold=True, color=INK)
        add_text(s, Inches(7.4), y + Inches(0.2), Inches(5.4), Inches(1.1), body, size=12, color=INK_SOFT)


def slide_roadmap(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Roadmap")
    add_h1(s, "18 Monate, vier Quartale, eine klare Linie.")
    add_h2(s, "Quartalsziele, an denen wir uns messen lassen.")

    quarters = [
        ("Q3 2026", "MVP live · 3 Pilot-Makler Paderborn · Anwalt für AGB beauftragt", BRAND_BLUE),
        ("Q4 2026", "5 zahlende Makler · CRM-Integration (Zapier) · erste 50 Käufer im System", BRAND_BLUE),
        ("Q1 2027", "10 Makler · OWL-Expansion startet · Mehrsprachigkeit TR aktiv", EMERALD),
        ("Q2 2027", "20 Makler · 200+ Bewertungen generiert · erste Großstadt-Pilotgespräche", EMERALD),
        ("Q3 2027", "30 Makler · Native CRM-Integrationen (Propstack, OnOffice)", AMBER),
        ("Q4 2027", "50 Makler · 150 k € ARR · Series-Seed-fähig", AMBER),
    ]
    q_y = Inches(2.7)
    q_w = Inches(3.95)
    q_h = Inches(1.6)
    for i, (when, what, color) in enumerate(quarters):
        row = i // 3
        col = i % 3
        x = Inches(0.6 + col * 4.2)
        y = q_y + Inches(row * 1.85)
        add_rounded(s, x, y, q_w, q_h, fill=WHITE, line=BORDER, radius=0.04)
        add_rect(s, x, y, Inches(0.12), q_h, fill=color)
        add_text(s, x + Inches(0.35), y + Inches(0.2), q_w, Inches(0.35), when, size=12, bold=True, color=color)
        add_text(s, x + Inches(0.35), y + Inches(0.6), q_w - Inches(0.55), Inches(0.9), what, size=11, color=INK_SOFT)


def slide_unit_economics(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Unit Economics")
    add_h1(s, "Konservative Projektion Jahr 2.")
    add_h2(s, "Pilotbasis 50 Makler. Realistische Annahmen. Klare Pfad-Eckpunkte.")

    # Left: Revenue waterfall
    left_x = Inches(0.6)
    left_w = Inches(6.1)
    add_rounded(s, left_x, Inches(2.7), left_w, Inches(3.6), fill=BG_LIGHT, line=BORDER, radius=0.04)
    add_text(s, left_x + Inches(0.4), Inches(2.85), left_w, Inches(0.5), "REVENUE", size=11, bold=True, color=INK_MUTED)
    revenue_lines = [
        ("50 Makler × ⌀ 100 € MRR", "5.000 € MRR"),
        ("Ø 2 Dienstleister-Deals × 75 €", "7.500 € MRR"),
        ("Gesamt MRR", "12.500 €"),
        ("Gesamt ARR", "150.000 €"),
    ]
    for i, (label, val) in enumerate(revenue_lines):
        y = Inches(3.3 + i * 0.6)
        is_total = i >= 2
        add_text(s, left_x + Inches(0.4), y, left_w - Inches(2), Inches(0.4), label, size=13, bold=is_total, color=INK if is_total else INK_SOFT, anchor="middle")
        add_text(s, left_x + Inches(3.5), y, left_w - Inches(3.8), Inches(0.4), val, size=14, bold=is_total, color=BRAND_BLUE if is_total else INK, align="right", anchor="middle")
        if i == 1:
            add_rect(s, left_x + Inches(0.4), y + Inches(0.45), left_w - Inches(0.8), Inches(0.02), fill=BORDER)

    # Right: Cost / CAC / LTV
    right_x = Inches(6.85)
    right_w = Inches(5.95)
    add_rounded(s, right_x, Inches(2.7), right_w, Inches(3.6), fill=WHITE, line=BORDER, radius=0.04)
    add_text(s, right_x + Inches(0.4), Inches(2.85), right_w, Inches(0.5), "EFFIZIENZ", size=11, bold=True, color=INK_MUTED)
    eff = [
        ("CAC (warm referral, Pilot)", "≈ 250 – 400 €"),
        ("LTV (Ø 24 Monate × 100 €)", "≈ 2.400 €"),
        ("LTV : CAC", "6× – 9×"),
        ("Payback-Periode", "3 – 4 Monate"),
    ]
    for i, (label, val) in enumerate(eff):
        y = Inches(3.3 + i * 0.6)
        add_text(s, right_x + Inches(0.4), y, right_w - Inches(2.4), Inches(0.4), label, size=13, color=INK_SOFT, anchor="middle")
        add_text(s, right_x + Inches(3.5), y, right_w - Inches(3.9), Inches(0.4), val, size=14, bold=True, color=EMERALD if i >= 2 else INK, align="right", anchor="middle")

    # Footer note
    add_text(s, Inches(0.6), Inches(6.5), Inches(12), Inches(0.3), "Annahme: SaaS-Conversion-Rate Pilot → Bezahlphase 80 %, Churn < 5 %/Jahr, Provisionen wachsen mit Käufer-Volumen.", size=10, color=INK_MUTED, align="center")


def slide_team(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Team")
    add_h1(s, "Founder mit Branchen-Kontext.")
    add_h2(s, "Operative Immobilien-Erfahrung trifft auf produkt- und technologiegetriebenes Denken.")

    # Founder placeholder card
    card_x = Inches(0.6)
    card_y = Inches(2.7)
    card_w = Inches(12.1)
    card_h = Inches(3.5)
    add_rounded(s, card_x, card_y, card_w, card_h, fill=WHITE, line=BORDER, radius=0.04)

    # Avatar placeholder
    av_size = Inches(2)
    av_x = card_x + Inches(0.6)
    av_y = card_y + Inches(0.75)
    av = s.shapes.add_shape(MSO_SHAPE.OVAL, av_x, av_y, av_size, av_size)
    av.shadow.inherit = False
    av.fill.solid()
    av.fill.fore_color.rgb = BRAND_BLUE_BG
    av.line.color.rgb = BRAND_BLUE
    av.line.width = Pt(1)
    add_text(s, av_x, av_y, av_size, av_size, "FW", size=44, bold=True, color=BRAND_BLUE, align="center", anchor="middle")

    # Text
    info_x = av_x + av_size + Inches(0.6)
    add_text(s, info_x, card_y + Inches(0.7), Inches(8), Inches(0.5), "Finn Wenzel", size=26, bold=True, color=INK)
    add_text(s, info_x, card_y + Inches(1.25), Inches(8), Inches(0.4), "Founder · PropAfterCare", size=14, color=BRAND_BLUE)
    add_text(
        s,
        info_x,
        card_y + Inches(1.85),
        Inches(8),
        Inches(1.5),
        "Bringe Branchenverständnis aus dem Immobilien-Umfeld mit operativer\nProduktarbeit zusammen. Aufgebaut aus dem persönlichen Netzwerk in\nPaderborn – mit Maklern, die das Problem aus Käufer- und Verkäufer-\nperspektive täglich erleben.",
        size=12,
        color=INK_SOFT,
    )

    add_text(
        s,
        Inches(0.6),
        Inches(6.5),
        Inches(12),
        Inches(0.3),
        "Verstärkungen in Engineering, Sales OWL und Steuer-/Rechtsberatung werden mit dem Pilot gesucht.",
        size=10,
        color=INK_MUTED,
        align="center",
    )


def slide_ask(s, page, total):
    add_footer(s, page, total)
    add_section_label(s, "Der Ask")
    add_h1(s, "Was wir suchen – je nach Rolle.")
    add_h2(s, "Drei Wege, mit uns zu arbeiten.")

    asks = [
        (
            "👤  PILOT-MAKLER",
            "Werde einer der ersten 5 Partner in Paderborn.",
            "✓ 6 Monate kostenlos\n✓ Direkter Draht zur Produktentwicklung\n✓ Mitkurations-Belohnung ab Tag 1",
            BRAND_BLUE,
        ),
        (
            "💼  INVESTOR",
            "Pre-Seed / Friends & Family für 18–24 Monate Runway.",
            "✓ Ticket-Größe 25 – 100 k €\n✓ Validierungsfenster Paderborn ist klar messbar\n✓ Skalierungs-Pfad OWL → Großstadt definiert",
            EMERALD,
        ),
        (
            "🤝  GESCHÄFTSPARTNER",
            "CRMs, Steuerberater, Versorger, Hausverwaltungen.",
            "✓ Distribution / Integration / Provision\n✓ Erst-Partnerschaften haben Vorteils-Konditionen\n✓ Win-Win-Modell, kein Nullsummen-Spiel",
            AMBER,
        ),
    ]
    a_y = Inches(2.7)
    a_w = Inches(3.95)
    a_h = Inches(3.4)
    for i, (header, line, body, color) in enumerate(asks):
        x = Inches(0.6 + i * 4.2)
        add_rounded(s, x, a_y, a_w, a_h, fill=WHITE, line=color, radius=0.04)
        add_rect(s, x, a_y, a_w, Inches(0.4), fill=color)
        add_text(s, x, a_y, a_w, Inches(0.4), header, size=11, bold=True, color=WHITE, align="center", anchor="middle")
        add_text(s, x + Inches(0.3), a_y + Inches(0.65), a_w - Inches(0.6), Inches(0.9), line, size=14, bold=True, color=INK)
        add_text(s, x + Inches(0.3), a_y + Inches(1.7), a_w - Inches(0.6), Inches(1.6), body, size=11, color=INK_SOFT)


def slide_contact(s, page, total):
    # Full-bleed brand-colored close
    add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)

    # Big logo
    add_logo_full(s, Inches(0.7), Inches(0.55), height=Inches(0.6))
    # override wordmark colors (white on dark)
    # (We rebuild the wordmark in white)
    box = s.shapes.add_textbox(Inches(1.5), Inches(0.55), Inches(4), Inches(0.6))
    tf = box.text_frame
    tf.word_wrap = False
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    for txt, color in [("Prop", WHITE), ("After", BRAND_BLUE_LIGHT), ("Care", WHITE)]:
        run = p.add_run()
        run.text = txt
        run.font.name = "Inter"
        run.font.size = Pt(20)
        run.font.bold = True
        run.font.color.rgb = color

    # Big tagline
    add_text(
        s,
        Inches(0.7),
        Inches(2.5),
        Inches(12),
        Inches(1.3),
        "Werden wir Partner?",
        size=64,
        bold=True,
        color=WHITE,
    )

    add_text(
        s,
        Inches(0.7),
        Inches(3.9),
        Inches(12),
        Inches(0.8),
        "Lass uns über deinen Pilot-Slot, dein Investment\noder deine Integration reden.",
        size=22,
        color=BRAND_BLUE_LIGHT,
    )

    # Contact card
    cc_x = Inches(0.7)
    cc_y = Inches(5.5)
    cc_w = Inches(7.5)
    cc_h = Inches(1.4)
    add_rounded(s, cc_x, cc_y, cc_w, cc_h, fill=RGBColor(0x2A, 0x2B, 0x30), radius=0.06)
    add_text(s, cc_x + Inches(0.4), cc_y + Inches(0.2), cc_w, Inches(0.35), "KONTAKT", size=10, bold=True, color=BRAND_BLUE_LIGHT)
    add_text(s, cc_x + Inches(0.4), cc_y + Inches(0.55), cc_w, Inches(0.45), "Finn Wenzel · Founder", size=16, bold=True, color=WHITE)
    add_text(s, cc_x + Inches(0.4), cc_y + Inches(0.95), cc_w, Inches(0.4), "finn.luca.wenzel@gmx.de", size=13, color=WHITE)


# ─── Main ────────────────────────────────────────────────────────────────


def build():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    # We need to know total page count first for footers.
    # Slides we'll add (in order): title, problem, reframe, market, solution,
    # workflow, reputation_trigger, competition, business_model, pricing,
    # pilot_strategy, roadmap, unit_economics, team, ask, contact
    builders = [
        slide_title,
        slide_problem,
        slide_reframe,
        slide_market,
        slide_solution,
        slide_workflow,
        slide_reputation_trigger,
        slide_competition,
        slide_business_model,
        slide_pricing,
        slide_pilot_strategy,
        slide_roadmap,
        slide_unit_economics,
        slide_team,
        slide_ask,
        slide_contact,
    ]
    total = len(builders)

    blank = prs.slide_layouts[6]
    for i, fn in enumerate(builders):
        s = prs.slides.add_slide(blank)
        if fn is slide_title:
            slide_title(s)
        else:
            fn(s, i + 1, total)

    out = Path("/home/user/Finn-W./PropAfterCare-Pitch.pptx")
    prs.save(str(out))
    print(f"Saved: {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
