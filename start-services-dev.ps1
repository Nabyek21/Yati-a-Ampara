# Script para iniciar Backend + Frontend en MODO DESARROLLO
# Simplemente abre 2 ventanas: una para cada carpeta
# Equivalente a ejecutar manualmente: pnpm run dev en cada una

param(
    [string]$Mode = "all"  # "all", "backend", "frontend"
)

$rootPath = "C:\Proyectos\SoaYatinya"

function Start-Dev {
    param(
        [string]$name,
        [string]$path
    )
    
    Write-Host "[*] Abriendo $name en: $path" -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; pnpm run dev"
    Start-Sleep -Seconds 1
}

if ($Mode -eq "all") {
    Write-Host "`n[*] Iniciando Backend + Frontend...`n" -ForegroundColor Green
    Start-Dev "Backend" "$rootPath\backend"
    Start-Dev "Frontend" "$rootPath\frontend"
    Write-Host "`n[OK] Ambos servicios iniciados`n" -ForegroundColor Green
    Write-Host "    Backend:  http://localhost:4000/api" -ForegroundColor Gray
    Write-Host "    Frontend: http://localhost:4321" -ForegroundColor Gray
    
} elseif ($Mode -eq "backend") {
    Start-Dev "Backend" "$rootPath\backend"
    
} elseif ($Mode -eq "frontend") {
    Start-Dev "Frontend" "$rootPath\frontend"
    
} else {
    Write-Host "Uso: .\start-services-dev.ps1 -Mode [all|backend|frontend]" -ForegroundColor Yellow
}
