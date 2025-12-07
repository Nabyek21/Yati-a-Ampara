#!/usr/bin/env pwsh

Start-Sleep -Seconds 3

$uri = "http://localhost:4000/api/actividades/2"
$headers = @{"Authorization" = "Bearer test"}

Write-Host "🔄 Intentando eliminar actividad ID=2..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $uri -Method DELETE -Headers $headers -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $_.Exception.Response.GetResponseStream() | Tee-Object -FilePath "C:\temp\error.txt"
    }
}
