# 🚀 Documentación del Stack Tecnológico - HecTechAI

Este documento proporciona una visión detallada y exhaustiva de todo el ecosistema tecnológico que impulsa **HecTechAI**. La arquitectura está diseñada para ser escalable, segura y altamente automatizada.

---

## 💻 1. Frontend: Aplicación Web & User Experience

La interfaz de usuario está construida para ser rápida, reactiva y visualmente impactante.

* **Framework Principal:** [Next.js 16 (App Router)](https://nextjs.org/) - Utilizando las últimas capacidades de Server Components y Streaming.
* **Lógica de Interfaz:** [React 19](https://react.dev/) - La base para componentes interactivos y gestión de estado.
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estático para garantizar la robustez del código y facilitar el mantenimiento.
* **Estilizado:** [Tailwind CSS 4](https://tailwindcss.com/) - Diseño moderno, responsive y optimizado para rendimiento.
* **Animaciones:** [Framer Motion](https://www.framer.com/motion/) - Para micro-interacciones suaves y una experiencia de usuario premium.
* **Iconografía:** [Lucide React](https://lucide.dev/) - Conjunto de iconos vectoriales consistentes y ligeros.

---

## 💾 2. Backend & Infraestructura de Datos

HecTechAI utiliza un enfoque de "Backend as a Service" para agilizar el desarrollo sin comprometer la potencia.

* **Plataforma de Backend:** [Supabase](https://supabase.com/)
  * **Base de Datos:** PostgreSQL (Relacional) estructurado para escalabilidad.
  * **Autenticación:** Gestión segura de usuarios y roles.
  * **Tablas de Negocio:**
    * `leads`: Centralización de prospección y auditorías.
    * `automation_metrics`: Tracking de KPIs y ahorro de tiempo para clientes.
* **Alojamiento del Frontend:** [Vercel](https://vercel.com/) - Despliegue continuo (CI/CD) con optimización de Edge Network.

---

## 🤖 3. Capa de Inteligencia Artificial (Estrategia Multi-Modelo)

No dependemos de un solo modelo; seleccionamos el mejor para cada tarea específica (**LLM Orchestration**).

* **Google Gemini 2.0 Flash:**
  * Utilizado para respuestas de baja latencia.
  * **IA Audit:** Generación instantánea de planes estratégicos.
  * **Visual Logic:** Análisis de capturas de pantalla de sitios web de clientes.
* **Claude 3.5 Sonnet (vía API):**
  * Especializado en redacción creativa y análisis profundo de leads.
  * Generación de propuestas comerciales personalizadas con tono humano.
* **Google Vertex AI:**
  * Análisis de datos estructurados y tareas complejas dentro de flujos de trabajo.

---

## ⚙️ 4. Motor de Automatización (Workflow Orchestration)

El "corazón" operativo que conecta todas las herramientas entre sí.

* **Plataforma:** [n8n](https://n8n.io/)
* **Alojamiento:** VPS Dedicado (Debian) para control total de datos y ejecución.
* **Flujos Críticos:**
  * **Webhooks Inbound:** Captura de formularios y auditorías desde la web.
  * **Pipeline de Ventas:** Clasificación y enriquecimiento automático de leads.
  * **Onboarding de Clientes:** Disparo de acciones post-pago.

---

## 🔗 5. Ecosistema de Integraciones

HecTechAI actúa como un hub que orquesta diversas herramientas líderes en el mercado.

* **Finanzas:** [Stripe](https://stripe.com/) - Procesamiento de pagos y suscripciones con sincronización en tiempo real vía Webhooks.
* **CRM & Gestión:** [Notion API](https://developers.notion.com/) - Creación automática de espacios de trabajo para clientes y tracking de proyectos.
* **Almacenamiento Cloud:** [Google Drive API](https://developers.google.com/drive) - Organización automática de documentación y entregables en carpetas estructuradas.
* **Legal:** [Stripe Checkout](https://stripe.com/) - Aceptación vinculante de términos y condiciones integrada en el flujo de pago.
* **Comunicación:** [Nodemailer](https://nodemailer.com/) & [Gmail API](https://developers.google.com/gmail/api) - Notificaciones transaccionales y comunicación directa con clientes.

---

## 💰 6. Costos de Infraestructura

Transparencia total sobre la inversión en infraestructura técnica:

### Costos Anuales

* **Dominio (Cloudflare):** €8.99/año - Registro y gestión DNS del dominio hectechai.com

### Costos Mensuales

* **VPS Hetzner:** ~€8/mes - Servidor dedicado para n8n y automatizaciones (Debian)
* **Supabase:** Plan gratuito (Free Tier) - Base de datos PostgreSQL
* **Vercel:** Plan gratuito (Hobby) - Hosting del frontend con CI/CD

### Costo Total Estimado

* **Mensual:** ~€8/mes
* **Anual:** ~€104.99/año (€96 VPS + €8.99 dominio)

**Nota:** Los servicios de IA (Gemini, Claude) y herramientas SaaS (Stripe, Notion, Google Drive) tienen costos variables según uso o están en planes gratuitos/de desarrollo.

---

## 🛡️ 7. Seguridad & Monitorización

* **Gestión de Secretos:** Variables de entorno seguras en Vercel y n8n.
* **Monitorización de Errores:** Sistema de alertas en n8n que notifica vía Telegram/Email cualquier anomalía en los flujos críticos.
* **Logs:** Registro detallado de peticiones y respuestas para auditoría técnica.

---

*Documento actualizado al 27 de enero de 2026. HecTechAI - Agencia de Automatización con IA.*
