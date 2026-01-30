# Sync Script for NotebookLM
$SCRIPT_DIR = $PSScriptRoot
$ROOT_DIR = (Get-Item $SCRIPT_DIR).Parent.FullName
$TARGET_DIR = New-Item -ItemType Directory -Force -Path (Join-Path $ROOT_DIR "NOTEBOOK_LM_SYNC")

Write-Host "🚀 Iniciando sincronización para NotebookLM..." -ForegroundColor Cyan

# 1. Generar conocimiento actualizado
Write-Host "📦 Generando archivos de conocimiento..."
# Cambiamos al directorio raíz para ejecutar node correctamente
Push-Location $ROOT_DIR
node scripts/generate_gem_knowledge.js
Pop-Location

# 2. Copiar archivos clave
$FilesToSync = @(
    "HECTECH_AI_BRAIN.md",
    "NOTEBOOK_LM_KNOWLEDGE.md",
    "HECOTECH_STRATEGIC_DNA.md",
    "HECTECH_BRAND_IDENTITY.md",
    "ANTIGRAVITY_NOTEBOOK_BRIDGE.md"
)

foreach ($file in $FilesToSync) {
    $source = Join-Path $ROOT_DIR $file
    if (Test-Path $source) {
        Copy-Item $source $TARGET_DIR -Force
        Write-Host "✅ Sincronizado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Sincronización completada." -ForegroundColor Cyan
Write-Host "📁 Carpeta lista para NotebookLM: $($TARGET_DIR)"
Write-Host "👉 Sube el contenido de esta carpeta a tu notebook de NotebookLM."
