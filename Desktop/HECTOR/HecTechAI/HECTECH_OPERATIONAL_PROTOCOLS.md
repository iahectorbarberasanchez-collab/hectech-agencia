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

## 4. Control de Calidad ("Quality Gate")

* **Definición:** Es el check mental obligatorio que debes hacer antes de dar por buena cualquier idea o automatización. Si no cumple estos 3 puntos, NO sirve:
    1. **ROI Claro:** ¿Ahorra tiempo real o genera dinero? (No automatizamos por capricho).
    2. **Robustez:** ¿Qué pasa si falla la API? (Debe tener manejo de errores).
    3. **Visibilidad:** ¿El cliente verá el resultado en su Dashboard? (Si no lo ve, no lo valora).

---
*Manual generado para el Notebook de HecTech*
