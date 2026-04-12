# ⚖️ HecTechAi: Posicionamiento Legal y Seguridad de Datos

Este documento define cómo manejamos la legalidad y la seguridad, para que el Gem pueda asesorar a Héctor y a los clientes con rigor.

## 1. Seguridad de la Infraestructura (The AAA Stack)

* **Supabase:** Base de datos relacional (PostgreSQL). Los datos se almacenan físicamente en la región de la UE (**Irlanda/Bélgica**) para cumplimiento estricto del RGPD. Implementamos aislamiento de datos a nivel de fila (RLS) y cifrado AES-256.
* **n8n (Orquestador):** Procesamiento de datos en contenedores Docker seguros. No hay persistencia de datos sensibles en los nodos de n8n más allá del tiempo de ejecución (transimisión segura).
* **Vercel:** Hosting de la capa de presentación con protección DDoS y certificados SSL/TLS automáticos.

## 2. Propiedad Intelectual (IP)

* **Activos de Agencia:** Los "Motores de Automatización" (prompts maestros, lógica de n8n orquestada y flujos de onboarding) son propiedad intelectual de HecTechAi.
* **Licencia de Cliente:** Al contratar, el cliente adquiere una **Licencia de Uso No Exclusiva** mientras mantenga el servicio activo. Los datos introducidos y procesados son 100% propiedad del cliente.

## 3. Limitación de Responsabilidad (IA Guardrails)

* **Fallo Lógico:** La IA puede cometer errores (alucinaciones). HecTechAi utiliza sistemas de validación dual (ej. un modelo revisa lo que otro escribe) para minimizar riesgos, pero la supervisión final es responsabilidad del cliente.
* **Terceros:** No nos responsabilizamos de caídas en APIs de terceros (OpenAI, Google, Anthropic). El uptime depende de dichos proveedores externos.
* **Límite Económico:** Responsabilidad limitada a los últimos 3 meses facturados.
* **Jurisdicción:** Valencia, España.

## 4. Protección de Datos (RGPD)

* **Ubicación de Servidores:** Confirmada en zona europea (Irlanda).
* **Flujos de Consentimiento:** Integrados en la landing y los checkouts de Stripe.
* **Derecho al Olvido:** Protocolo automatizado en n8n para purga de datos bajo demanda.

---
Para detalles técnicos profundos de blindaje, consultar el [Manual HecTech Shield](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/HECTECH_LEGAL_SHIELD.md).
