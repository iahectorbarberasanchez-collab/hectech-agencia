/**
 * Datos Fiscales de España Actualizados - EJERCICIO FISCAL 2025
 * (Para la campaña de la Renta que se realiza en 2026)
 */

export const FISCAL_DATA_ES = {
  fiscal_year: '2025',
  tax_campaign: 'Campaña de la Renta 2026 (sobre ingresos de 2025)',
  
  irpf: {
    description: 'Impuesto sobre la Renta de las Personas Físicas (Base Imponible General)',
    tramos_estatales: [
      { hasta: 12450, tipo: 0.19 },
      { hasta: 20200, tipo: 0.24 },
      { hasta: 35200, tipo: 0.30 },
      { hasta: 60000, tipo: 0.37 },
      { hasta: 300000, tipo: 0.45 },
      { superior: 300000, tipo: 0.47 }
    ],
    ahorro: [
      { hasta: 6000, tipo: 0.19 },
      { hasta: 50000, tipo: 0.21 },
      { hasta: 200000, tipo: 0.23 },
      { hasta: 300000, tipo: 0.27 },
      { superior: 300000, tipo: 0.30 } // Actualizado: sube del 28% al 30% para >300k
    ],
    nota: 'Existen tramos autonómicos. Madrid, Andalucía y otras comunidades han deflactado sus tramos para compensar la inflación.'
  },
  
  iva: {
    general: 0.21,
    reducido: 0.10, // Pastas y aceites de semillas vuelven al 10% en 2025
    superreducido: 0.04, // Alimentos básicos y aceite de oliva están al 4% permanente desde enero 2025
    exentos: 'Servicios médicos, educación y alquiler de vivienda habitual.'
  },
  
  impuesto_sociedades: {
    general: 0.25,
    reducido_pymes: 0.23, // Cifra de negocios < 1M€
    nuevas_empresas: 0.15, // Primeros 2 años con beneficios
  },
  
  autonomos_2025: {
    sistema: 'Cotización por ingresos reales (Cifras definitivas 2025)',
    tabla_tramos: [
      { ingresos: 'Hasta 670€', cuota_minima: '200€' },
      { ingresos: '670€ - 900€', cuota_minima: '220€' },
      { ingresos: '900€ - 1125€', cuota_minima: '260€' },
      { ingresos: '1125€ - 1300€', cuota_minima: '291€' },
      { ingresos: '1300€ - 1700€', cuota_minima: '294€' },
      { ingresos: '1700€ - 1850€', cuota_minima: '350€' },
      { ingresos: '1850€ - 2030€', cuota_minima: '370€' },
      { ingresos: '2030€ - 2330€', cuota_minima: '390€' },
      { ingresos: '2330€ - 2760€', cuota_minima: '415€' },
      { ingresos: '2760€ - 3190€', cuota_minima: '440€' },
      { ingresos: '3190€ - 3620€', cuota_minima: '465€' },
      { ingresos: '3620€ - 4050€', cuota_minima: '490€' },
      { ingresos: '4050€ - 6000€', cuota_minima: '530€' },
      { ingresos: 'Más de 6000€', cuota_minima: '590€' }
    ],
    mei: '0.8% (Mecanismo de Equidad Intergeneracional)',
    tarifa_plana: '80€ durante el primer año.'
  },
  
  patrimonio_y_solidaridad: {
    patrimonio: 'Mínimo exento general de 700.000€ (más 300.000€ de vivienda). Bonificado al 100% en Madrid y Andalucía.',
    grandes_fortunas: 'Desde 3M€ de patrimonio neto.'
  }
};
