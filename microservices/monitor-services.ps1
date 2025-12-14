# Script para monitorear todos los microservicios en tiempo real
# Uso: .\monitor-services.ps1
# Este script muestra el estado de todos los servicios actualizándose cada 5 segundos

$serviceStatus = @{
    "3001" = @{name="Auth Service"; emoji="🔐"; status=$false}
    "3002" = @{name="Course Service"; emoji="📚"; status=$false}
    "3003" = @{name="Content Service"; emoji="📁"; status=$false}
    "3004" = @{name="IA Service"; emoji="🤖"; status=$false}
    "3000" = @{name="API Gateway"; emoji="🌐"; status=$false}
}

function Show-Dashboard {
    Clear-Host
    
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   📊 MONITOR DE MICROSERVICIOS EN TIEMPO REAL         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $upCount = 0
    $downCount = 0
    $totalServices = $serviceStatus.Count
    
    foreach ($port in @("3001", "3002", "3003", "3004", "3000")) {
        $service = $serviceStatus[$port]
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port/health" `
                -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
            
            if ($response.StatusCode -eq 200) {
                $service.status = $true
                $upCount++
                Write-Host "   $($service.emoji) $($service.name)" -ForegroundColor Green -NoNewline
                Write-Host " ✅ UP" -ForegroundColor Green
            } else {
                $service.status = $false
                $downCount++
                Write-Host "   $($service.emoji) $($service.name)" -ForegroundColor Red -NoNewline
                Write-Host " ❌ DOWN" -ForegroundColor Red
            }
        }
        catch {
            $service.status = $false
            $downCount++
            Write-Host "   $($service.emoji) $($service.name)" -ForegroundColor Red -NoNewline
            Write-Host " ❌ DOWN" -ForegroundColor Red
        }
        
        Write-Host "   └─ Puerto: $port" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   📈 ESTADÍSTICAS                                      ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $percentage = if ($totalServices -gt 0) { ([Math]::Round(($upCount / $totalServices) * 100, 1)) } else { 0 }
    
    Write-Host "   Servicios activos:   $upCount/$totalServices" -ForegroundColor Cyan
    Write-Host "   Disponibilidad:      $percentage%" -ForegroundColor Cyan
    Write-Host ""
    
    # Barra de progreso visual
    $barLength = 30
    $filledLength = [Math]::Round($barLength * ($upCount / $totalServices))
    $emptyLength = $barLength - $filledLength
    
    Write-Host "   " -NoNewline
    Write-Host "┌" + ("─" * $barLength) + "┐" -ForegroundColor Gray
    
    Write-Host "   " -NoNewline
    Write-Host "│" -ForegroundColor Gray -NoNewline
    Write-Host ("█" * $filledLength) -ForegroundColor Green -NoNewline
    Write-Host ("░" * $emptyLength) -ForegroundColor Gray -NoNewline
    Write-Host "│" -ForegroundColor Gray
    
    Write-Host "   " -NoNewline
    Write-Host "└" + ("─" * $barLength) + "┘" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   🔌 PUERTOS Y RUTAS                                   ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "   Acceso a servicios (en navegador o curl):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   🌐 API Gateway" -ForegroundColor Cyan
    Write-Host "      http://localhost:3000" -ForegroundColor White
    Write-Host "      http://localhost:3000/health" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "   🔐 Auth Service" -ForegroundColor Cyan
    Write-Host "      http://localhost:3001" -ForegroundColor White
    Write-Host "      http://localhost:3001/health" -ForegroundColor Gray
    Write-Host "      Usuarios: juan@, maria@, admin@example.com" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "   📚 Course Service" -ForegroundColor Cyan
    Write-Host "      http://localhost:3002/courses" -ForegroundColor White
    Write-Host "      http://localhost:3002/health" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "   📁 Content Service" -ForegroundColor Cyan
    Write-Host "      http://localhost:3003/modules/1/content" -ForegroundColor White
    Write-Host "      http://localhost:3003/health" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "   🤖 IA Service" -ForegroundColor Cyan
    Write-Host "      http://localhost:3004/modules/1/summary" -ForegroundColor White
    Write-Host "      http://localhost:3004/health" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   ⏰ ACTUALIZACIÓN                                      ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "   Última actualización: $timestamp" -ForegroundColor Yellow
    Write-Host "   (Se actualiza cada 5 segundos - Presiona Ctrl+C para salir)" -ForegroundColor Gray
    Write-Host ""
    
    # Tips
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   💡 TIPS                                              ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "   Para hacer requests:" -ForegroundColor Yellow
    Write-Host "      .\test-microservices.ps1          (ejecutar tests)" -ForegroundColor White
    Write-Host "      curl http://localhost:3001/health (verificar servicio)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "   Para ver logs en detalle:" -ForegroundColor Yellow
    Write-Host "      Abre las ventanas de PowerShell donde corren los servicios" -ForegroundColor White
    Write-Host ""
}

# Main loop
while ($true) {
    Show-Dashboard
    Start-Sleep -Seconds 5
}
