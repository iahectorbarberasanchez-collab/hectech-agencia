import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PortfolioAsset } from './supabase';
import { MarketQuote } from '@/types/market';
import { FinancialInsight } from './insight-rules';

interface ReportData {
  userName: string;
  date: string;
  stats: {
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  };
  assets: PortfolioAsset[];
  quotes: Record<string, MarketQuote>;
  insights: FinancialInsight[];
}

export function generateFinancialReport({
  userName,
  date,
  stats,
  assets,
  quotes,
  insights
}: ReportData) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald 500
  const secondaryColor: [number, number, number] = [30, 41, 59]; // Slate 800

  // Header Background
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME FINANCIERO PREMIUM', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado para: ${userName}`, 140, 20);
  doc.text(`Fecha: ${date}`, 140, 26);

  // Section 1: RESUMEN EJECUTIVO
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMEN EJECUTIVO', 20, 55);

  // Cards-like stats
  autoTable(doc, {
    startY: 60,
    head: [['Patrimonio Neto', 'Capacidad Ahorro', 'Tasa Ahorro', 'Gasto Mensual']],
    body: [[
      `${stats.netWorth.toLocaleString('es-ES')} €`,
      `${(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString('es-ES')} €/mes`,
      `${stats.savingsRate.toFixed(1)}%`,
      `${stats.monthlyExpenses.toLocaleString('es-ES')} €`
    ]],
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 8, halign: 'center' },
    headStyles: { fillColor: primaryColor, textColor: 255 }
  });

  // Section 2: DESGLOSE DE CARTERA
  doc.setFontSize(16);
  doc.text('2. DESGLOSE DE CARTERA', 20, (doc as any).lastAutoTable.finalY + 20);

  const tableData = assets.map(asset => {
    const quote = asset.ticker ? quotes[asset.ticker.toUpperCase()] : null;
    const price = quote?.price || 0;
    const val = (asset.quantity && price > 0) ? (asset.quantity * price) : asset.value_eur;
    
    let plText = "--";
    if (asset.purchase_price && price > 0) {
      const profit = price - asset.purchase_price;
      const profitPercent = (profit / asset.purchase_price) * 100;
      plText = `${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(1)}%`;
    }

    return [
      asset.ticker || 'N/A',
      asset.asset_name,
      asset.quantity?.toString() || '--',
      `${price > 0 ? price.toLocaleString('es-ES') : '--'} €`,
      `${val.toLocaleString('es-ES')} €`,
      plText
    ];
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [['Ticker', 'Activo', 'Cant.', 'Precio', 'Valoración', 'P&L (%)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: secondaryColor as [number, number, number] },
    styles: { fontSize: 9 },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' },
      5: { halign: 'right' }
    }
  });

  // Section 3: INSIGHTS Y RECOMENDACIONES
  const insightsY = (doc as any).lastAutoTable.finalY + 20;
  if (insightsY > 240) doc.addPage();
  
  doc.setFontSize(16);
  doc.text('3. RECOMENDACIONES DEL ASESOR', 20, insightsY > 240 ? 30 : insightsY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let currentY = (insightsY > 240 ? 40 : insightsY + 10);

  insights.forEach((insight, index) => {
    if (currentY > 270) { doc.addPage(); currentY = 20; }
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${insight.title}`, 20, currentY);
    doc.setFont('helvetica', 'normal');
    const msg = doc.splitTextToSize(insight.message, 170);
    doc.text(msg, 25, currentY + 5);
    currentY += 10 + (msg.length * 5);
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Documento confidencial generado por Financial AI Advisor. No constituye asesoramiento financiero regulado.', 20, 290);
    doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
  }

  doc.save(`Informe_Financiero_${userName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
