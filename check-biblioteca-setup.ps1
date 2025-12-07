#!/usr/bin/env pwsh

# ============================================================================
# 📋 CHECKLIST FINAL - SISTEMA DE SUBIDA DE ARCHIVOS BIBLIOTECA
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📋 CHECKLIST FINAL - SISTEMA DE SUBIDA DE ARCHIVOS BIBLIOTECA ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$checks = @()
$passedCount = 0
$failedCount = 0

# ============================================================================
# VERIFICACIÓN 1: Archivos Backend Creados
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 1: Archivos Backend" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$backendFiles = @(
    @{ path = "c:\Proyectos\SoaYatinya\backend\src\middlewares\uploadMiddleware.js"; desc = "Middleware Multer" },
    @{ path = "c:\Proyectos\SoaYatinya\backend\src\routes\bibliotecaRoutes.js"; desc = "Rutas Biblioteca" },
    @{ path = "c:\Proyectos\SoaYatinya\backend\src\controllers\BibliotecaController.js"; desc = "Controlador Biblioteca" },
    @{ path = "c:\Proyectos\SoaYatinya\backend\src\models\BibliotecaModel.js"; desc = "Modelo Biblioteca" },
    @{ path = "c:\Proyectos\SoaYatinya\backend\src\uploads\biblioteca\"; desc = "Directorio de almacenamiento" }
)

foreach ($file in $backendFiles) {
    if (Test-Path $file.path) {
        Write-Host "  ✅ $($file.desc)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($file.desc) - NO ENCONTRADO" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 2: Archivos Frontend Creados
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 2: Archivos Frontend" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$frontendFiles = @(
    @{ path = "c:\Proyectos\SoaYatinya\frontend\src\pages\admin\biblioteca.astro"; desc = "Página Biblioteca" },
    @{ path = "c:\Proyectos\SoaYatinya\frontend\public\services\bibliotecaService.js"; desc = "Service Biblioteca" }
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file.path) {
        Write-Host "  ✅ $($file.desc)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($file.desc) - NO ENCONTRADO" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 3: Configuración en app.js
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 3: Configuración Express" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$appJsPath = "c:\Proyectos\SoaYatinya\backend\src\app.js"
$appJsContent = Get-Content -Path $appJsPath -Raw

$checks_app = @(
    @{ text = "Static middleware para /uploads"; pattern = "app\.use\('/uploads'" },
    @{ text = "Rutas biblioteca montadas"; pattern = "app\.use.*biblioteca" },
    @{ text = "CORS configurado"; pattern = "cors" }
)

foreach ($check in $checks_app) {
    if ($appJsContent -match $check.pattern) {
        Write-Host "  ✅ $($check.text)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($check.text)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 4: Configuración en Middleware
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 4: Middleware Multer" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$middlewarePath = "c:\Proyectos\SoaYatinya\backend\src\middlewares\uploadMiddleware.js"
$middlewareContent = Get-Content -Path $middlewarePath -Raw

$checks_middleware = @(
    @{ text = "uploadMultiple exportado"; pattern = "export.*uploadMultiple" },
    @{ text = "Límite 50MB configurado"; pattern = "50.*1024.*1024" },
    @{ text = "Directorio biblioteca"; pattern = "biblioteca" },
    @{ text = "Filtro de tipos de archivo"; pattern = "fileFilterBiblioteca" }
)

foreach ($check in $checks_middleware) {
    if ($middlewareContent -match $check.pattern) {
        Write-Host "  ✅ $($check.text)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($check.text)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 5: Rutas Biblioteca
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 5: Rutas API Biblioteca" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$routesPath = "c:\Proyectos\SoaYatinya\backend\src\routes\bibliotecaRoutes.js"
$routesContent = Get-Content -Path $routesPath -Raw

$checks_routes = @(
    @{ text = "POST con uploadMultiple"; pattern = "router\.post.*uploadMultiple.single" },
    @{ text = "GET recursos"; pattern = "router\.get.*obtenerRecursos" },
    @{ text = "Autenticación verificada"; pattern = "verificarToken" }
)

foreach ($check in $checks_routes) {
    if ($routesContent -match $check.pattern) {
        Write-Host "  ✅ $($check.text)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($check.text)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 6: Controlador
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 6: Controlador Biblioteca" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$controllerPath = "c:\Proyectos\SoaYatinya\backend\src\controllers\BibliotecaController.js"
$controllerContent = Get-Content -Path $controllerPath -Raw

$checks_controller = @(
    @{ text = "Maneja req.file"; pattern = "req\.file" },
    @{ text = "Construye URL"; pattern = "uploads/biblioteca" },
    @{ text = "Validación de admin"; pattern = "id_rol.*1" },
    @{ text = "URL final del archivo"; pattern = "url_final" }
)

foreach ($check in $checks_controller) {
    if ($controllerContent -match $check.pattern) {
        Write-Host "  ✅ $($check.text)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($check.text)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 7: Frontend
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 7: Interfaz Frontend" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$frontendPath = "c:\Proyectos\SoaYatinya\frontend\src\pages\admin\biblioteca.astro"
$frontendContent = Get-Content -Path $frontendPath -Raw

$checks_frontend = @(
    @{ text = "Tabs URL/Archivo"; pattern = "cambiarTab" },
    @{ text = "Drag-and-drop"; pattern = "zonaDrop" },
    @{ text = "FormData"; pattern = "FormData" },
    @{ text = "File input"; pattern = "input-archivo" }
)

foreach ($check in $checks_frontend) {
    if ($frontendContent -match $check.pattern) {
        Write-Host "  ✅ $($check.text)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($check.text)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# VERIFICACIÓN 8: Documentación
# ============================================================================

Write-Host "🔍 VERIFICACIÓN 8: Documentación" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$docFiles = @(
    @{ path = "c:\Proyectos\SoaYatinya\BIBLIOTECA_FILE_UPLOAD_GUIDE.md"; desc = "Guía completa de Biblioteca" }
)

foreach ($doc in $docFiles) {
    if (Test-Path $doc.path) {
        Write-Host "  ✅ $($doc.desc)" -ForegroundColor Green
        $passedCount++
    } else {
        Write-Host "  ❌ $($doc.desc) - NO ENCONTRADO" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                         RESUMEN FINAL                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host ""
Write-Host "  ✅ Verificaciones exitosas: $passedCount" -ForegroundColor Green
Write-Host "  ❌ Verificaciones fallidas:  $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failedCount -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          ✅ SISTEMA DE SUBIDA LISTA PARA PRODUCCIÓN           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Inicia el servidor backend: cd backend && npm run dev" -ForegroundColor Cyan
    Write-Host "  2. Inicia el frontend: cd frontend && npm run dev" -ForegroundColor Cyan
    Write-Host "  3. Login como admin y ve a: Admin → Biblioteca" -ForegroundColor Cyan
    Write-Host "  4. Prueba subiendo un archivo" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║    ⚠️  HAY PROBLEMAS QUE NECESITAN ATENCIÓN                   ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Revisa los errores arriba y corrígelos antes de proceder." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

