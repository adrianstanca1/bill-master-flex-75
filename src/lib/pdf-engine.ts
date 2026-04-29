import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData, Totals, computeTotals, formatCurrency, getVATLabel } from './invoice-calc';

export interface PDFTheme {
  primary: [number, number, number];
  secondary: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  border: [number, number, number];
  accent: [number, number, number];
}

const DEFAULT_THEME: PDFTheme = {
  primary: [29, 78, 216],
  secondary: [241, 245, 249],
  text: [17, 24, 39],
  muted: [107, 114, 128],
  border: [209, 213, 219],
  accent: [220, 38, 38],
};

export interface PDFOptions {
  documentType?: 'INVOICE' | 'QUOTE' | 'CREDIT NOTE' | 'STATEMENT';
  theme?: Partial<PDFTheme>;
  logoDataUrl?: string | null;
  watermark?: string;
  showTermsPage?: boolean;
  terms?: string[];
  payment?: {
    bankName?: string;
    sortCode?: string;
    accountNumber?: string;
    iban?: string;
    swift?: string;
    reference?: string;
  };
  filename?: string;
}

const PAGE_MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function mergeTheme(theme?: Partial<PDFTheme>): PDFTheme {
  return { ...DEFAULT_THEME, ...(theme || {}) };
}

function setFill(doc: jsPDF, color: [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setText(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDraw(doc: jsPDF, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function loadImageDataUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('company-logo');
  } catch {
    return null;
  }
}

function detectImageFormat(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
  if (dataUrl.includes('image/webp')) return 'WEBP';
  return 'PNG';
}

function drawHeader(
  doc: jsPDF,
  data: InvoiceData,
  theme: PDFTheme,
  documentType: string,
  logo: string | null,
) {
  setFill(doc, theme.primary);
  doc.rect(0, 0, PAGE_WIDTH, 38, 'F');

  if (logo) {
    try {
      const fmt = detectImageFormat(logo);
      doc.addImage(logo, fmt, PAGE_MARGIN, 8, 22, 22);
    } catch {
      // Bad image data – ignore so PDF still renders
    }
  }

  const titleX = logo ? PAGE_MARGIN + 28 : PAGE_MARGIN;
  setText(doc, [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(documentType, titleX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`No. ${data.invoice.number}`, titleX, 26);
  if (data.invoice.reference) {
    doc.text(`Ref: ${data.invoice.reference}`, titleX, 32);
  }

  const rightX = PAGE_WIDTH - PAGE_MARGIN;
  doc.setFontSize(9);
  doc.text(`Issue date: ${formatDate(data.invoice.date)}`, rightX, 18, { align: 'right' });
  if (data.invoice.dueDate) {
    doc.text(`Due date: ${formatDate(data.invoice.dueDate)}`, rightX, 24, { align: 'right' });
  }
  doc.text(getVATLabel(data.vatMode), rightX, 30, { align: 'right' });
}

function drawAddresses(doc: jsPDF, data: InvoiceData, theme: PDFTheme, startY: number): number {
  const colW = (CONTENT_WIDTH - 8) / 2;
  const fromX = PAGE_MARGIN;
  const toX = PAGE_MARGIN + colW + 8;

  setText(doc, theme.muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FROM', fromX, startY);
  doc.text('BILL TO', toX, startY);

  setText(doc, theme.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.company.name || '', fromX, startY + 6);
  doc.text(data.client.name || '', toX, startY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, theme.text);

  const fromLines = buildPartyLines({
    address: data.company.address,
    email: data.company.email,
    phone: data.company.phone,
    extras: [
      data.company.vatNumber ? `VAT: ${data.company.vatNumber}` : '',
      data.company.regNumber ? `Reg: ${data.company.regNumber}` : '',
    ],
  });
  const toLines = buildPartyLines({
    address: data.client.address,
    email: data.client.email,
    phone: undefined,
    extras: [data.client.contact ? `Attn: ${data.client.contact}` : ''],
  });

  const fromWrapped = doc.splitTextToSize(fromLines.join('\n'), colW);
  const toWrapped = doc.splitTextToSize(toLines.join('\n'), colW);
  doc.text(fromWrapped, fromX, startY + 12);
  doc.text(toWrapped, toX, startY + 12);

  const rows = Math.max(fromWrapped.length, toWrapped.length);
  return startY + 12 + rows * 4.5 + 4;
}

function buildPartyLines(p: {
  address?: string;
  email?: string;
  phone?: string;
  extras: string[];
}): string[] {
  const lines: string[] = [];
  if (p.address) lines.push(...p.address.split(/\r?\n/));
  if (p.email) lines.push(p.email);
  if (p.phone) lines.push(p.phone);
  for (const e of p.extras) if (e) lines.push(e);
  return lines.filter(Boolean);
}

function drawItemsTable(
  doc: jsPDF,
  data: InvoiceData,
  theme: PDFTheme,
  startY: number,
): number {
  const head = [['#', 'Description', 'Qty', 'Unit price', 'Line total']];
  const body = data.items.map((it, i) => [
    String(i + 1),
    it.description || '',
    formatQty(it.quantity),
    formatCurrency(it.unitPrice || 0),
    formatCurrency((it.quantity || 0) * (it.unitPrice || 0)),
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: theme.text,
      lineColor: theme.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: theme.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: { fillColor: theme.secondary },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
    },
  });

  // @ts-expect-error – lastAutoTable injected by jspdf-autotable
  return doc.lastAutoTable.finalY + 6;
}

function drawTotals(
  doc: jsPDF,
  data: InvoiceData,
  totals: Totals,
  theme: PDFTheme,
  startY: number,
): number {
  const boxW = 80;
  const boxX = PAGE_WIDTH - PAGE_MARGIN - boxW;
  let y = startY;

  const rows: Array<{ label: string; value: string; emphasis?: 'normal' | 'bold' | 'accent' }> = [
    { label: 'Subtotal', value: formatCurrency(totals.subtotal) },
  ];
  if (totals.discount > 0) {
    rows.push({ label: 'Discount', value: `-${formatCurrency(totals.discount)}`, emphasis: 'accent' });
    rows.push({ label: 'Net after discount', value: formatCurrency(totals.netAfterDiscount) });
  }
  if (data.vatMode === 'STANDARD_20') {
    rows.push({
      label: `VAT (${(totals.vatRate * 100).toFixed(0)}%)`,
      value: formatCurrency(totals.vatAmount),
    });
  } else if (data.vatMode === 'REVERSE_CHARGE_20') {
    rows.push({ label: 'VAT (reverse charge)', value: formatCurrency(0) });
  }
  rows.push({ label: 'Total before retention', value: formatCurrency(totals.totalBeforeRetention) });
  if (totals.retention > 0) {
    rows.push({ label: 'Retention', value: `-${formatCurrency(totals.retention)}`, emphasis: 'accent' });
    rows.push({ label: 'Total after retention', value: formatCurrency(totals.totalAfterRetention) });
  }
  if (totals.cisDeduction > 0) {
    rows.push({
      label: `CIS deduction (${totals.cisPercent}%)`,
      value: `-${formatCurrency(totals.cisDeduction)}`,
      emphasis: 'accent',
    });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const r of rows) {
    setText(doc, r.emphasis === 'accent' ? theme.accent : theme.text);
    doc.text(r.label, boxX, y);
    doc.text(r.value, boxX + boxW, y, { align: 'right' });
    y += 6;
  }

  // Total due banner
  y += 2;
  setFill(doc, theme.primary);
  doc.rect(boxX - 2, y - 5, boxW + 4, 12, 'F');
  setText(doc, [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total due', boxX, y + 2);
  doc.text(formatCurrency(totals.totalDue), boxX + boxW, y + 2, { align: 'right' });

  return y + 14;
}

function drawNotes(
  doc: jsPDF,
  data: InvoiceData,
  theme: PDFTheme,
  startY: number,
  options: PDFOptions,
): number {
  let y = startY;
  const notes: string[] = [];
  if (data.invoice.notes) notes.push(data.invoice.notes);
  if (data.vatMode === 'REVERSE_CHARGE_20') {
    notes.push(
      'VAT Reverse Charge (Construction Services): Customer to account for VAT to HMRC at 20%.',
    );
  }

  if (notes.length) {
    setText(doc, theme.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NOTES', PAGE_MARGIN, y);
    y += 4;

    setText(doc, theme.text);
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(notes.join('\n\n'), CONTENT_WIDTH);
    doc.text(wrapped, PAGE_MARGIN, y + 2);
    y += wrapped.length * 4 + 6;
  }

  if (options.payment) {
    const p = options.payment;
    const lines: string[] = [];
    if (p.bankName) lines.push(`Bank: ${p.bankName}`);
    if (p.sortCode) lines.push(`Sort code: ${p.sortCode}`);
    if (p.accountNumber) lines.push(`Account: ${p.accountNumber}`);
    if (p.iban) lines.push(`IBAN: ${p.iban}`);
    if (p.swift) lines.push(`SWIFT: ${p.swift}`);
    if (p.reference) lines.push(`Reference: ${p.reference}`);
    if (lines.length) {
      setText(doc, theme.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PAYMENT DETAILS', PAGE_MARGIN, y);
      y += 4;
      setText(doc, theme.text);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, PAGE_MARGIN, y + 2);
      y += lines.length * 4 + 6;
    }
  }

  return y;
}

function drawFooter(doc: jsPDF, theme: PDFTheme, companyName: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    setDraw(doc, theme.border);
    doc.setLineWidth(0.2);
    doc.line(PAGE_MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 14);
    setText(doc, theme.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${companyName} – Generated by AS Invoice Generator`, PAGE_MARGIN, PAGE_HEIGHT - 8);
    doc.text(`Page ${i} of ${pages}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 8, {
      align: 'right',
    });
  }
}

function drawWatermark(doc: jsPDF, text: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.saveGraphicsState();
    // @ts-expect-error – setGState exists on runtime instance
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(80);
    doc.text(text, PAGE_WIDTH / 2, PAGE_HEIGHT / 2, {
      align: 'center',
      angle: 30,
    });
    doc.restoreGraphicsState();
  }
}

function drawTermsPage(doc: jsPDF, theme: PDFTheme, terms: string[]) {
  doc.addPage();
  setText(doc, theme.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Terms & Conditions', PAGE_MARGIN, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let y = 34;
  terms.forEach((t, idx) => {
    const wrapped = doc.splitTextToSize(`${idx + 1}. ${t}`, CONTENT_WIDTH);
    doc.text(wrapped, PAGE_MARGIN, y);
    y += wrapped.length * 5 + 2;
  });
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatQty(q: number): string {
  const n = Number(q || 0);
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9._-]+/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

export function buildInvoicePDF(
  data: InvoiceData,
  totals: Totals,
  options: PDFOptions = {},
): jsPDF {
  const theme = mergeTheme(options.theme);
  const documentType = options.documentType || 'INVOICE';
  const logo = options.logoDataUrl ?? loadImageDataUrl();

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  drawHeader(doc, data, theme, documentType, logo);
  let y = drawAddresses(doc, data, theme, 50);
  y = drawItemsTable(doc, data, theme, y);
  y = drawTotals(doc, data, totals, theme, y);
  drawNotes(doc, data, theme, y, options);

  if (options.showTermsPage && options.terms?.length) {
    drawTermsPage(doc, theme, options.terms);
  }

  drawFooter(doc, theme, data.company.name || '');
  if (options.watermark) drawWatermark(doc, options.watermark);

  doc.setProperties({
    title: `${documentType} ${data.invoice.number}`,
    subject: `${documentType} for ${data.client.name}`,
    author: data.company.name || 'AS Invoice Generator',
    creator: 'AS Invoice Generator – PDF Engine',
    keywords: `${documentType.toLowerCase()},${data.invoice.number},${data.client.name}`,
  });

  return doc;
}

export function downloadInvoicePDF(
  data: InvoiceData,
  totals: Totals,
  options: PDFOptions = {},
): string {
  const doc = buildInvoicePDF(data, totals, options);
  const docType = (options.documentType || 'invoice').toLowerCase();
  const filename =
    options.filename ||
    sanitizeFilename(`${docType}-${data.invoice.number || 'draft'}-${data.client.name || 'client'}.pdf`);
  doc.save(filename);
  return filename;
}

export function openInvoicePDF(
  data: InvoiceData,
  totals: Totals,
  options: PDFOptions = {},
): void {
  const doc = buildInvoicePDF(data, totals, options);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function getInvoicePDFBlob(
  data: InvoiceData,
  totals: Totals,
  options: PDFOptions = {},
): Blob {
  return buildInvoicePDF(data, totals, options).output('blob');
}

// ---------------------------------------------------------------------------
// Quote helpers – converts a stored quote shape into the InvoiceData shape so
// the same renderer can be reused.
// ---------------------------------------------------------------------------

export interface QuoteLike {
  id?: string;
  title: string;
  total?: number;
  status?: string;
  created_at: string;
  valid_until?: string;
  reference?: string;
  notes?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  company?: InvoiceData['company'];
  client?: InvoiceData['client'] | { name?: string };
}

export function quoteToInvoiceData(quote: QuoteLike): InvoiceData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    company: quote.company || {
      name: 'Your Company',
      address: '',
    },
    client: {
      name: (quote.client && (quote.client as { name?: string }).name) || quote.title || 'Client',
      address: (quote.client as InvoiceData['client'])?.address || '',
      contact: (quote.client as InvoiceData['client'])?.contact,
      email: (quote.client as InvoiceData['client'])?.email,
    },
    invoice: {
      number: quote.id ? `Q-${quote.id.slice(0, 8).toUpperCase()}` : `Q-${Date.now()}`,
      date: quote.created_at?.slice(0, 10) || today,
      dueDate: quote.valid_until?.slice(0, 10),
      reference: quote.reference,
      notes: quote.notes,
    },
    items: (quote.items || []).map((i) => ({
      description: i.description,
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    })),
    vatMode: 'STANDARD_20',
    discountPercent: 0,
    retentionPercent: 0,
  };
}

export function downloadQuotePDF(quote: QuoteLike, options: PDFOptions = {}): string {
  const data = quoteToInvoiceData(quote);
  const totals = computeTotals(data);
  return downloadInvoicePDF(data, totals, {
    showTermsPage: true,
    terms: options.terms || defaultQuoteTerms(),
    ...options,
    documentType: 'QUOTE',
    watermark: quote.status?.toLowerCase() === 'draft' ? 'DRAFT' : options.watermark,
  });
}

export function defaultQuoteTerms(): string[] {
  return [
    'This quote is valid for 30 days from the date of issue unless otherwise stated.',
    'Payment terms: 30 days net from the date of any invoice raised against this quote.',
    'All work is carried out in accordance with relevant health & safety regulations.',
    'Materials and workmanship are guaranteed for 12 months from completion.',
    'Variations to the scope of work will be quoted separately and require written approval.',
  ];
}