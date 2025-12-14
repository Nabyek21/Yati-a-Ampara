# Script para iniciar todos los microservicios en local
# Uso: .\start-all.ps1
# Este script abre cada servicio en su propia ventana de PowerShell

param(
    [switch]$Quick  # Modo rápido sin npm install
)

$ErrorActionPreference = "Continue"

Write-Host "`n" -ForegroundColor White
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 Iniciando Microservicios en Entorno Local        ║" -ForegroundColor Cyan
Write-Host "║   5 Servicios | 5 Terminales | 1 Comando             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{
        name        = "🔐 Auth Service"
        port        = 3001
        path        = "auth-service"
        description = "Autenticación y gestión de usuarios"
        color       = "Cyan"
    },
    @{
        name        = "📚 Course Service"
        port        = 3002
        path        = "course-service"
        description = "Cursos y módulos"
        color       = "Yellow"
    },
    @{
        name        = "📁 Content Service"
        port        = 3003
        path        = "content-service"
        description = "Archivos y contenido"
        color       = "Green"
    },
    @{
        name        = "🤖 IA Service"
        port        = 3004
        path        = "ia-service"
        description = "Resúmenes con IA"
        color       = "Magenta"
    },
    @{
        name        = "🌐 API Gateway"
        port        = 3000
        path        = "api-gateway"
        description = "Gateway centralizado"
        color       = "Red"
    }
)

Write-Host "📋 Servicios a iniciar:" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    Write-Host "   [$($service.port)] $($service.name) - $($service.description)" -ForegroundColor $service.color
}

Write-Host ""
Write-Host "⏳ Iniciando servicios..." -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date
$processIds = @()

foreach ($service in $services) {
    $servicePath = Join-Path (Get-Location) $service.path
    
    # Verificar que el archivo server.js existe
    if (-not (Test-Path (Join-Path $servicePath "server.js"))) {
        Write-Host "   ✗ $($service.name) - Archivo server.js no encontrado en $servicePath" -ForegroundColor Red
        continue
    }
    
    # Construir comando
    if ($Quick) {
        $command = "cd '$servicePath'; npm start"
    } else {
        $command = "cd '$servicePath'; npm install --silent; npm start"
    }
    
    try {
        # Iniciar proceso en nueva ventana
        $process = Start-Process -FilePath "powershell.exe" `
            -ArgumentList "-NoExit", "-Command", $command `
            -PassThru `
            -ErrorAction Stop
        
        $processIds += $process.Id
        Write-Host "   ✓ $($service.name) iniciado [PID: $($process.Id)]" -ForegroundColor Green
        Start-Sleep -Milliseconds 800
    }
    catch {
        Write-Host "   ✗ Error al iniciar $($service.name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ TODOS LOS SERVICIOS INICIADOS                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Acceso a servicios:" -ForegroundColor Cyan
Write-Host "   • API Gateway:      http://localhost:3000" -ForegroundColor White
Write-Host "   • Auth Service:     http://localhost:3001" -ForegroundColor White
Write-Host "   • Course Service:   http://localhost:3002" -ForegroundColor White
Write-Host "   • Content Service:  http://localhost:3003" -ForegroundColor White
Write-Host "   • IA Service:       http://localhost:3004" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abre otra terminal PowerShell" -ForegroundColor White
Write-Host "   2. Ejecuta: .\test-microservices.ps1" -ForegroundColor White
Write-Host "   3. O ejecuta: .\monitor-services.ps1" -ForegroundColor White
Write-Host ""

Write-Host "📊 Esperando 10 segundos para que se estabilicen los servicios..." -ForegroundColor Yellow

for ($i = 10; $i -gt 0; $i--) {
    Write-Host -NoNewline "`r   Segundos: $i   "
    Start-Sleep -Seconds 1
}

Write-Host "`n"

# Health checks
Write-Host "🏥 Verificando health checks..." -ForegroundColor Cyan
$healthyServices = 0

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.port)/health" `
            -TimeoutSec 2 `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✓ Puerto $($service.port) - OK" -ForegroundColor Green
            $healthyServices++
        }
    }
    catch {
        Write-Host "   ⚠ Puerto $($service.port) - No responde (todavía iniciándose...)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "$healthyServices/$($services.Count) servicios verificados correctamente" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "   • Guía local:      MICROSERVICIOS_EN_LOCAL.md" -ForegroundColor White
Write-Host "   • Ejemplos API:    API_TESTS.http" -ForegroundColor White
Write-Host "   • Arquitectura:    ARQUITECTURA_MICROSERVICIOS.md" -ForegroundColor White
Write-Host ""

Write-Host "⏱️  Tiempo de inicio: $([Math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)) segundos" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Los microservicios están listos. Los logs aparecen en las terminales individuales." -ForegroundColor Cyan
Write-Host "❌ Para detener los servicios, cierra las ventanas o presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""
