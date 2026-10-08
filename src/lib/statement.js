import { signedAmount, startOfWeek, toDateInputValue } from './transactions';
import { categoryMeta } from './categories';
import { excludeSeparateBudgets } from './budgets';

// ---- Period presets ----

export function presetRange(preset, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (preset === 'week') return { from: startOfWeek(today), to: today };
  if (preset === 'month') return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
  if (preset === 'year') return { from: new Date(today.getFullYear(), 0, 1), to: today };
  return null;
}

// ---- Statement data ----

// Builds a bank-style statement for [from, to] (inclusive, local dates). Uses the same
// visibility rule as the dashboard: "tracked separately" budgets don't touch the balance.
export function buildStatement(transactions, budgets, from, to) {
  const fromKey = toDateInputValue(from);
  const toKey = toDateInputValue(to);
  const visible = excludeSeparateBudgets(transactions, budgets);

  const before = visible.filter((t) => toDateInputValue(t.date) < fromKey);
  const inRange = visible
    .filter((t) => {
      const k = toDateInputValue(t.date);
      return k >= fromKey && k <= toKey;
    })
    .sort((a, b) => a.date - b.date);

  const openingBalance = before.reduce((s, t) => s + signedAmount(t), 0);
  let running = openingBalance;
  let totalDebit = 0;
  let totalCredit = 0;
  const rows = inRange.map((t) => {
    running += signedAmount(t);
    if (t.isExpense) totalDebit += t.amount;
    else totalCredit += t.amount;
    return {
      date: t.date,
      description: t.note ? `${t.name} — ${t.note}` : t.name,
      category: categoryMeta(t.category).label,
      debit: t.isExpense ? t.amount : null,
      credit: t.isExpense ? null : t.amount,
      balance: running,
    };
  });

  return { from, to, openingBalance, closingBalance: running, totalDebit, totalCredit, rows };
}

// ---- PDF ----

// The built-in PDF fonts have no ₹ glyph, so amounts are written as "Rs.".
function money(n) {
  const sign = n < 0 ? '-' : '';
  return sign + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Loaded on demand so the PDF libraries don't weigh down the app's first load.
// Call preloadPdfLibs() when the statement screen opens so generating is quick on tap.
function loadPdfLibs() {
  return Promise.all([import('jspdf'), import('jspdf-autotable')]);
}

export function preloadPdfLibs() {
  loadPdfLibs().catch(() => {});
}

export async function generateStatementPdf(statement, { email }) {
  const [{ jsPDF }, { default: autoTable }] = await loadPdfLibs();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Ledger', margin, 56);
  doc.setFontSize(12);
  doc.text('Account Statement', pageW - margin, 56, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Account: ${email}`, margin, 80);
  doc.text(`Period: ${fmtDate(statement.from)} to ${fmtDate(statement.to)}`, margin, 95);
  doc.text(`Generated: ${fmtDate(new Date())}`, pageW - margin, 80, { align: 'right' });
  doc.setDrawColor(210);
  doc.line(margin, 108, pageW - margin, 108);

  // Summary
  autoTable(doc, {
    startY: 120,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Opening Balance', 'Total Credits', 'Total Debits', 'Closing Balance']],
    body: [
      [
        `Rs. ${money(statement.openingBalance)}`,
        `Rs. ${money(statement.totalCredit)}`,
        `Rs. ${money(statement.totalDebit)}`,
        `Rs. ${money(statement.closingBalance)}`,
      ],
    ],
    styles: { fontSize: 10, halign: 'center', cellPadding: 6 },
    headStyles: { fillColor: [244, 244, 246], textColor: 60, fontStyle: 'bold' },
    bodyStyles: { fontStyle: 'bold' },
  });

  // Transactions
  const body = [
    [{ content: 'Opening Balance', colSpan: 5, styles: { fontStyle: 'bold' } }, money(statement.openingBalance)],
    ...statement.rows.map((r) => [
      fmtDate(r.date),
      r.description,
      r.category,
      r.debit != null ? money(r.debit) : '',
      r.credit != null ? money(r.credit) : '',
      money(r.balance),
    ]),
  ];
  if (statement.rows.length === 0) {
    body.push([{ content: 'No transactions in this period.', colSpan: 6, styles: { halign: 'center', textColor: 140 } }]);
  }
  body.push([
    { content: 'Closing Balance', colSpan: 3, styles: { fontStyle: 'bold' } },
    { content: money(statement.totalDebit), styles: { fontStyle: 'bold' } },
    { content: money(statement.totalCredit), styles: { fontStyle: 'bold' } },
    { content: money(statement.closingBalance), styles: { fontStyle: 'bold' } },
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    margin: { left: margin, right: margin, bottom: 50 },
    theme: 'striped',
    head: [['Date', 'Description', 'Category', 'Debit (Rs.)', 'Credit (Rs.)', 'Balance (Rs.)']],
    body,
    styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
    headStyles: { fillColor: [48, 98, 214], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 70 },
      2: { cellWidth: 75 },
      3: { halign: 'right', cellWidth: 70, textColor: [200, 40, 40] },
      4: { halign: 'right', cellWidth: 70, textColor: [20, 140, 80] },
      5: { halign: 'right', cellWidth: 80 },
    },
  });

  // Footer with page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    const y = doc.internal.pageSize.getHeight() - 24;
    doc.text('Generated by Ledger. Amounts in Indian Rupees.', margin, y);
    doc.text(`Page ${i} of ${pages}`, pageW - margin, y, { align: 'right' });
  }

  const fileName = `Ledger-Statement_${toDateInputValue(statement.from)}_to_${toDateInputValue(statement.to)}.pdf`;
  return { blob: doc.output('blob'), fileName };
}

// On phones (incl. installed PWAs, where a plain download can strand you on the PDF with no
// back button), hand the file to the share sheet so it can be saved to Files / sent on.
// Elsewhere fall back to a normal download.
//
// Returns 'needs-tap' when the browser refused to open the share sheet because too long
// passed since the user's tap (iOS Safari is strict about this). Calling this again straight
// from a fresh tap works, since nothing is awaited before navigator.share().
export async function shareOrDownload({ blob, fileName }) {
  const file = new File([blob], fileName, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return 'done';
    } catch (e) {
      if (e.name === 'AbortError') return 'done'; // user closed the share sheet
      if (e.name === 'NotAllowedError') return 'needs-tap';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'done';
}
