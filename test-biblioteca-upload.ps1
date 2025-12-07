#!/usr/bin/env pwsh

# Script de prueba para subida de archivos a la Biblioteca

Write-Host "🔄 Iniciando pruebas de subida de archivos a la Biblioteca..." -ForegroundColor Cyan
Write-Host ""

# Variables
$apiUrl = "http://localhost:4000/api"
$adminEmail = "admin@test.com"
$adminPassword = "password123"

# ========== PASO 1: Login como admin ==========
Write-Host "PASO 1: Autenticándose como admin..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-WebRequest -Uri "$apiUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (ConvertTo-Json @{
            email = $adminEmail
            password = $adminPassword
        }) `
        -ErrorAction Stop

    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========== PASO 2: Crear archivo de prueba ==========
Write-Host "PASO 2: Creando archivo de prueba..." -ForegroundColor Yellow

$testFile = "C:\temp\test-documento.txt"
$testContent = @"
Este es un documento de prueba para la Biblioteca de Yatiña.
Creado: $(Get-Date)
Propósito: Verificar que la subida de archivos funciona correctamente.
"@

if (!(Test-Path "C:\temp")) {
    New-Item -ItemType Directory -Path "C:\temp" | Out-Null
}

Set-Content -Path $testFile -Value $testContent -Encoding UTF8

Write-Host "✅ Archivo creado: $testFile" -ForegroundColor Green
Write-Host ""

# ========== PASO 3: Subir archivo a la Biblioteca ==========
Write-Host "PASO 3: Subiendo archivo a la Biblioteca..." -ForegroundColor Yellow

$boundary = [guid]::NewGuid().ToString()
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $fileStream = [System.IO.File]::ReadAllBytes($testFile)
    $fileName = [System.IO.Path]::GetFileName($testFile)
    
    # Construir FormData manualmente para PowerShell
    $body = [System.Text.StringBuilder]::new()
    
    # Agregar campos de formulario
    $body.AppendLine("--$boundary")
    $body.AppendLine('Content-Disposition: form-data; name="tipo"')
    $body.AppendLine('')
    $body.AppendLine('documento')
    
    $body.AppendLine("--$boundary")
    $body.AppendLine('Content-Disposition: form-data; name="titulo"')
    $body.AppendLine('')
    $body.AppendLine('Documento de Prueba')
    
    $body.AppendLine("--$boundary")
    $body.AppendLine('Content-Disposition: form-data; name="autor"')
    $body.AppendLine('')
    $body.AppendLine('Sistema de Prueba')
    
    $body.AppendLine("--$boundary")
    $body.AppendLine('Content-Disposition: form-data; name="descripcion"')
    $body.AppendLine('')
    $body.AppendLine('Archivo de prueba para verificar el sistema de subida')
    
    $body.AppendLine("--$boundary")
    $body.AppendLine("Content-Disposition: form-data; name=`"archivo`"; filename=`"$fileName`"")
    $body.AppendLine('Content-Type: application/octet-stream')
    $body.AppendLine('')
    
    # Combinamos headers y body
    $headers["Content-Type"] = "multipart/form-data; boundary=$boundary"
    
    Write-Host "Enviando POST a: $apiUrl/biblioteca" -ForegroundColor Cyan
    
    $uploadResponse = Invoke-WebRequest -Uri "$apiUrl/biblioteca" `
        -Method POST `
        -Headers $headers `
        -Body $testFile `
        -ErrorAction Stop
    
    $uploadData = $uploadResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Archivo subido exitosamente!" -ForegroundColor Green
    Write-Host "ID del Recurso: $($uploadData.id_recurso)" -ForegroundColor Cyan
    Write-Host "URL: $($uploadData.url_recurso)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error al subir archivo: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $response = $reader.ReadToEnd()
        Write-Host "Response: $response" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ========== PASO 4: Listar recursos ==========
Write-Host "PASO 4: Listando recursos de la Biblioteca..." -ForegroundColor Yellow

try {
    $listResponse = Invoke-WebRequest -Uri "$apiUrl/biblioteca" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    $recursos = $listResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Recursos obtenidos:" -ForegroundColor Green
    Write-Host "Total: $($recursos.Count) recurso(s)" -ForegroundColor Cyan
    
    if ($recursos -is [array]) {
        $recursos | ForEach-Object {
            Write-Host "  - ID: $($_.id_recurso), Título: $($_.titulo), Tipo: $($_.tipo)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  - ID: $($recursos.id_recurso), Título: $($recursos.titulo), Tipo: $($recursos.tipo)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Error al listar recursos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Pruebas completadas" -ForegroundColor Green

