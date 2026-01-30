# 🛠️ HecTechAi OPS: La Realidad Operativa

Última actualización: 28/1/2026, 20:07:32

> ⚠️ **INSTRUCCIÓN SUPREMA PARA EL GEM:** Este documento contiene SÓLO lo que existe, funciona y está desplegado. Si te preguntan "qué puedo hacer ahora mismo", responde basándote en esta lista.

## 🤖 Workflows Activos (Verificados en Backup)
Estos son los 7 procesos de n8n que tienes instalados actualmente:

### ✅ Client Onboarding & Stripe Payments (CORE)
- **Archivo:** `hectechai___client_onboarding__stripe_payment_.json`
- **Función:** Flujo CRÍTICO. Gestiona cobros (Inicial/Final) y despliegue (Supabase/Notion/Drive).

### ✅ Formulario Web a Borrador Gmail
- **Archivo:** `formulario_web_a_borrador_gmail_antigravity_funciona.json`
- **Función:** Captación de leads desde la web. Investiga con SerpAPI y redacta borrador.

### ✅ Radar de Leads 2.0
- **Archivo:** `hectechai___radar_de_leads_2_0__growth__antigravity_funciona.json`
- **Función:** Scraper de Redes Sociales. Busca deuda técnica en prospectos (Chatbots/Ads).

### ✅ Buscador de Clientes (Maps)
- **Archivo:** `hectechai___buscador_de_posibles_clientes_antigravity_funciona.json`
- **Función:** Prospección local vía Google Maps + Scraping de emails.

### ✅ Generador de Borradores de Venta
- **Archivo:** `hectechai___generador_de_borradores_de_venta_antigravity_funciona.json`
- **Función:** Redacción de copys de venta personalizados.

### ✅ Crear Proyectos de Clientes (Legacy)
- **Archivo:** `crear_proyectos_de_clientes_antigravity_funciona.json`
- **Función:** Antiguo onboarding manual (Notion -> Drive).

### ✅ Central de Errores
- **Archivo:** `hectechai___central_de_errores__email___telegram__antigravity_funciona.json`
- **Función:** Monitorización de fallos en n8n.

## 🏗️ Stack Tecnológico (Infraestructura)
- **Frontend:** Next.js (Vercel)
- **Backend Logic:** n8n (VPS Hetzner)
- **Database:** Supabase (Auth, Leads, Metrics)
- **Pagos:** Stripe (Checkout + Webhooks)

# 🔗 HecTechAi Detailed Tech Stack & Connections

Este documento detalla la infraestructura técnica, las bases de datos y las integraciones de la agencia. Es la fuente de verdad para el soporte técnico y la escalabilidad del Gem.

## 1. Bases de Datos (Supabase)

Utilizamos **Supabase** como almacén técnico seguro.

### Tabla: `leads`

* **Función:** Centraliza todos los contactos entrantes de la web (contacto directo y auditorías).
* **Columnas:**
  * `id`: UUID (Primary Key).
  * `name`: Nombre del cliente o referencia de auditoría (`Auditoría: Negocio`).
  * `email`: Email de contacto.
  * `phone`: Teléfono o etiqueta de procedencia.
  * `message`: Mensaje del lead o "Punto de dolor" si viene de la auditoría.
  * `created_at`: Timestamp.

### Tabla: `automation_metrics`

* **Función:** Muestra el impacto real de las automatizaciones en el Dashboard del cliente (`/dashboard`).
* **Columnas:**
  * `client_id` / `client_email`: Identificadores para el login del cliente.
  * `client_name`: Nombre visible.
  * `total_actions`: Acciones totales ejecutadas por n8n por el cliente.
  * `total_time_saved`: Tiempo total ahorrado en MINUTOS.
  * `history`: (JSONB) Histórico mensual de ahorro.

## 2. El "Cerebro" de Integración (n8n Webhooks)

La web se comunica con n8n a través de Webhooks via `POST` enviados desde `server actions`.

* **URL Base:** Definida en `process.env.N8N_WEBHOOK_URL`.
* **Eventos:**
    1. `web_contact_form`: Se dispara cuando alguien llena el formulario de la landing.
    2. `ia_audit`: Se dispara cuando alguien completa la "Auditoría IA". Envía el sector y el punto de dolor para prospección.

## 3. Stack de IA (Multi-Model)

HecTechAi utiliza un enfoque de "Mejor Modelo para la Tarea":

* **Gemini 2.0 Flash:**
  * **Auditoría IA:** Genera planes estratégicos instantáneos.
  * **Visual Audit:** Usa visión artificial para analizar capturas de pantalla de las webs de los clientes.
* **Claude (vía API en n8n):** Utilizado para el análisis profundo de leads y redacción de propuestas personalizadas (por su superioridad en tono narrativo).
* **Google Vertex AI:** Usado dentro de n8n para tareas de análisis de datos estructurados.

## 4. Onboarding & Finanzas (Automatizado)

* **Stripe:** Sincronizado vía Webhook con n8n. Al detectar pago exitoso -> n8n inicia onboarding.
* **Notion API:** n8n crea automáticamente:
  * Tarjeta en el CRM (Base de Datos de Ventas).
  * Workspace de proyecto para el nuevo cliente.
* **Google Drive API:** Creación automática de carpetas de cliente: `CLIENTES/[NOMBRE_CLIENTE]/01_DOCUMENTACION`.
* **Stripe (Legal):** El cliente acepta los Términos y Condiciones directamente en el Checkout de Stripe, simplificando el onboarding.

## 5. Notificaciones y Monitorización

* **Nodemailer:** Notificaciones de lead instantáneas a `hectechia@gmail.com`.
* **Central de Errores (n8n):** Si un nodo falla, n8n envía un Telegram/Email con el ID de ejecución y el JSON del error.

---
*Documentación técnica generada por Antigravity para el Gem de HecTechAi.*
