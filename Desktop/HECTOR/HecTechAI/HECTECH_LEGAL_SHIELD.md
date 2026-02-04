# 🛡️ HecTech Shield: Manual de Blindaje Legal

Este documento es la referencia definitiva sobre cómo HecTechAi protege al negocio y a sus clientes. Está diseñado para que Héctor tenga una respuesta clara ante cualquier duda legal y para garantizar que la agencia opera bajo los más altos estándares de seguridad y legalidad.

## 1. Protección contra Responsabilidad de la IA
>
> [!IMPORTANT]
> La IA es probabilística, no determinista. Este es nuestro principal escudo legal.

- **Cláusula de "IA Experimental":** Todos nuestros contratos y T&C especifican que los modelos de lenguaje (LLMs) pueden generar "alucinaciones".
- **Responsabilidad del Cliente:** El cliente es el "humano al mando" (human-in-the-loop). La agencia entrega la herramienta, pero la supervisión final de lo que el bot dice o hace es responsabilidad del cliente.
- **Guardrails:** Implementamos filtros de prompts y validaciones técnicas para minimizar riesgos, pero no garantizamos el 100% de precisión.

## 2. Automatización Legal: El "Escudo en el Onboarding"
>
> [!TIP]
> La legalidad no es un freno, es un acelerador de confianza si se automatiza.

- **Generación Automática de Contratos:** Integrado en el flujo `Onboarding V3`. Al detectar el pago en Stripe, n8n genera un PDF dinámico con los datos fiscales del cliente, términos del servicio y cláusulas de confidencialidad.
- **Firma Digital:** Vinculado con herramientas de firma electrónica para garantizar la validez legal del acuerdo antes de iniciar el desarrollo técnico.

## 3. Protección de Datos y RGPD (Privacy by Design)

Nuestra arquitectura está blindada para cumplir con el marco legal europeo:

- **Almacenamiento en la UE:** Los datos de Supabase se hospedan en servidores de **Francia o Bélgica** (cumpliendo estrictamente con la localización de datos dentro de la UE para evitar transferencias internacionales no seguras).
- **Cifrado de Grado Bancario:** Datos cifrados en reposo (AES-256) y en tránsito (TLS/SSL).
- **Derecho al Olvido:** Tenemos flujos en n8n preparados para borrar registros de Supabase de forma inmediata si un usuario lo solicita.
- **Audit Trail:** Cada consentimiento en la web queda registrado con Timestamp e IP para prueba legal.

## 3. Propiedad Intelectual (IP)

Definimos claramente qué es tuyo y qué recibe el cliente:

- **Licencia de Uso:** El cliente paga por el derecho a USAR el flujo y la automatización. No adquiere la propiedad intelectual de la lógica base de n8n o el código fuente de la agencia.
- **Activos Propios:** El "Radar de Leads", "Onboarding V3" y todos nuestros prompts maestros son propiedad exclusiva de HecTechAi.
- **Portabilidad:** Si el cliente deja de pagar el mantenimiento, pierde el acceso a la infraestructura hospedada por la agencia.

## 4. Seguridad Financiera y Dependencia de Terceros

- **Modelo 50/50:** No se toca una tecla sin el primer 50%. No se activa en producción sin el segundo 50%.
- **Suspensión por Impago:** La suscripción de Stripe es la "llave de paso". Si Stripe marca impago, n8n desactiva automáticamente los Webhooks.
- **Dependencia de Terceros:** No nos responsabilizamos de caídas en APIs externas (OpenAI, Google, etc.). El uptime está sujeto a su disponibilidad técnica.

## 5. Limitaciones Económicas y Jurisdicción

- **Tope de Responsabilidad:** En todos los contratos establecemos un límite de indemnización equivalente a las últimas tres mensualidades pagadas.
- **Fuero Legal:** Todos los acuerdos se someten exclusivamente a los tribunales de **Valencia, España**.

## 6. Resumen para Comunicación con Clientes

Si un cliente pregunta por seguridad:

1. "Tus datos nunca salen de la Unión Europea (RGPD)."
2. "Usamos cifrado AES-256, el mismo estándar que los bancos."
3. "Tú eres el propietario de tus datos; nosotros solo ponemos los motores para procesarlos."

---
*Documento de blindaje legal para uso interno y soporte del Gem.*
