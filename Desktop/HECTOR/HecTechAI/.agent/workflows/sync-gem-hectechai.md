---
description: Sincronizar Gem con la última versión de HecTechAI
---

# Workflow: Mantener Gem Actualizado con HecTechAI

Este workflow asegura que tu instancia de Gem (Antigravity) esté siempre sincronizada con la última versión de tu agencia HecTechAI.

## Pasos del Workflow

### 1. Verificar el estado actual del repositorio

Primero, asegúrate de que no hay cambios sin commitear que puedan perderse:

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI
git status
```

### 2. Guardar cambios locales si es necesario

Si hay cambios sin guardar que quieres conservar:

```bash
git add .
git commit -m "chore: sync local changes before gem update"
```

### 3. Obtener la última versión del repositorio

// turbo

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI
git pull origin main
```

### 4. Verificar archivos críticos actualizados

Revisa que los archivos estratégicos clave estén presentes y actualizados:

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI
ls -la *.md
```

### 5. Actualizar dependencias del proyecto hectech-agency

// turbo

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI\hectech-agency
npm install
```

### 6. Verificar configuración de entorno

Asegúrate de que las variables de entorno estén correctamente configuradas:

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI\hectech-agency
cat .env.local
```

### 7. Ejecutar tests si existen

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI\hectech-agency
npm test
```

### 8. Verificar build del proyecto

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI\hectech-agency
npm run build
```

### 9. Reiniciar servidor de desarrollo

Si tienes un servidor corriendo, reinícialo para aplicar los cambios:

```bash
cd C:\Users\ester\Desktop\HECTOR\HecTechAI\hectech-agency
npm run dev
```

## Archivos Clave a Monitorear

Los siguientes archivos son críticos para el funcionamiento de tu agencia y deben estar siempre actualizados en tu Gem:

### Documentos Estratégicos

- `HECTECH_AI_BRAIN.md` - Cerebro principal de la agencia
- `HECTECH_LEGAL_SHIELD.md` - Manual de blindaje legal (RGPD, IA, IP)
- `HECOTECH_STRATEGIC_DNA.md` - ADN estratégico
- `HECTECH_TECH_STACK_DETAILED.md` - Stack tecnológico
- `HECTECH_OPERATIONAL_PROTOCOLS.md` - Protocolos operacionales
- `HECTECH_FINANCIAL_LOGIC.md` - Lógica financiera
- `HECTECH_BRAND_IDENTITY.md` - Identidad de marca

### Documentos Sectoriales

- `DNA_ESTRATEGICO_CLINICAS.md`
- `DNA_ESTRATEGICO_HOTELES.md`
- `DNA_ESTRATEGICO_PISOS_TURISTICOS.md`
- `SECTOR_INMOBILIARIO.md`
- `SECTOR_PISOS_TURISTICOS.md`
- `SECTOR_RESTAURANTES.md`

### Configuración y Código

- `hectech-agency/` - Aplicación web principal
- `infrastructure/` - Configuración de infraestructura
- `scripts/` - Scripts de automatización
- `WORKFLOWS.md` - Workflows de n8n

## Frecuencia Recomendada

- **Diaria**: Si estás en desarrollo activo
- **Semanal**: Para mantenimiento regular
- **Antes de reuniones importantes**: Para tener la información más actualizada

## Notas Importantes

1. **Backup automático**: Git mantiene un historial completo, pero considera hacer backups adicionales de archivos críticos
2. **Conflictos**: Si hay conflictos durante el `git pull`, resuélvelos manualmente antes de continuar
3. **Variables de entorno**: Nunca commitees archivos `.env.local` con credenciales reales
4. **Notificaciones**: Considera configurar notificaciones de GitHub para saber cuándo hay cambios en el repositorio

## Automatización Futura

Puedes automatizar este workflow usando:

- **GitHub Actions**: Para ejecutar tests automáticamente
- **n8n**: Para sincronizar cambios con otros sistemas
- **Cron jobs**: Para ejecutar este workflow en horarios específicos
