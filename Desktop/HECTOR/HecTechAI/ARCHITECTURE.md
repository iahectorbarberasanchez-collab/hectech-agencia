# Arquitectura HecTechAi (The AAA Stack)

Este documento centraliza la infraestructura técnica de la agencia, basada en el modelo "The AAA Stack".

## 🛠️ Stack Tecnológico

| Componente | Herramienta | Función Principal |
| :--- | :--- | :--- |
| **Hospedaje Web** | [Vercel](https://vercel.com) | Hosting de la landing page (Next.js) y dominio principal. |
| **El "Cerebro"** | [n8n](https://n8n.io) | Orquestación de lógica. Procesa leads, contratos y automatizaciones. |
| **Gestión (CRM)** | [Notion](https://notion.so) | Panel visual de ventas, seguimiento de clientes y proyectos. |
| **Base de Datos** | [Supabase](https://supabase.com) | Almacén técnico seguro para leads, contratos y estadísticas. |
| **Pagos y Facturas** | [Stripe](https://stripe.com) | Pasarela de cobro integrada con flujos de onboarding en n8n. |
| **Contratos** | [Stripe](https://stripe.com) | Consentimiento legal integrado en el flujo de pago. |
| **Modelos de IA** | [Gemini](https://ai.google.dev/) / [Claude](https://anthropic.com) | Gemini para auditorías web y Claude (vía API) para análisis de negocio. |
| **Workspace** | [Google Workspace](https://workspace.google.com) | Correo profesional, Drive y calendario. |

## 🔄 Integraciones Actuales

### Web → n8n → Supabase/Email

La landing page ([hectech-agency](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/hectech-agency)) utiliza `server actions` para:

1. Validar datos del lead.
2. Enviar datos al Webhook de n8n.
3. Almacenar el registro en la tabla `leads` de Supabase.
4. Notificar vía Email a la agencia.

### Auditoría IA

Implementada en [actions.ts](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/hectech-agency/src/app/actions.ts#L105-183), utiliza el modelo `gemini-2.0-flash` para generar estrategias de automatización personalizadas basadas en el tipo de negocio y puntos de dolor del cliente.

## 🚀 Ciclo de Vida del Cliente (Workflow Operativo)

Este es el flujo lógico que sigue un cliente desde que es un lead hasta que está en mantenimiento:

1. **Atracción (Outbound)**: Bot de prospección (n8n de la propia agencia) → Email personalizado de prospección.
2. **Conversión (Inbound)**: El cliente entra en la web de Vercel → Realiza la **Auditoría IA** → Captura de datos del lead.
3. **Registro y Cualificación**: n8n guarda el lead en **Supabase** (para seguridad de datos) y crea una tarjeta en **Notion (CRM)** con una "Investigación IA" ya realizada sobre el negocio.
4. **Cierre y Depósito**: Se envía la propuesta y el **Link de Depósito Stripe** (con aceptación de TyC). Al pagar, n8n crea el cliente en Supabase, Notion (Ganado) y la carpeta en Drive.
5. **Setup y Construcción**: La agencia realiza el trabajo de automatización. El cliente puede acceder al Dashboard para ver el progreso.
6. **Activación (Go-Live)**: Se envía **Link de Suscripción Stripe** (incluye saldo restante del setup). Al pagar, n8n activa el servicio y notifica al cliente indicando que su sistema está "En Vivo".
7. **Mantenimiento**: Cobro mensual automático. Si falla el pago, n8n desactiva automáticamente los servicios hasta la regularización.

## 🏢 Mapa de Departamentos (Cobertura Empresarial)

Tu infraestructura cubre prácticamente todas las áreas clave de una empresa moderna de servicios:

| Departamento | Herramientas / Flujos | Funciones Clave |
| :--- | :--- | :--- |
| **Ventas (Comercial)** | **Radar 2.0** / Landing / Notion CRM | Captación de leads con análisis de **Redes Sociales** e inversión en **Ads**. |
| **Marketing (Crecimiento)** | Vercel (Next.js) / Auditoría IA | Generación de autoridad, SEO y lead magnets interactivos. |
| **Operaciones (Entrega)** | n8n onboarding / Notion Workspaces / Drive | Ejecución de servicios, gestión de proyectos y portales de cliente. |
| **Administración / Legal** | Stripe (Consent) / n8n | Gestión automatizada de términos y condiciones en el checkout. |
| **Finanzas (Facturación)** | Stripe | Cobros automáticos, gestión de suscripciones y facturación vinculada a ventas. |
| **IT y Sistemas (I+D)** | Central de Errores / Supabase / Gemini | Monitorización técnica, seguridad de datos e innovación con IA. |
| **Dirección (Management)** | Notion Dashboards / Informes n8n | Toma de decisiones basada en datos y visión general del negocio. |
