#!/usr/bin/env powershell
# ============================================================================
# Subir Proyecto a Git - Script Automatico
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "======================================================================"
Write-Host " SUBIENDO PROYECTO A GIT (GitHub)"
Write-Host "======================================================================"
Write-Host ""

# 1. VERIFICAR GIT
Write-Host "[1/8] Verificando repositorio Git..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] Este no es un repositorio Git" -ForegroundColor Red
    exit 1
}

git status 2>&1 > $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No se puede acceder al repositorio Git" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Repositorio Git detectado" -ForegroundColor Green
Write-Host ""

# 2. ESTADO ACTUAL
Write-Host "[2/8] Estado Actual:" -ForegroundColor Yellow

$status = git status --porcelain
$modifiedCount = ($status | Where-Object { $_ -match '^ M' } | Measure-Object).Count
$untrackedCount = ($status | Where-Object { $_ -match '^\?\?' } | Measure-Object).Count
$deletedCount = ($status | Where-Object { $_ -match '^ D' } | Measure-Object).Count

Write-Host "  - Modificados: $modifiedCount"
Write-Host "  - Nuevos: $untrackedCount"
Write-Host "  - Eliminados: $deletedCount"
Write-Host ""

if ($modifiedCount -eq 0 -and $untrackedCount -eq 0 -and $deletedCount -eq 0) {
    Write-Host "[AVISO] No hay cambios para subir" -ForegroundColor Yellow
    Write-Host "[OK] Proyecto esta al dia" -ForegroundColor Green
    exit 0
}

# 3. AGREGAR CAMBIOS
Write-Host "[3/8] Agregando cambios..." -ForegroundColor Yellow

git add . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al agregar cambios" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Cambios agregados" -ForegroundColor Green
Write-Host ""

# 4. MOSTRAR RESUMEN
Write-Host "[4/8] Resumen de cambios:" -ForegroundColor Yellow

$files = @(git diff --cached --name-only 2>&1)
foreach ($file in $files) {
    Write-Host "  + $file"
}
Write-Host ""

# 5. SOLICITAR DESCRIPCION
Write-Host "[5/8] Descripcion del commit:" -ForegroundColor Yellow
Write-Host "Ingresa un mensaje (presiona Ctrl+Z y Enter para terminar):"
Write-Host ""

$commitMessage = ""
$lineCount = 0
while ($true -and $lineCount -lt 50) {
    $line = Read-Host
    if ($null -eq $line -or $line -eq "") {
        break
    }
    if ($commitMessage -ne "") {
        $commitMessage += "`n"
    }
    $commitMessage += $line
    $lineCount++
}

$commitMessage = $commitMessage.Trim()

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    Write-Host "[ERROR] El mensaje no puede estar vacio" -ForegroundColor Red
    git reset 2>&1 > $null
    exit 1
}

Write-Host ""
Write-Host "Mensaje de commit:" -ForegroundColor Cyan
Write-Host "$commitMessage" -ForegroundColor White
Write-Host ""

# 6. CONFIRMAR
Write-Host "[6/8] Confirmacion:" -ForegroundColor Yellow
Write-Host "Deseas continuar? (s/n)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "[CANCELADO]" -ForegroundColor Red
    git reset 2>&1 > $null
    exit 0
}

Write-Host ""

# 7. HACER COMMIT
Write-Host "[7/8] Realizando commit..." -ForegroundColor Yellow

git commit -m "$commitMessage" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al hacer commit" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Commit realizado" -ForegroundColor Green
Write-Host ""

# 8. HACER PUSH
Write-Host "[8/8] Empujando a GitHub..." -ForegroundColor Yellow

$branch = git rev-parse --abbrev-ref HEAD 2>&1
Write-Host "Rama: $branch" -ForegroundColor Cyan

git push origin $branch 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al hacer push" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta: git pull origin $branch" -ForegroundColor Yellow
    Write-Host "Luego: git push origin $branch" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Push completado" -ForegroundColor Green
Write-Host ""

# RESUMEN FINAL
Write-Host "======================================================================"
Write-Host " [OK] PROYECTO SUBIDO EXITOSAMENTE"
Write-Host "======================================================================"
Write-Host ""
Write-Host "Verificar en: https://github.com/Nabyek21/Yati-a-Ampara" -ForegroundColor Cyan
Write-Host ""
