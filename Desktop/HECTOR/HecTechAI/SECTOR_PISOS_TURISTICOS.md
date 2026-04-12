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
