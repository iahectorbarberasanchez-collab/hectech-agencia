---
description: Actualizar el 'Cerebro' de HecTechAI para que el Gem lo lea desde Drive
---

# Workflow: Actualizar Contexto del Gem (Drive Sync)

Este workflow regenera los archivos maestros de conocimiento (`HECTECH_AI_BRAIN.md`) y el mapa de arquitectura. Al ejecutarse, Drive Desktop detectará los cambios y tu Gem tendrá la información más reciente al instante.

## Pasos

### 1. Regenerar el Cerebro y Mapa de Archivos

// turbo-all
Este paso ejecuta el script de generación que compila estrategia, código y estructura.

```powershell
# Regenerar el archivo unificado de conocimiento
node scripts/generate_gem_knowledge.js

# Generar un árbol de archivos actualizado para que el Gem sepa dónde está todo
Get-ChildItem -Recurse -Path hectech-agency/src -Include *.ts,*.tsx,*.css,*.md -Exclude node_modules | Where-Object { $_.FullName -notmatch 'node_modules' } | Select-Object -ExpandProperty FullName | ForEach-Object { $_.Replace("C:\Users\ester\Desktop\HECTOR\HecTechAI\", "") } > PROJECT_FILE_MAP.txt
```

### 2. Confirmación

El archivo `HECTECH_AI_BRAIN.md` y `PROJECT_FILE_MAP.txt` han sido actualizados.
Drive Desktop debería estar sincronizándolos ahora mismo (busca el icono de check verde ✅ en los archivos).

**Tiempo estimado de sincronización:** 5-10 segundos.
