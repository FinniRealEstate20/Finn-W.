'use client';

import { jsPDF } from 'jspdf';

interface PdfFieldRow {
  label: string;
  value: string;
}

export interface PdfDocumentInput {
  title: string;
  subtitle: string;
  source: string;
  receiptId: string;
  fields: PdfFieldRow[];
  consequence?: string;
  submissionTarget?: string;
  buyerName?: string;
}

const MARGIN_X = 18;
const PAGE_WIDTH_MM = 210;
const CONTENT_WIDTH = PAGE_WIDTH_MM - MARGIN_X * 2;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed < 282) return y;
  doc.addPage();
  return 20;
}

function drawHeader(doc: jsPDF, input: PdfDocumentInput) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('PROPAFTERCARE · DEMO-AUSDRUCK', MARGIN_X, 14);
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(input.title, MARGIN_X, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize(input.subtitle, CONTENT_WIDTH), MARGIN_X, 36);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Quelle: ${input.source}`, MARGIN_X, 48);
  doc.text(`Beleg-ID: ${input.receiptId}`, MARGIN_X, 53);
  doc.text(
    `Erzeugt: ${new Date().toLocaleString('de-DE')}`,
    MARGIN_X,
    58
  );
}

function drawFields(doc: jsPDF, fields: PdfFieldRow[], startY: number): number {
  let y = startY;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);

  for (const row of fields) {
    y = ensureSpace(doc, y, 14);
    doc.setFillColor(248, 250, 252);
    doc.rect(MARGIN_X, y, CONTENT_WIDTH, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(row.label.toUpperCase(), MARGIN_X + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    const valueLines = doc.splitTextToSize(row.value || '—', CONTENT_WIDTH - 6);
    doc.text(valueLines, MARGIN_X + 3, y + 10);
    y += 14;
  }
  return y;
}

function drawFooter(doc: jsPDF, y: number, input: PdfDocumentInput) {
  let cursor = y + 6;
  if (input.consequence) {
    cursor = ensureSpace(doc, cursor, 24);
    doc.setFillColor(254, 243, 199);
    doc.rect(MARGIN_X, cursor, CONTENT_WIDTH, 18, 'F');
    doc.setTextColor(120, 53, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Hinweis:', MARGIN_X + 3, cursor + 6);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(input.consequence, CONTENT_WIDTH - 6);
    doc.text(lines, MARGIN_X + 3, cursor + 11);
    cursor += 22;
  }
  if (input.submissionTarget) {
    cursor = ensureSpace(doc, cursor, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('Einreichen an:', MARGIN_X, cursor);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(input.submissionTarget, MARGIN_X + 32, cursor);
    cursor += 8;
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'Erzeugt durch PropAfterCare · Demo · Keine Rechtsberatung',
    MARGIN_X,
    pageHeight - 10
  );
}

export function buildSubmissionPdf(input: PdfDocumentInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  drawHeader(doc, input);
  const y = drawFields(doc, input.fields, 68);
  drawFooter(doc, y, input);
  return doc.output('blob');
}

export function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
