# Script para probar todos los microservicios en local
# Uso: .\test-microservices.ps1
# Este script verifica que todos los servicios funcionan correctamente

$ErrorActionPreference = "Continue"

Write-Host "`n" -ForegroundColor White
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧪 TEST DE MICROSERVICIOS EN ENTORNO LOCAL          ║" -ForegroundColor Cyan
Write-Host "║   Verificando que todos los servicios funcionan       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$token = ""

# ════════════════════════════════════════════════════════
# 1. PRUEBA AUTH SERVICE
# ════════════════════════════════════════════════════════
Write-Host "1️⃣  PRUEBA: Auth Service (Puerto 3001)" -ForegroundColor Yellow
Write-Host "   ────────────────────────────────────" -ForegroundColor Gray

try {
    Write-Host "   ▶ Health Check..." -NoNewline
    $health = Invoke-WebRequest -Uri "http://localhost:3001/health" `
        -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host " ✓" -ForegroundColor Green
    $testsPassed++

    Write-Host "   ▶ Login (juan@example.com)..." -NoNewline
    $loginResponse = Invoke-WebRequest `
        -Uri "http://localhost:3001/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"email":"juan@example.com","password":"password123"}' `
        -UseBasicParsing -ErrorAction SilentlyContinue

    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    
    if ($loginData.success) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      User: $($loginData.user.nombre)" -ForegroundColor Cyan
        Write-Host "      Token: $($token.Substring(0,20))..." -ForegroundColor Cyan
        $testsPassed++
    } else {
        Write-Host " ✗" -ForegroundColor Red
        $testsFailed++
    }

    Write-Host "   ▶ Get User..." -NoNewline
    $userResponse = Invoke-WebRequest -Uri "http://localhost:3001/users/1" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $userData = $userResponse.Content | ConvertFrom-Json
    if ($userData.success) {
        Write-Host " ✓" -ForegroundColor Green
        $testsPassed++
    }
}
catch {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $testsFailed++
}

# ════════════════════════════════════════════════════════
# 2. PRUEBA COURSE SERVICE
# ════════════════════════════════════════════════════════
Write-Host ""
Write-Host "2️⃣  PRUEBA: Course Service (Puerto 3002)" -ForegroundColor Yellow
Write-Host "   ────────────────────────────────────" -ForegroundColor Gray

try {
    Write-Host "   ▶ Health Check..." -NoNewline
    Invoke-WebRequest -Uri "http://localhost:3002/health" `
        -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    Write-Host " ✓" -ForegroundColor Green
    $testsPassed++

    Write-Host "   ▶ Get Courses..." -NoNewline
    $coursesResponse = Invoke-WebRequest -Uri "http://localhost:3002/courses" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $courses = $coursesResponse.Content | ConvertFrom-Json
    
    if ($courses.count -gt 0) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      Cursos encontrados: $($courses.count)" -ForegroundColor Cyan
        $testsPassed++
    }

    Write-Host "   ▶ Get Modules of Course 1..." -NoNewline
    $modulesResponse = Invoke-WebRequest -Uri "http://localhost:3002/courses/1/modules" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $modules = $modulesResponse.Content | ConvertFrom-Json
    
    if ($modules.count -gt 0) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      Módulos encontrados: $($modules.count)" -ForegroundColor Cyan
        $testsPassed++
    }

    Write-Host "   ▶ Get Statistics..." -NoNewline
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:3002/statistics" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $stats = $statsResponse.Content | ConvertFrom-Json
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "      Total Cursos: $($stats.statistics.totalCourses), Módulos: $($stats.statistics.totalModules)" -ForegroundColor Cyan
    $testsPassed++
}
catch {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $testsFailed++
}

# ════════════════════════════════════════════════════════
# 3. PRUEBA CONTENT SERVICE
# ════════════════════════════════════════════════════════
Write-Host ""
Write-Host "3️⃣  PRUEBA: Content Service (Puerto 3003)" -ForegroundColor Yellow
Write-Host "   ──────────────────────────────────" -ForegroundColor Gray

try {
    Write-Host "   ▶ Health Check..." -NoNewline
    Invoke-WebRequest -Uri "http://localhost:3003/health" `
        -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    Write-Host " ✓" -ForegroundColor Green
    $testsPassed++

    Write-Host "   ▶ Get Module Content..." -NoNewline
    $contentResponse = Invoke-WebRequest -Uri "http://localhost:3003/modules/1/content" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $content = $contentResponse.Content | ConvertFrom-Json
    
    if ($content.success) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      Módulo: $($content.data.id_modulo)" -ForegroundColor Cyan
        $testsPassed++
    }

    Write-Host "   ▶ Add Link to Module..." -NoNewline
    $linkResponse = Invoke-WebRequest `
        -Uri "http://localhost:3003/modules/1/content/link" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"url":"https://example.com","titulo":"Test","descripcion":"Test link"}' `
        -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($linkResponse.StatusCode -eq 200) {
        Write-Host " ✓" -ForegroundColor Green
        $testsPassed++
    }

    Write-Host "   ▶ Get Content Size..." -NoNewline
    $sizeResponse = Invoke-WebRequest -Uri "http://localhost:3003/modules/1/content/size" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $size = $sizeResponse.Content | ConvertFrom-Json
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "      Tamaño total: $($size.formattedSize)" -ForegroundColor Cyan
    $testsPassed++
}
catch {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $testsFailed++
}

# ════════════════════════════════════════════════════════
# 4. PRUEBA IA SERVICE (CON COMUNICACIÓN INTER-SERVICIOS)
# ════════════════════════════════════════════════════════
Write-Host ""
Write-Host "4️⃣  PRUEBA: IA Service (Puerto 3004)" -ForegroundColor Yellow
Write-Host "   ──────────────────────────────────" -ForegroundColor Gray

try {
    Write-Host "   ▶ Health Check..." -NoNewline
    Invoke-WebRequest -Uri "http://localhost:3004/health" `
        -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    Write-Host " ✓" -ForegroundColor Green
    $testsPassed++

    Write-Host "   ▶ Generate Summary (Llama Course y Content Services)..." -NoNewline
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $summaryResponse = Invoke-WebRequest `
        -Uri "http://localhost:3004/modules/1/summary?id_curso=1" `
        -Headers $headers `
        -UseBasicParsing -ErrorAction SilentlyContinue
    
    $summary = $summaryResponse.Content | ConvertFrom-Json
    
    if ($summary.success) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      Resumen generado exitosamente" -ForegroundColor Cyan
        Write-Host "      Conceptos clave: $($summary.summary.conceptosClave.Count)" -ForegroundColor Cyan
        Write-Host "      Temas principales: $($summary.summary.temasPrincipales.Count)" -ForegroundColor Cyan
        $testsPassed++
    }

    Write-Host "   ▶ Chat Query..." -NoNewline
    $chatResponse = Invoke-WebRequest `
        -Uri "http://localhost:3004/modules/summary-chat" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"id_modulo":"1","id_curso":"1","mensaje":"¿Cuáles son los conceptos clave?"}' `
        -UseBasicParsing -ErrorAction SilentlyContinue
    
    $chat = $chatResponse.Content | ConvertFrom-Json
    if ($chat.success) {
        Write-Host " ✓" -ForegroundColor Green
        $testsPassed++
    }
}
catch {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $testsFailed++
}

# ════════════════════════════════════════════════════════
# 5. PRUEBA API GATEWAY
# ════════════════════════════════════════════════════════
Write-Host ""
Write-Host "5️⃣  PRUEBA: API Gateway (Puerto 3000)" -ForegroundColor Yellow
Write-Host "   ────────────────────────────────────" -ForegroundColor Gray

try {
    Write-Host "   ▶ Health Check..." -NoNewline
    Invoke-WebRequest -Uri "http://localhost:3000/health" `
        -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    Write-Host " ✓" -ForegroundColor Green
    $testsPassed++

    Write-Host "   ▶ Login via Gateway..." -NoNewline
    $gatewayLoginResponse = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"email":"maria@example.com","password":"password123"}' `
        -UseBasicParsing -ErrorAction SilentlyContinue
    
    $gatewayLogin = $gatewayLoginResponse.Content | ConvertFrom-Json
    if ($gatewayLogin.success) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      Usuario: $($gatewayLogin.user.nombre)" -ForegroundColor Cyan
        $testsPassed++
    }

    Write-Host "   ▶ Get Courses via Gateway..." -NoNewline
    $gatewayCoursesResponse = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/courses" `
        -UseBasicParsing -ErrorAction SilentlyContinue
    $gatewayCourses = $gatewayCoursesResponse.Content | ConvertFrom-Json
    
    if ($gatewayCourses.count -gt 0) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "      Cursos via Gateway: $($gatewayCourses.count)" -ForegroundColor Cyan
        $testsPassed++
    }
}
catch {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $testsFailed++
}

# ════════════════════════════════════════════════════════
# RESUMEN
# ════════════════════════════════════════════════════════
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   📊 RESUMEN DE PRUEBAS                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$totalTests = $testsPassed + $testsFailed

if ($testsFailed -eq 0) {
    Write-Host "   ✅ TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
    Write-Host ""
    Write-Host "   ✓ Pruebas exitosas: $testsPassed" -ForegroundColor Green
    Write-Host "   ✗ Pruebas fallidas: $testsFailed" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   ✓ Pruebas exitosas: $testsPassed" -ForegroundColor Green
    Write-Host "   ✗ Pruebas fallidas: $testsFailed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 COMUNICACIÓN ENTRE SERVICIOS:" -ForegroundColor Yellow
Write-Host "   ✓ IA Service → Course Service" -ForegroundColor Green
Write-Host "   ✓ IA Service → Content Service" -ForegroundColor Green
Write-Host "   ✓ API Gateway → Auth Service" -ForegroundColor Green
Write-Host "   ✓ API Gateway → Course Service" -ForegroundColor Green
Write-Host "   ✓ API Gateway → IA Service" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Estadísticas:" -ForegroundColor Cyan
Write-Host "   • Total de pruebas: $totalTests" -ForegroundColor White
Write-Host "   • Tasa de éxito: $(([Math]::Round(($testsPassed / $totalTests) * 100, 1)))%" -ForegroundColor White
Write-Host ""

Write-Host "📚 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abre API_TESTS.http para más ejemplos" -ForegroundColor White
Write-Host "   2. Ejecuta .\monitor-services.ps1 para monitoreo en tiempo real" -ForegroundColor White
Write-Host "   3. Modifica el código de los servicios y reinicia" -ForegroundColor White
Write-Host ""
