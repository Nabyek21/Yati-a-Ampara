#!/usr/bin/env pwsh

# Script para verificar que los archivos del servicio están en su lugar

Write-Host "`n Verificacion de Archivos - Sistema de Calificaciones`n" -ForegroundColor Cyan

$errors = 0
$checks = 0

# Lista de archivos a verificar
$files = @(
    @{ Path = "frontend\public\services\calificacionesService.js"; Type = "Servicio (publico)" },
    @{ Path = "frontend\src\services\calificacionesService.js"; Type = "Servicio (fuente)" }
)

Write-Host "Verificando archivos requeridos...`n"

foreach ($file in $files) {
    $checks++
    $fullPath = Join-Path "c:\Proyectos\SoaYatinya" $file.Path
    
    if (Test-Path $fullPath) {
        Write-Host "[OK] $($file.Type)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $($file.Type) - NO ENCONTRADO" -ForegroundColor Red
        $errors++
    }
}

# Verificar páginas (con rutas especiales por corchetes)
$page1 = "c:\Proyectos\SoaYatinya\frontend\src\pages\docente\calificaciones-estudiante\*id_matricula*"
$page2 = "c:\Proyectos\SoaYatinya\frontend\src\pages\docente\estudiantes\*id_curso*"

$checks++
if ((Get-Item -Path $page1 -ErrorAction SilentlyContinue) -ne $null) {
    Write-Host "[OK] Pagina historial (id_matricula)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Pagina historial - NO ENCONTRADA" -ForegroundColor Red
    $errors++
}

$checks++
if ((Get-Item -Path $page2 -ErrorAction SilentlyContinue) -ne $null) {
    Write-Host "[OK] Pagina estudiantes (id_curso)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Pagina estudiantes - NO ENCONTRADA" -ForegroundColor Red
    $errors++
}

# Verificar contenido específico
Write-Host "`nVerificando contenido de archivos...`n"

# Verificar que el archivo público tiene el servicio
$publicServicePath = "c:\Proyectos\SoaYatinya\frontend\public\services\calificacionesService.js"
if (Test-Path $publicServicePath) {
    $content = Get-Content $publicServicePath -Raw
    
    $checks++
    if ($content -like "*obtenerCalificacionesEstudiante*") {
        Write-Host "[OK] Funcion obtenerCalificacionesEstudiante disponible" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Falta funcion obtenerCalificacionesEstudiante" -ForegroundColor Red
        $errors++
    }
    
    $checks++
    if ($content -like "*export*function*") {
        Write-Host "[OK] Funciones exportadas correctamente" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Verifica que las funciones usen export" -ForegroundColor Yellow
    }
}

# Verificar que las páginas usan la ruta correcta
$page1Path = "c:\Proyectos\SoaYatinya\frontend\src\pages\docente\calificaciones-estudiante\[id_matricula].astro"
if (Test-Path $page1Path) {
    $content = Get-Content $page1Path -Raw
    
    $checks++
    if ($content -like "*import('/services/calificacionesService.js')*") {
        Write-Host "[OK] Pagina 1 importa desde /services/ (correcto)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Pagina 1 - Verifica ruta de importacion" -ForegroundColor Yellow
    }
}

$page2Path = "c:\Proyectos\SoaYatinya\frontend\src\pages\docente\estudiantes\[id_curso].astro"
if (Test-Path $page2Path) {
    $content = Get-Content $page2Path -Raw
    
    $checks++
    if ($content -like "*import('/services/calificacionesService.js')*") {
        Write-Host "[OK] Pagina 2 importa desde /services/ (correcto)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Pagina 2 - Verifica ruta de importacion" -ForegroundColor Yellow
    }
}

# Resumen
Write-Host "`n====== RESUMEN ======`n"

$passed = $checks - $errors

Write-Host "Total verificaciones: $checks"
Write-Host "Pasadas: $passed" -ForegroundColor Green
Write-Host "Fallidas: $errors" -ForegroundColor $(if ($errors -eq 0) { 'Green' } else { 'Red' })

if ($errors -eq 0) {
    Write-Host "`nTodos los archivos estan en su lugar. Listo para testing.`n" -ForegroundColor Green
} else {
    Write-Host "`nExisten problemas que necesitan ser resueltos.`n" -ForegroundColor Red
}

