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
