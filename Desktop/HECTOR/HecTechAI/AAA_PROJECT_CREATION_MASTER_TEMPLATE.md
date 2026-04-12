# 🏗️ Plantilla Maestra: Creación de Proyectos "AAA"

## Modelo: Automated, AI-driven, Agnostic

Esta es la hoja de ruta oficial para replicar el éxito de HecTechAi en cualquier nuevo vertical de negocio. Sigue estos pasos en orden para construir una empresa que pueda escalar sin aumentar proporcionalmente tu carga de trabajo.

---

## 🟢 Fase 0: ADN Estratégico (Definición)

*Objetivo: Validar que el negocio tiene sentido y es automatizable.*

- [ ] **Nombre del Proyecto:** `[Nombre del Proyecto]`
- [ ] **Problema Core:** ¿Qué dolor específico estamos resolviendo? (Ej: Falta de tiempo, pérdida de leads).
- [ ] **Avatar del Cliente:** Identificar el nicho (Ej: Inmobiliarias, Clínicas, SaaS B2B).
- [ ] **Propuesta Única de Venta (USP):** ¿Por qué nosotros? ¿Cuál es la garantía irresistible?
- [ ] **Crear Documento:** `DNA_ESTRATEGICO.md` siguiendo el modelo de HecTechAi.

---

## 🔵 Fase 1: Infraestructura "The AAA Stack"

*Objetivo: Levantar los cimientos técnicos en menos de 48h.*

- [ ] **Web/Landing:** Desplegar en Vercel (Next.js/HTML) con diseño premium.
- [ ] **Base de Datos (Cerebro Técnico):** Configurar proyecto en **Supabase** (Tablas: `leads`, `config`).
- [ ] **Orquestador (Sistema Nervioso):** Conectar **n8n** (Cloud o Self-hosted).
- [ ] **CRM y Control (Panel Humano):** Crear Workspace en **Notion** con base de datos de Clientes y Proyectos.
- [ ] **Correo y Almacenamiento:** Configurar Google Workspace (Email profesional + Drive).

---

## 🟠 Fase 2: El Motor de Crecimiento (Captación)

*Objetivo: Crear un flujo constante de leads sin esfuerzo manual.*

- [ ] **Lead Magnet IA (Inbound):** Crear una herramienta gratuita en la web (Ej: Auditoría, Calculadora de ROI, Generador de ideas) que capture el email.
- [ ] **Sistema de Prospección (Outbound):** Clonar el "Radar de Leads" en n8n adaptando los parámetros de búsqueda al nuevo nicho.
- [ ] **Cualificación Automática:** Configurar n8n para que investigue el negocio del lead (vía SerpAPI/Gemini) antes de que tú lo veas.

---

## 🔴 Fase 3: Operaciones "Zero Touch" (Escalabilidad)

*Objetivo: Eliminar el trabajo administrativo de ventas y entrega.*

- [ ] **Automatización de Propuestas:** Flujo en n8n para generar PDFs o borradores de email personalizados basados en la auditoría.
- [ ] **Cierre Legal y Financiero:** Conectar **Stripe** (Pagos y consentimiento de condiciones) con n8n.
- [ ] **Onboarding Automático:** Al detectar el pago -> n8n debe:
  - [ ] Crear carpeta en Drive.
  - [ ] Crear página de proyecto en Notion.
  - [ ] Enviar email de bienvenida con acceso al portal.

---

## 🟣 Fase 4: Cerebro IA y Delegación

*Objetivo: Que el negocio "sepa" operar sin que tú estés presente.*

- [ ] **Documentación del Cerebro:** Crear archivo `BRAIN_PROMPTS.md` con todo el conocimiento, tono de voz y protocolos de resolución.
- [ ] **Configuración de Gemini Gem:** Crear un Gem personalizado con acceso a toda la documentación anterior.
- [ ] **Monitor de Errores:** Configurar el flujo de n8n para que te avise por Telegram si alguna automatización falla.

---

## 🏁 Checklist de Lanzamiento (MVP)

1. [ ] ¿La web tiene un formulario que llega a n8n?
2. [ ] ¿Los leads se guardan automáticamente en Supabase y Notion?
3. [ ] ¿Tengo un video o demo de cómo funciona el servicio?
4. [ ] ¿Puedo cobrar y enviar un contrato con un solo clic?

---
*Notas Adicionales:*
*Mantén siempre la simplicidad. Si un proceso no se puede explicar en un diagrama de flujo, es demasiado complejo para ser automatizado de forma robusta.*

---

## 📜 Bitácora de Ejecución (Caso Real: HecTechAi)

*Usa esta sección para anotar qué se hizo, cuándo y qué aprendimos. Sirve como "diario de construcción" para no repetir errores.*

| Fecha | Hito / Acción | Herramientas | Resultado |
| :--- | :--- | :--- | :--- |
| **Dic 2025** | Lanzamiento MVP Landing | Next.js, Vercel | Web funcional con formulario de contacto inicial. |
| **Ene 2024** | IA Audit (Lead Magnet) | Gemini 2.0 Flash | Conversión automática de leads con planes estratégicos. |
| **Ene 2024** | Radar de Leads 2.0 | n8n / SerpAPI | Prospección automática escaneando webs, redes y ads. |
| **Ene 2024** | Sistema de Onboarding | Notion / Stripe / Drive | Aceptación de condiciones y creación de carpetas automatizada. |
| **Hoy** | Creación de Plantilla Maestra | Documentación AAA | Estandarización del proceso para futuros negocios. |

---
*Este documento es el mapa. Los archivos específicos de cada fase contienen el tesoro. No olvides actualizarlos tras cada gran cambio.*
