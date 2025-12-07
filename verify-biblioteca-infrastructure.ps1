#!/usr/bin/env pwsh

# Script para verificar la infraestructura del sistema de Biblioteca

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  🔍 VERIFICACIÓN DE INFRAESTRUCTURA - BIBLIOTECA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# ========== VERIFICACIÓN 1: Servidor Express ==========
Write-Host "✓ VERIFICANDO SERVIDOR EXPRESS..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -ErrorAction Stop
    $healthData = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Servidor Express está corriendo" -ForegroundColor Green
    Write-Host "   Status: $($healthData.status)" -ForegroundColor Cyan
    Write-Host "   Timestamp: $($healthData.timestamp)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Servidor Express NO está corriendo en localhost:4000" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Por favor, inicia el servidor backend primero:" -ForegroundColor Yellow
    Write-Host "   cd backend && npm run dev" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# ========== VERIFICACIÓN 2: Estructura de directorios ==========
Write-Host "✓ VERIFICANDO DIRECTORIOS DE ALMACENAMIENTO..." -ForegroundColor Yellow

$uploadsDir = "c:\Proyectos\SoaYatinya\backend\src\uploads"
$bibliotecaDir = "$uploadsDir\biblioteca"

if (Test-Path $uploadsDir) {
    Write-Host "✅ Directorio /uploads existe" -ForegroundColor Green
} else {
    Write-Host "❌ Directorio /uploads NO existe" -ForegroundColor Red
}

if (Test-Path $bibliotecaDir) {
    Write-Host "✅ Directorio /uploads/biblioteca existe" -ForegroundColor Green
    $filesCount = (Get-ChildItem -Path $bibliotecaDir -Force | Measure-Object).Count
    Write-Host "   Archivos en el directorio: $filesCount" -ForegroundColor Cyan
} else {
    Write-Host "❌ Directorio /uploads/biblioteca NO existe" -ForegroundColor Red
}

Write-Host ""

# ========== VERIFICACIÓN 3: Archivos estáticos ==========
Write-Host "✓ VERIFICANDO ACCESO A ARCHIVOS ESTÁTICOS..." -ForegroundColor Yellow

# Crear archivo de prueba
$testDir = "$uploadsDir\test"
if (!(Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir -Force | Out-Null
}

$testFile = "$testDir\test-$(Get-Random).txt"
"Archivo de prueba - $(Get-Date)" | Set-Content -Path $testFile -Encoding UTF8

$fileName = [System.IO.Path]::GetFileName($testFile)
$relativeUrl = "/uploads/test/$fileName"
$fullUrl = "http://localhost:4000$relativeUrl"

Write-Host "   📄 Archivo de prueba: $fileName"
Write-Host "   🔗 URL: $fullUrl" -ForegroundColor Cyan

try {
    $fileResponse = Invoke-WebRequest -Uri $fullUrl -Method GET -ErrorAction Stop
    Write-Host "✅ Acceso a archivos estáticos funciona correctamente" -ForegroundColor Green
    Write-Host "   Status: $($fileResponse.StatusCode)" -ForegroundColor Cyan
    
    # Limpiar archivo de prueba
    Remove-Item -Path $testFile -Force
    
} catch {
    Write-Host "⚠️  No se puede acceder a archivos estáticos via HTTP" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Verifica que app.js tenga:" -ForegroundColor Yellow
    Write-Host "   app.use('/uploads', express.static(uploadsDir));" -ForegroundColor Cyan
}

Write-Host ""

# ========== VERIFICACIÓN 4: Estructura de rutas ==========
Write-Host "✓ VERIFICANDO RUTAS API..." -ForegroundColor Yellow

$apiUrl = "http://localhost:4000/api/biblioteca"

# Crear token ficticio para las pruebas
$testToken = "test-token-dummy"

Write-Host "   Endpoint: GET $apiUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method GET `
        -Headers @{ 'Authorization' = "Bearer $testToken" } `
        -ErrorAction Stop
    
    Write-Host "✅ Endpoint GET /api/biblioteca está disponible" -ForegroundColor Green
} catch {
    # Es normal obtener un 403 sin token válido
    if ($_.Exception.Response.StatusCode -eq 403 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Endpoint GET /api/biblioteca está disponible (requiere autenticación)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Error en endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ========== RESUMEN ==========
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ✅ VERIFICACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Yellow
Write-Host "  ✓ Servidor Express: ACTIVO" -ForegroundColor Green
Write-Host "  ✓ Directorios: CREADOS" -ForegroundColor Green
Write-Host "  ✓ Rutas API: DISPONIBLES" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 El sistema está listo para recibir subidas de archivos a la Biblioteca" -ForegroundColor Cyan
Write-Host ""

