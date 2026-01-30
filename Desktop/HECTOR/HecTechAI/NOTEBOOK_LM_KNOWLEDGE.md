# 📚 HecTechAi Strategic & Technical Knowledge Base

Última actualización: 28/1/2026, 16:59:30

Este documento es el MANIFIESTO ESTRATÉGICO Y TÉCNICO central de HecTechAi sobre HecTechAi. Se ha generado automáticamente para servir de base al Gemini Gem.

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
| :
---

## Stack Tecnológico Detallado

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


---

## Protocolos Operacionales

# 🛠️ HecTechAi: Protocolos de Operación y Resolución (V1)

Este documento sirve como manual de instrucciones para situaciones críticas y protocolos de calidad.

## 1. Protocolo de "Caída de Sistema"

* **Prioridad:** Crítica.
* **Acción:** Si un cliente reporta que un bot no responde, el primer punto de revisión es la **Central de Errores** en n8n.
* **Diagnóstico rápido:**
    1. Revisar credenciales de API (suelen expirar cada 90 días).
    2. Comprobar cuotas de tokens en OpenAI/Vertex AI.
    3. Verificar que el Webhook de la web sigue apuntando a la URL correcta.

## 2. Estándar de Oro de Mensajería

* **Regla de los 3 Párrafos:** Ningún email de prospección inicial debe superar los 3 párrafos.
* **Personalización Obligatoria:** Si el Radar de Leads detecta que no tienen Chatbot, el email DEBE empezar mencionando el coste de oportunidad de no responder en menos de 5 minutos.

## 3. Guía de Precios (Referencia Interna)

* **Auditoría Inicial:** Gratis (Gancho de valor).
* **Implementación Base:** Desde 1.500€ (Setup de n8n + 1 Bot).
* **Mantenimiento (Recurrencia):** 200€-500€/mes según volumen de ejecuciones.

## 4. El "Filtro de Calidad" de Héctor

* Antes de entregar cualquier flujo, hazte estas 3 preguntas:
    1. ¿Sustituye al menos 1 hora de trabajo humano al día?
    2. ¿Es capaz de manejar errores sin romperse?
    3. ¿Los datos se guardan en Supabase o Notion para el Dashboard del cliente?

---
*Manual generado para el Notebook de HecTech*


---

## Lógica Financiera

# 💰 HecTechAi: Estructura Financiera y Modelos de Negocio

Este documento detalla los flujos de dinero, márgenes y políticas de cobro de la agencia.

## 1. Modelos de Ingresos

* **Setup Fee (Implementación):** Cobro único por la creación de la infraestructura (bots, integraciones, CRM).
  * *Rango:* 1.000€ - 5.000€ dependiendo de la complejidad.
* **Mantenimiento Mensual (Retainer):** Asegura que todo siga funcionando y optimiza los prompts.
  * *Rango:* 200€ - 600€/mes.
* **Consultoría Estratégica:** Sesiones 1 a 1 de optimización.
  * *Tarifa:* 150€/hora.

## 2. Estructura de Costes (OPEX)

Para calcular la rentabilidad real, el Gem debe considerar:

* **Infraestructura:** Vercel (Hobby/Pro), Supabase (Free/Pro), Notion.
* **Consumo de IA (Coste Variable):**
  * Vertex AI / Gemini API.
  * Claude API (Anthropic).
  * SerpAPI.
* **Herramientas de Operativa:** n8n (Hosting), Stripe (Comisiones 1.5% - 2.9% + 0.25€).

## 3. Política de Cobros

* **Reserva:** 50% por adelantado para iniciar cualquier proyecto.
* **Entrega:** 50% tras la fase de pruebas y antes del paso a producción.
* **Suscripciones:** Cobro automático vía Stripe el día 1 de cada mes.

## 4. Objetivos y KPIs Financieros

* **LTV (Lifetime Value):** Apuntar a mantener al cliente al menos 12 meses en mantenimiento.
* **Margen Bruto Objetivo:** > 75% (La automatización debe permitirnos escalar sin subir apenas los costes).

---
*Manual financiero para el Gem de HecTechAi.*


---

## Posicionamiento Legal

# ⚖️ HecTechAi: Posicionamiento Legal y Seguridad de Datos

Este documento define cómo manejamos la legalidad y la seguridad, para que el Gem pueda asesorar a Héctor y a los clientes con rigor.

## 1. Seguridad de la Infraestructura (Stack)

* **Supabase:** Los datos se almacenan en servidores de la UE (Irlanda/Bélgica) para cumplir con el RGPD. Usamos cifrado en reposo (AES-256) y en tránsito (TLS).
* **n8n:** Los flujos procesan datos de forma temporal. No almacenamos registros sensibles en los nodos de n8n más allá del tiempo necesario para la ejecución.
* **Vercel:** Hosting seguro con certificaciones de cumplimiento estándar.

## 2. Propiedad Intelectual (IP)

* **Código Propio:** El código de la landing y los flujos base de n8n son propiedad de HecTechAi.
* **Código Entregado:** El cliente recibe licencia de uso de los flujos implementados, pero la lógica base y los conectores son propiedad intelectual de la agencia (modelo SaaS/Agencia).

## 3. Limitación de Responsabilidad (IA)

* Las alucinaciones de la IA son un riesgo conocido. HecTechAi implementa "barreras de seguridad" (guardrails), pero el cliente es responsable de la supervisión final de la información generada por los bots.
* No garantizamos un ROI exacto, sino una mejora en la operativa basada en datos históricos.

## 4. Protección de Datos (RGPD)

* **Audit Trail:** Todas las interacciones de los formularios web quedan registradas en Supabase con fecha y consentimiento.
* **Derecho al olvido:** Protocolo para borrar cualquier lead de Supabase si el cliente lo solicita.

---
*Manual legal para el soporte del Gem de HecTech*


---

## Infraestructura y Arquitectura

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


---

## Flujos de Trabajo de la Agencia

## 🚀 Workflow en Producción (ACTIVO)

Estos son los flujos que están **actualmente desplegados y funcionando** en el servidor VPS.

### 1. Onboarding & Automación de Pagos (Core)

* **Estado:** ✅ ACTIVO
* **Trigger:** webhook Stripe (`checkout.session.completed`).
* **Acción:**
  * Procesa pagos (Inicial/Final).
  * Crea credenciales en Supabase.
  * Gestiona Notion (CRM) y Drive.
  * Envía emails transaccionales.
* **Archivo:** [client_onboarding.json](n8n/client_onboarding.json)

---

## 📂 Librería de Plantillas (Templates)

Estos flujos están disponibles en la carpeta `Automatizaciones para la propia agencia` pero **NO están activos** necesariamente. Son recursos para implementar según necesidad.

* `Formulario web a Borrador Gmail.json`: IA para redactar respuestas a leads.
* `HecTechAi - Radar de Leads 2.0.json`: Scraper de redes sociales.
* `HecTechAi - Propuestas VIP.json`: Generador de PDFs.
* `Crear proyectos de clientes.json`: Versión legacy del onboarding.


---

## DNA Estratégico: Clínicas

# 🏥 DNA Estratégico: Automatización para Clínicas (ClinTech Ai)

Este documento define la base estratégica para la vertical de clínicas de HecTechAi.

## 🟢 Fase 0: Definición

### Nombre del Proyecto

`ClinTech Ai` (o integración dentro de HecTechAi como vertical especializada).

### Problema Core

* **Absentismo (No-shows):** Las citas perdidas cuestan miles de euros al mes.
* **Carga Administrativa:** El personal de recepción pasa el 70% del tiempo en tareas repetitivas (agendar, recordar, gestionar cobros).
* **Pérdida de Leads:** Leads que llegan por redes sociales o web y no son atendidos en menos de 5 minutos, se pierden.
* **Falta de Seguimiento:** Pacientes que no vuelven porque nadie les recordó su revisión anual o post-tratamiento.

### Avatar del Cliente (Nicho)

* **Clínicas Dentales:** Alta recurrencia y necesidad de recordatorios.
* **Clínicas de Estética:** Ciclos de venta largos que requieren nutrición de leads.
* **Fisioterapia y Bienestar:** Necesidad de gestión de agenda eficiente.
* **Clínicas Médicas Especializadas:** Enfoque en la eficiencia administrativa y protocolos pre/post.

### Propuesta Única de Venta (USP)

"Transformamos tu clínica en una operación inteligente 24/7 que capta, cualifica y fideliza pacientes mientras tu equipo se enfoca en la salud. Reducimos los no-shows en un 40% y eliminamos el trabajo administrativo manual."

---

## 🔵 Fase 1: Infraestructura "The AAA Stack" (Propuesta)

* **Web:** Landing page optimizada para conversión con "Agente de Citas IA".
* **Database:** Supabase para histórico de pacientes y leads cualificados.
* **Orquestador:** n8n para conectar la agenda (Google Calendar/Software médico con API) con comunicaciones (WhatsApp/Email).
* **CRM:** Notion para el control administrativo de la agencia sobre los clientes (clínicas).

---

## 🟠 Fase 2: El Motor de Crecimiento (Captación)

1. **Lead Magnet IA:** "Auditoría de Eficiencia Clínica" o "Calculadora de Pérdida por No-Shows".
2. **Radar de Pacientes:** n8n buscando personas preguntando por tratamientos específicos en zonas geográficas concretas.
3. **Chatbot de Cualificación:** Filtra por tratamiento, presupuesto y urgencia antes de pasar el lead a la clínica.

---

## 🔴 Fase 3: Operaciones "Zero Touch"

* **Recordatorios Inteligentes:** No solo envían la hora, sino que procesan cancelaciones y ofrecen el hueco a otros automáticamente.
* **Onboarding Digital:** Captura de datos médicos iniciales vía formulario web seguro.
* **Seguimiento Post:** Automatización de encuestas de satisfacción y check-in de bienestar.


---

## DNA Estratégico: Hoteles

# 🏨 DNA Estratégico: Automatizaciones para Hoteles (HecTechAi)

Este documento detalla la estrategia de automatización de HecTechAi para el sector hotelero, diseñada para maximizar el RevPAR (Revenue Per Available Room), optimizar la eficiencia operativa y elevar la experiencia del huésped.

## 1. Pre-estancia y Reservas (Conversión Máxima)

* **Concierge de Reservas IA (24/7):** Agente inteligente en la web y canales de mensajería (WhatsApp/Instagram) que resuelve dudas sobre servicios, tipos de habitación y disponibilidad en tiempo real, cerrando reservas directas sin comisiones de OTAs.
* **Upselling Automatizado:** Tras la confirmación de la reserva, el sistema envía una propuesta personalizada de mejoras (check-in temprano, upgrade de habitación, cena romántica) basada en el perfil del cliente.
* **Recuperación de Carritos Abandonados:** Seguimiento automático por correo o WhatsApp para usuarios que iniciaron el proceso de reserva en la web pero no lo finalizaron, ofreciendo un incentivo puntual.

## 2. Check-in y Acceso (Fricción Cero)

* **Check-in Digital Express:** Envío automático de un enlace 24h antes de la llegada para realizar el escaneo de documentos (OCR), firma de la ficha de policía y pago, eliminando colas en recepción.
* **Llave Digital Inteligente:** Integración con sistemas de cerraduras inteligentes para enviar la llave al móvil del huésped (Wallet/App/Link) automáticamente tras completar el check-in digital.
* **Bienvenida Personalizada:** Notificación automática al personal de recepción cuando un huésped VIP completa su check-in digital para preparar una atención especial a su llegada.

## 3. Durante la Estancia (Experiencia 5 Estrellas)

* **Asistente Vitalicio (WhatsApp/QR):** Un asistente de IA disponible vía QR en la habitación que gestiona pedidos de room service, reservas en el spa o restaurante, y resuelve dudas sobre el funcionamiento del hotel.
* **Reporte de Incidencias Instantáneo:** El huésped puede reportar fallos (aire acondicionado, falta de toallas) por chat. La IA clasifica y envía el ticket directamente al equipo de mantenimiento o limpieza vía Slack/n8n.
* **Guía de Destino Dinámica:** Recomendaciones personalizadas de actividades y restaurantes locales enviadas al móvil del huésped según sus intereses detectados durante la charla con el asistente IA.

## 4. Post-estancia y Fidelización (Repetición)

* **Gestión Reputacional Proactiva:** Envío automático de una encuesta de satisfacción al hacer el check-out. Si la valoración es alta, se invita a dejar reseña en TripAdvisor/Google; si es baja, se escala a dirección para resolución inmediata.
* **Programas de Fidelización "Always-On":** Inclusión automática del huésped en el CRM con segmentación por preferencias para campañas de email marketing personalizadas (ofertas de aniversario de estancia, descuentos por temporada).
* **Análisis de Sentimiento:** Procesamiento con IA de todas las reseñas y feedbacks recibidos para generar un panel de control mensual con puntos de mejora detectados.

## 5. Operaciones y Backoffice (Eficiencia Rentable)

* **Optimización de Limpieza (Housekeeping):** Sistema que asigna prioridades de limpieza en tiempo real basándose en las salidas confirmadas y las llegadas previstas para optimizar los turnos del equipo.
* **Revenue Management Semi-Automático:** Alertas de cambios en la demanda local (eventos, clima) que sugieren ajustes de precios al equipo de Revenue, integrando datos de competidores.
* **Automatización de Facturación:** Generación y envío automático de facturas al correo del huésped o de la empresa tras el check-out, sincronizado con el software contable.

---
*Propuesta de HecTechAi - Elevando la hospitalidad con inteligencia artificial.*


---

## DNA Estratégico: Pisos Turísticos

# 🏘️ DNA Estratégico: Automatizaciones para Pisos Turísticos (HecTechAi)

Este documento detalla la estrategia de automatización de HecTechAi para el sector de los alquileres vacacionales, enfocada en tres pilares: **Ahorro de Tiempo Operativo**, **Seguridad del Inmueble** y **Experiencia Superior del Huésped**.

## 1. Captación y Reservas (Maximización de Ingresos)

* **Sincronización Inteligente de Canales:** Integración absoluta entre Airbnb, Booking.com y Expedia mediante un Channel Manager automatizado para evitar el temido *overbooking*.
* **Acompañante de Venta 24/7 (AI Booking Bot):** Un bot que responde en segundos cualquier duda de un potencial huésped ("¿tienes cuna?", "¿hay parking?") en cualquier idioma, cerrando la reserva mientras duermes.
* **Revenue Management Dinámico:** Ajuste automático de precios basado en eventos locales, clima y demanda de la zona, asegurando que el piso nunca esté barato cuando hay alta demanda, ni vacío cuando hay baja.

## 2. Acceso y Cumplimiento Legal (Fricción Cero)

* **Check-in Digital y OCR:** El huésped sube su documento de identidad días antes de llegar. La IA extrae los datos automáticamente y los envía a las autoridades correspondientes (Policía/Guardia Civil) sin intervención manual.
* **Cerraduras Inteligentes (Self Check-in):** Generación automática de códigos temporales únicos para cada huésped. El código se activa a la hora del check-in y expira al check-out, garantizando seguridad total.
* **Firma de Contrato Automática:** Envío del contrato de arrendamiento de temporada para firma digital legal nada más confirmarse la reserva.

## 3. Operaciones y Mantenimiento (Eficiencia Extrema)

* **Logística de Limpieza Automatizada:** En cuanto se confirma una reserva o se hace un check-out, el sistema notifica al equipo de limpieza, asigna el turno y envía una lista de tareas (check-list móvil) con fotos de "cómo debe quedar".
* **Sensores de Ruido y Presencia:** Alertas automáticas al propietario si el nivel de decibelios supera lo permitido o si hay más personas de las permitidas (respetando la privacidad, sin cámaras).
* **Control Energético Inteligente:** Sensores que apagan el aire acondicionado o la calefacción cuando las ventanas están abiertas o cuando el piso detecta que está vacío por más de 1 hora.

## 4. Experiencia del Huésped (Upselling y Reviews)

* **Guestbook Digital Personalizado (QR):** Una guía interactiva en la vivienda con videos sobre cómo usar el microondas, contraseña del Wi-Fi y recomendaciones locales del "dueño" (vía IA).
* **Conserje de Experiencias:** La IA sugiere y gestiona reservas de tours, traslados al aeropuerto o desayunos a domicilio, generando ingresos extra para el propietario (comisiones).
* **Sistema de Reseñas de 5 Estrellas:** Envío automático de recordatorios por WhatsApp el día del check-out. Si la experiencia fue positiva, se facilita el link de reseña; si hubo problemas, se avisa al gestor inmediatamente para compensar antes de que publiquen.

## 5. Gestión de Incidencias (Backoffice)

* **Ticketing de Averías:** El huésped puede reportar un grifo que gotea enviando una foto por WhatsApp. La IA clasifica la urgencia y avisa al técnico de guardia.
* **Reporte Mensual de Rendimiento:** Un informe automático que llega al propietario con ingresos netos, ahorro de suministros (energía) y score de satisfacción del huésped.

---
*Propuesta de HecTechAi - Digitalizando el descanso, automatizando el éxito.*


---

## Soluciones: Sector Inmobiliario

# 🏠 Automatizaciones para Inmobiliarias (HecTechAi)

Este documento detalla las automatizaciones estratégicas que HecTechAi implementa para transformar agencias inmobiliarias tradicionales en máquinas de alta eficiencia.

## 1. Captación y Cualificación Instantánea (Lead Gen & Qualification)

* **AI Real Estate Agent (24/7):** Un agente de IA en WhatsApp/Instagram/Web que responde dudas sobre propiedades al instante, pide los datos del lead y lo pre-cualifica (presupuesto, zona, urgencia).
* **Omnicanalidad Centralizada:** Unificación de leads de Idealista, Fotocasa, Habitaclia y Web en un solo CRM (Notion/Supabase/HubSpot) con notificación instantánea al equipo de ventas.

## 2. Gestión de Visitas y Agenda (Booking)

* **Auto-Agendamiento de Visitas:** Una vez cualificado el lead, el sistema envía un enlace de agendamiento sincronizado con el calendario del agente para cerrar la visita sin llamadas cruzadas.
* **Recordatorios Automáticos:** Campañas de SMS y WhatsApp 24h y 1h antes de la visita para reducir los "no-shows".
* **Feedback Post-Visita:** Envío automático de un mini-formulario tras la visita. Si el feedback es positivo, se escala al agente para cierre; si es negativo, se guarda para el informe al propietario.

## 3. Seguimiento Inteligente (Nurturing)

* **Alertas de Match Automático:** Si entra una propiedad que encaja con los criterios de un lead en base de datos, el sistema le envía un WhatsApp personalizado: "Hola [Nombre], acaba de entrar una vivienda en [Zona] que cumple tus criterios. ¿Te envío el dossier?".
* **Nurturing de Propietarios:** Secuencia automática de contenido de valor (datos de mercado, consejos de venta) para leads que están considerando vender (captación).

## 4. Backoffice y Gestión Documental

* **Generación de Contratos Automática:** Rellenado automático de contratos de reserva o arras usando los datos del lead y de la propiedad, integrando firma digital (SignNow/DocuSign).
* **Gestión de KYC (Anti-Blanqueo):** Extracción automática de datos de DNI/NIE de clientes mediante IA para completar fichas de cumplimiento legal.

## 5. Marketing y Reportes

* **Social Media Automator:** Al marcar una propiedad como "Activa" en el CRM, la IA genera los copys y publica automáticamente el anuncio en las redes sociales de la inmobiliaria.
* **Informes para Propietarios:** Envío semanal automático de un reporte al propietario con métricas de clics en portales, número de visitas y resumen del feedback recibido.

---
*Propuesta de HecTechAi - Transformando el ladrillo con silicio.*


---

## Soluciones: Sector Restaurantes

# 🍴 Automatizaciones para Restaurantes (HecTechAi)

Este documento detalla las automatizaciones estratégicas que HecTechAi implementa para transformar restaurantes convencionales en negocios inteligentes, eficientes y altamente rentables.

## 1. Reservas y Atención al Cliente (Front Office)

* **Agente de Reservas AI (Voz y Chat):** Un sistema que contesta el teléfono y mensajes (WhatsApp/Instagram) 24/7. Gestiona reservas, confirma disponibilidad en tiempo real y responde preguntas frecuentes (opciones veganas, parking, alérgenos).
* **Gestión de Llamadas Perdidas:** Si el personal no puede atender el teléfono durante el servicio, la IA envía automáticamente un WhatsApp al cliente: "Hola, no hemos podido atenderte. ¿Quieres que te ayude a reservar mesa o ver nuestra carta?".
* **Confirmación y Recordatorios:** Automatización de mensajes de confirmación 24h/2h antes de la reserva para reducir el "No-Show". Si el cliente cancela, el sistema libera la mesa automáticamente.

## 2. Operaciones y Eficiencia (Back Office)

* **Inventario Predictivo e Inteligente:** Conexión del TPV (POS) con el inventario. La IA analiza patrones de ventas y previsiones meteorológicas/eventos para generar alertas de stock y sugerir pedidos a proveedores automáticamente.
* **Digitalización de Facturas y Albaranes:** Extracción automática de datos de facturas de proveedores mediante OCR/IA, alimentando el sistema contable y actualizando precios de coste sin intervención manual.
* **Escandallos Dinámicos:** Seguimiento automático del margen de beneficio de cada plato en función de las fluctuaciones de precio de la materia prima.

## 3. Marketing, Reputación y Fidelización (Growth)

* **Gestión de Reseñas AI:** Respuesta automatizada y personalizada a todas las reseñas de Google Maps y TripAdvisor. La IA detecta el sentimiento: agradece las positivas y escala las negativas al gerente con un borrador de respuesta empático.
* **Fidelización "Post-Dining":** Envío automático de un cupón de descuento o invitación a un postre 3 días después de la visita si el cliente tuvo una buena experiencia, incentivando la recurrencia.
* **Wi-Fi Marketing:** Acceso al Wi-Fi del local a cambio de registro (email/teléfono), alimentando la base de datos de leads para campañas de email marketing segmentadas.

## 4. Experiencia en Sala (CX)

* **Menús QR Dinámicos:** Menús que cambian automáticamente según la hora del día, el stock disponible (ocultando platos agotados en tiempo real) o el perfil del cliente.
* **Sistemas de Feedback Instantáneo:** Breve encuesta vía QR al pagar. Si la valoración es baja, se notifica instantáneamente al encargado para que pueda hablar con el cliente antes de que abandone el local y evitar una reseña negativa.

## 5. Recursos Humanos y Staff

* **Cuadrantes Inteligentes:** Generación automática de turnos optimizados según la previsión de ocupación histórica y eventos locales, reduciendo costes de exceso de personal.
* **Onboarding de Personal Automatizado:** Repositorio con vídeos y protocolos de servicio que se envían automáticamente a los nuevos empleados vía WhatsApp para acelerar su formación.

---
*Propuesta de HecTechAi - Digitalizando la hospitalidad plato a plato.*


---

## Soluciones: Sector Pisos Turísticos

# 🗝️ Casos de Uso: Automatizaciones para Pisos Turísticos (HecTechAi)

Este documento detalla los flujos de trabajo técnicos y prácticos para implementar en propiedades de alquiler vacacional.

## A. El Flujo del "Check-in Invisible"

* **Disparador:** Nueva reserva confirmada en n8n (vía webhook del PMS o Channel Manager).
* **Acciones:**
    1. Crea una fila en **Supabase** con los datos del huésped.
    2. Envía **WhatsApp de Bienvenida** automático con link al formulario de Check-in.
    3. **IA OCR:** Procesa el DNI/Pasaporte subido por el huésped y rellena el parte de entrada.
    4. **Firma Digital:** Envía el contrato de alquiler vacacional para su firma.

## B. La "Limpieza Inteligente"

* **Disparador:** Check-out detectado (o hora de salida alcanzada).
* **Acciones:**
    1. Notificación automática a **Telegram/Slack** del grupo de limpiadores.
    2. Generación de **Tarea en Notion** con la fecha límite y requisitos especiales (ej: "Lavar edredones este turno").
    3. Confirmación de limpieza: El limpiador sube una foto final y la IA valida que "todo está en su sitio" antes de marcar como listo para el siguiente huésped.

## C. Control de Suministros (Energy Saver)

* **Disparador:** Sensores de movimiento/puerta (Zigbee/Matter) integrados con n8n.
* **Acciones:**
    1. Si no hay movimiento durante 30 min y el AC está encendido → Envía comando a **Tado/Netatmo** para ajustar temperatura a modo ahorro.
    2. Si una ventana se abre por más de 5 min → Apaga el AC y envía mensaje de cortesía al huésped: "Detectamos una ventana abierta, hemos pausado el AC para cuidar el planeta 🌿".

## D. Generador de Reseñas Positivas

* **Disparador:** Check-out finalizado + 2 horas.
* **Acciones:**
    1. La IA analiza el historial de chats con el huésped.
    2. Si no hubo quejas → Envía mensaje: "¡Gracias por cuidarnos, [Nombre]! ¿Nos ayudas con una reseña en Airbnb?".
    3. Si hubo una avería reportada → Envía mensaje: "Sentimos los inconvenientes con el AC. Esperamos que el resto de tu estancia fuera de 10. ¡Vuelve pronto!".

---
*Propuesta de HecTechAi - Automatizando casas, creando hogares.*


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
3. **Onboarding & Pagos:** Stripe Trigger → n8n → Supabase (Credenciales) + Notion (CRM) + Drive (Carpetas) + Gmail (Bienvenida/Lanzamiento).
4. **Radar de Leads:** Prospección activa analizando deudas técnicas (falta de chatbots o ads sin captura).

## 💡 Instrucciones para NotebookLM
1. Usa este documento para entender la arquitectura técnica.
2. Cruza esta información con los documentos de marca para proponer estrategias de venta coherentes.
3. Si detectas fallos técnicos, sugiere revisiones basadas en el Mapa de Departamentos.