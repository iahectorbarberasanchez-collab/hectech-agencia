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
