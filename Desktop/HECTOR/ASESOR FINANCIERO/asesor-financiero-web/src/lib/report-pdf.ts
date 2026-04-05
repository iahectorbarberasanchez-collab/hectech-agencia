/**
 * Generador de informe PDF de cartera.
 * Client-side usando jsPDF + jsPDF-AutoTable.
 * Solo importar desde componentes "use client".
 */

export interface ReportAsset {
  asset_name: string;
  ticker: string;
  asset_type: string;
  quantity?: number | null;
  purchase_price?: number | null;
  current_price?: number | null;
  invested_eur: number;
  current_value_eur: number;
  pnl_eur: number;
  pnl_percent: number;
  target_percent?: number;
}

export interface ReportData {
  userName?: string;
  generatedAt: string;
  assets: ReportAsset[];
  totalInvested: number;
  totalCurrentValue: number;
  totalPnl: number;
  totalPnlPct: number;
  aiInsights?: string; // texto libre del asesor
}

export async function generatePortfolioReport(data: ReportData): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // dark slate
  doc.rect(0, 0, pageW, 35, 'F');

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Asesor Financiero Premium', margin, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Informe de Cartera', margin, 22);
  doc.text(`Generado: ${data.generatedAt}`, margin, 29);

  if (data.userName) {
    doc.setFontSize(10);
    doc.text(`Usuario: ${data.userName}`, pageW - margin, 22, { align: 'right' });
  }

  // ── Summary KPIs ─────────────────────────────────────────────────────────────
  let y = 45;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Cartera', margin, y);
  y += 8;

  const kpis = [
    ['Capital Invertido', `${data.totalInvested.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`],
    ['Valor Actual', `${data.totalCurrentValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`],
    ['Ganancia / Pérdida', `${data.totalPnl >= 0 ? '+' : ''}${data.totalPnl.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`],
    ['Rentabilidad Total', `${data.totalPnlPct >= 0 ? '+' : ''}${data.totalPnlPct.toFixed(2)} %`],
    ['Nº Posiciones', `${data.assets.length}`],
  ];

  const colW = (pageW - margin * 2) / kpis.length;
  kpis.forEach(([label, value], i) => {
    const x = margin + i * colW;
    const isPos = value.startsWith('+') || (!value.startsWith('-') && parseFloat(value) >= 0);
    doc.setFillColor(i % 2 === 0 ? 248 : 241, 250, 254);
    doc.roundedRect(x, y, colW - 2, 18, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 3, y + 6);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    // Color by value
    if (label.includes('Ganancia') || label.includes('Rentabilidad')) {
      doc.setTextColor(isPos ? 22 : 220, isPos ? 163 : 38, isPos ? 74 : 38);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(value, x + 3, y + 14);
  });

  y += 26;

  // ── Positions Table ──────────────────────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Posiciones Detalladas', margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Activo', 'Ticker', 'Tipo', 'Invertido (€)', 'Valor (€)', 'P&L (€)', 'P&L (%)', 'Estado']],
    body: data.assets.map(a => [
      a.asset_name.substring(0, 20),
      a.ticker || '—',
      a.asset_type || '—',
      a.invested_eur.toFixed(2),
      a.current_value_eur.toFixed(2),
      (a.pnl_eur >= 0 ? '+' : '') + a.pnl_eur.toFixed(2),
      (a.pnl_percent >= 0 ? '+' : '') + a.pnl_percent.toFixed(2) + '%',
      a.pnl_eur >= 0 ? '✅' : '❌',
    ]),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const val = parseFloat(String(data.cell.raw).replace('+', ''));
        data.cell.styles.textColor = val >= 0 ? [22, 163, 74] : [220, 38, 38];
      }
    },
  });

  // ── AI Insights ──────────────────────────────────────────────────────────────
  if (data.aiInsights) {
    const finalY = (doc as any).lastAutoTable?.finalY ?? 200;
    if (finalY + 40 < doc.internal.pageSize.getHeight()) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Análisis del Asesor IA', margin, finalY + 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(data.aiInsights, pageW - margin * 2);
      doc.text(lines.slice(0, 20), margin, finalY + 18); // max 20 lines
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Este informe es meramente informativo. No constituye asesoramiento financiero regulado.',
      margin, doc.internal.pageSize.getHeight() - 8
    );
    doc.text(`Página ${i}/${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
  }

  // Save
  const filename = `cartera_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
