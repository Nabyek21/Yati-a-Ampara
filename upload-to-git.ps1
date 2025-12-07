# ============================================================================
# 📤 SCRIPT: Subir Proyecto a Git
# ============================================================================
# Este script prepara y sube todos los cambios a GitHub
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📤 SUBIENDO PROYECTO A GIT (GitHub)              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. VERIFICAR QUE ESTAMOS EN GIT
# ============================================================================
Write-Host "1️⃣  Verificando repositorio Git..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Este no es un repositorio Git" -ForegroundColor Red
    exit 1
}

git status > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: No se puede acceder al repositorio Git" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repositorio Git detectado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 2. MOSTRAR ESTADO
# ============================================================================
Write-Host "2️⃣  Estado Actual:" -ForegroundColor Yellow

$status = git status --porcelain
$modifiedCount = ($status -split "`n" | Where-Object { $_ -match '^ M' } | Measure-Object).Count
$untrackedCount = ($status -split "`n" | Where-Object { $_ -match '^\?\?' } | Measure-Object).Count
$deletedCount = ($status -split "`n" | Where-Object { $_ -match '^ D' } | Measure-Object).Count

Write-Host "  📝 Archivos modificados: $modifiedCount"
Write-Host "  🆕 Archivos nuevos: $untrackedCount"
Write-Host "  🗑️  Archivos eliminados: $deletedCount"
Write-Host ""

# ============================================================================
# 3. VERIFICAR QUE HAYA CAMBIOS
# ============================================================================
if ($modifiedCount -eq 0 -and $untrackedCount -eq 0 -and $deletedCount -eq 0) {
    Write-Host "⚠️  No hay cambios para subir" -ForegroundColor Yellow
    Write-Host "✅ Todo está al día" -ForegroundColor Green
    exit 0
}

# ============================================================================
# 4. AGREGAR CAMBIOS
# ============================================================================
Write-Host "3️⃣  Agregando cambios..." -ForegroundColor Yellow

git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al agregar cambios" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cambios agregados" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 5. MOSTRAR RESUMEN DE LO QUE SE VA A COMMITEAR
# ============================================================================
Write-Host "4️⃣  Resumen de cambios a commitear:" -ForegroundColor Yellow

git diff --cached --name-only | ForEach-Object {
    $status = (git diff --cached --name-status -- $_) -split "`t" | Select-Object -First 1
    $file = (git diff --cached --name-status -- $_) -split "`t" | Select-Object -Last 1
    
    switch ($status) {
        "M" { Write-Host "  ✏️  MODIFICADO: $_" -ForegroundColor Cyan }
        "A" { Write-Host "  🆕 NUEVO:      $_" -ForegroundColor Green }
        "D" { Write-Host "  🗑️  ELIMINADO:  $_" -ForegroundColor Red }
        default { Write-Host "  ❓ $_" }
    }
}

Write-Host ""

# ============================================================================
# 6. PEDIR DESCRIPCIÓN DEL COMMIT
# ============================================================================
Write-Host "5️⃣  Descripción del commit:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ingresa un mensaje descriptivo (presiona Enter 2 veces cuando termines):" -ForegroundColor Gray
Write-Host "Ejemplo: 'Agregar sistema de pesos configurables para calificaciones'" -ForegroundColor Gray
Write-Host ""

$commitMessage = ""
$emptyLineCount = 0

while ($true) {
    $line = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($line)) {
        $emptyLineCount++
        if ($emptyLineCount -ge 1) {
            break
        }
    } else {
        $emptyLineCount = 0
        $commitMessage += $line + "`n"
    }
}

$commitMessage = $commitMessage.Trim()

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    Write-Host "❌ Error: El mensaje de commit no puede estar vacío" -ForegroundColor Red
    git reset > $null 2>&1
    exit 1
}

Write-Host ""
Write-Host "Mensaje de commit:" -ForegroundColor Cyan
Write-Host "$commitMessage" -ForegroundColor White
Write-Host ""

# ============================================================================
# 7. CONFIRMAR ANTES DE HACER COMMIT
# ============================================================================
Write-Host "¿Deseas continuar con el commit? (s/n)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    git reset > $null 2>&1
    exit 0
}

Write-Host ""

# ============================================================================
# 8. HACER COMMIT
# ============================================================================
Write-Host "6️⃣  Realizando commit..." -ForegroundColor Yellow

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al hacer commit" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit realizado exitosamente" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 9. OBTENER INFORMACIÓN DE LA RAMA
# ============================================================================
Write-Host "7️⃣  Información del repositorio:" -ForegroundColor Yellow

$currentBranch = git rev-parse --abbrev-ref HEAD
$remoteUrl = git config --get remote.origin.url
$uncommitted = git log --oneline -1

Write-Host "  🌳 Rama: $currentBranch"
Write-Host "  🔗 Remoto: $remoteUrl"
Write-Host "  📍 Último commit: $uncommitted"
Write-Host ""

# ============================================================================
# 10. HACER PUSH
# ============================================================================
Write-Host "8️⃣  Empujando cambios a $currentBranch..." -ForegroundColor Yellow
Write-Host ""

git push origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al hacer push" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  • Conectividad de red"
    Write-Host "  • Rama remota adelantada (necesitas pull primero)"
    Write-Host "  • Permisos insuficientes"
    Write-Host ""
    Write-Host "Solución: Ejecuta:" -ForegroundColor Cyan
    Write-Host "  git pull origin $currentBranch" -ForegroundColor Gray
    Write-Host "  git push origin $currentBranch" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Push realizado exitosamente" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 11. MOSTRAR RESUMEN FINAL
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ ¡PROYECTO SUBIDO EXITOSAMENTE!            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "  ✅ Cambios agregados"
Write-Host "  ✅ Commit realizado"
Write-Host "  ✅ Push completado"
Write-Host ""

Write-Host "🔍 Ver cambios en línea:" -ForegroundColor Cyan
Write-Host "  $remoteUrl" -ForegroundColor White
Write-Host ""

Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  • Verifica en GitHub que todos los archivos estén ahí"
Write-Host "  • Revisa el histórico de commits"
Write-Host "  • Comparte el repositorio con tu equipo"
Write-Host ""

Write-Host "✅ ¡Listo!" -ForegroundColor Green
