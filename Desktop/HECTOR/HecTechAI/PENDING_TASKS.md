# 📋 Lista de Tareas Pendientes: HecTechAi

Este documento centraliza las acciones necesarias para completar la infraestructura de la agencia y los próximos pasos estratégicos.

## 🔴 Prioridad Alta (Infraestructura Crítica)

- [x] **Migración a n8n VPS (Hosting Propio):**
  - Contratar VPS (Hetzner o DigitalOcean).
  - Configurar DNS en Cloudflare (Apuntar `n8n.hectechai.com` al VPS - **Proxied**).
  - Instalar Docker y desplegar n8n mediante Docker-Compose.
  - Importar los workflows y configurar la **Public API**.
- [x] **Desplegar Web de la Agencia:**
  - Configurar dominio `hectechai.com` en Vercel.
  - Vincular DNS en Cloudflare con SSL Full.

- [x] **Configurar Cuenta de Stripe:**
  - Crear cuenta business.
  - Configurar productos/servicios (Setup Fee, Retainers).
  - Ver guía: [guia_finanzas_legal.md](file:///C:/Users/ester/.gemini/antigravity/brain/434c8f8b-39fd-44b3-a711-c12fe9fcfd88/guia_finanzas_legal.md)
- [ ] **Configurar Términos en Stripe:**
  - Crear cuenta.
  - Redactar Términos y Condiciones en página web (/terms) para enlazar en Stripe.
  - Activar "Consentimiento de términos" en el Checkout de Stripe.
- [x] **Integración Financiera/Legal en n8n:**
  - [x] Importar flujo Cost-Free: [HecTechAi - Cost-Free Client Onboarding.json](file:///c:/Users/ester/Desktop/HECTOR/HecTechAI/Automatizaciones%20para%20la%20propia%20agencia/HecTechAi%20-%20Cost-Free%20Client%20Onboarding.json)
  - [x] Vincular credenciales de Stripe (Producción).
  - [x] Webhook de Stripe implementado en la web.

## 🟡 Prioridad Media (Optimización)

- [ ] **Revisar Copywriting de la Web:** Asegurar que el tono "Noir-Cyber" se mantiene consistente en todas las secciones.
- [ ] **Test de Estrés de la Central de Errores:** Simular fallos para asegurar que las notificaciones de Telegram/Email llegan correctamente.
- [ ] **Vincular Documentación a Gemini Gem:** Asegurarse de que el Gem tiene la versión más reciente de todos los archivos `.md`.

## 🟢 Prioridad Baja (Crecimiento & Marketing)

- [ ] **Estrategia de Instagram:** Crear las primeras 3 publicaciones basadas en el análisis de identidad.
- [ ] **Video Demo de la Auditoría IA:** Grabar la pantalla usando la herramienta para mostrar el valor real a los leads.

---
Última actualización: 25/01/2026
