# 🧠 HecTechAi Brain: El Corazón de la Agencia

Última actualización: 25/1/2026, 12:46:20

Este documento es la **fuente de verdad técnica y operativa** sobre HecTechAi. Se ha generado automáticamente para servir de base al Gemini Gem.

## 👤 Perfil del Fundador

- **Nombre:** Héctor Barberá Sánchez.
- **Rol:** Fundador y Arquitecto Jefe de Automatización.
- **Tono:** Directo, profesional, sin rellenos corporativos, enfocado en resultados tangibles.

---

## Identidad de Marca (Resumen)

### Pilares de Comunicación

Nuestra voz es la de un **Experto de Confianza** que no necesita usar palabras complicadas para demostrar su valía.

| Aspecto | SÍ somos... | NO somos... |
| :

### Valores Críticos

(El Código HecTech)

| Valor | Definición | Aplicación Práctica |
|
---

## Infraestructura y Arquitectura

# Arquitectura HecTechAi (The AAA Stack)

Este documento centraliza la infraestructura técnica de la agencia, basada en el modelo "The AAA Stack".

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
4. **Cierre**: Tras la reunión, al mover la tarjeta a "Vendido" en Notion → n8n envía el enlace de pago por **Stripe**, donde se aceptan los términos legales.
5. **Onboarding**: En cuanto se confirma la firma y el pago → n8n crea automáticamente la estructura en **Google Drive** y el espacio de trabajo personalizado en **Notion** para el cliente.
6. **Mantenimiento**: n8n monitoriza las automatizaciones del cliente; si algo falla, el sistema de errores notifica automáticamente en el panel de control de **Notion**.

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

---

## Flujos de Trabajo de la Agencia

# Automatizaciones de n8n (Agencia)

Este documento resume los flujos de trabajo configurados para la operativa interna de HecTechAi. Los archivos fuente se encuentran en la carpeta `Automatizaciones para la propia agencia`.

## 📂 Inventario de Flujos

### 1. Formulario web a Borrador Gmail (Captación + Investigación)

- **Función:** Recibe leads desde la web, activa un **Agente de IA Investigador** (usando SerpAPI) para analizar la empresa del lead, y genera un borrador de email altamente personalizado.
- **Lógica IA:** Clasifica el lead como VIP, BUENO o REGULAR según el dominio y la relevancia del negocio para HecTechAi.
- **Archivo:** [Formulario web a Borrador Gmail (1).json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/Formulario%20web%20a%20Borrador%20Gmail%20(1).json)

### 2. Radar de Leads 2.0 (Prospección Avanzada)

- **Función:** Evolución del buscador original. No solo busca emails, sino que investiga la presencia en **Instagram, Facebook y LinkedIn**. Además, escanea el código web del lead para detectar si ya tiene un **Chatbot** o si está invirtiendo en **Publicidad (Ads)**.
- **Señales de Venta:** Clasifica a los leads con "Deuda Técnica" (gente que gasta en publicidad pero no tiene automatización de captura).
- **Archivo:** [HecTechAi - Radar de Leads 2.0.json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/HecTechAi%20-%20Radar%20de%20Leads%202.0.json)

### 3. Generador de Propuestas VIP (PDF)

- **Función:** Genera un PDF profesional con el análisis visual, presupuesto personalizado y un **Mockup de rediseño (Espejo IA)** generado mediante IA generativa de imágenes.
- **Archivo:** [HecTechAi - Propuestas VIP.json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/HecTechAi%20-%20Propuestas%20VIP.json)

### 4. Generador de Borradores de Venta

- **Función:** Utiliza LLMs para redactar propuestas personalizadas basadas en la información del lead.
- **Archivo:** [HecTechAi - Generador de Borradores de Venta.json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/HecTechAi%20-%20Generador%20de%20Borradores%20de%20Venta.json)

### 4. Crear proyectos de clientes

- **Función:** Flujo de onboarding que provisiona la estructura en Notion y Drive una vez ganado el cliente.
- **Archivo:** [Crear proyectos de clientes.json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/Crear%20proyectos%20de%20clientes.json)

### 5. Central de Errores (Monitorización Universal)

- **Función:** Monitor universal que detecta fallos en los nodos de n8n y envía alertas inmediatas vía Email y Telegram con detalles del error en tiempo real.
- **Archivo:** [HecTechAi - Central de Errores (Email + Telegram).json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/HecTechAi%20-%20Central%20de%20Errores%20(Email%20+%20Telegram).json)

### 6. Informe Mensual Automatización

- **Función:** Genera estadísticas de ahorro de tiempo y el **ROI estimado** para el cliente activo.
- **Archivo:** [HecTechAi - Informe Mensual Automatización.json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/HecTechAi%20-%20Informe%20Mensual%20Automatización.json)

---

## Páginas y UI (Principales)

### Propuesta de Valor Extraída del Código

- **Misión:** Democratizar la IA para negocios locales, eliminando el "trabajo aburrido".
- **Nicho:** Clínicas, Inmobiliarias, E-commerce, Restaurantes.
- **Diferenciadores:**
  - Respuesta instantánea 24/7.
  - Reducción de costes operativos hasta el 70%.
  - Dashboards de impacto real (ROI).
  - Auditoría IA personalizada en tiempo real.

---

## ⚡ Resumen de Automatizaciones Críticas (n8n)

1. **Lead Qualification:** Clasifica leads en VIP, BUENO o REGULAR mediante IA y SerpAPI.
2. **Auto-Propuesta:** Genera borradores de email personalizados basados en el "score" del lead.
3. **Onboarding:** Estructura automática en Drive y Notion tras el cierre de venta.
4. **Radar de Leads:** Prospección activa analizando deudas técnicas (falta de chatbots o ads sin captura).
