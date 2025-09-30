# Script de pruebas para APIs de SpainRP
# Ejecutar desde PowerShell

Write-Host "=== PRUEBAS DE APIs SPAINRP ===" -ForegroundColor Green
Write-Host "IP: 37.27.21.91:5021" -ForegroundColor Yellow
Write-Host ""

# Función para hacer requests con manejo de errores
function Test-API {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "🔍 Probando: $Description" -ForegroundColor Cyan
    Write-Host "   URL: $Url" -ForegroundColor Gray
    Write-Host "   Método: $Method" -ForegroundColor Gray
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -TimeoutSec 10
        }
        
        Write-Host "   ✅ ÉXITO" -ForegroundColor Green
        Write-Host "   Respuesta: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
    }
    catch {
        Write-Host "   ❌ ERROR" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Base URL
$BASE_URL = "http://37.27.21.91:5021"
$USER_ID = "710112055985963090"  # Tu ID de Discord

Write-Host "1. PROBANDO ENDPOINTS DE BOLSA/ECONOMÍA" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta

# 1.1 Consultar saldo
Test-API -Url "$BASE_URL/saldo/$USER_ID" -Description "Consultar saldo de usuario"

# 1.2 Consultar catálogo de activos
Test-API -Url "$BASE_URL/activos" -Description "Consultar catálogo de activos"

# 1.3 Consultar inversiones del usuario
Test-API -Url "$BASE_URL/inversiones/$USER_ID" -Description "Consultar inversiones del usuario"

Write-Host "2. PROBANDO ENDPOINTS DE DNI" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta

# 2.1 Exportar DNI (HEAD request para verificar si existe)
Write-Host "🔍 Probando: Verificar existencia de DNI" -ForegroundColor Cyan
Write-Host "   URL: $BASE_URL/dni/$USER_ID/exportar" -ForegroundColor Gray
Write-Host "   Método: HEAD" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/dni/$USER_ID/exportar" -Method HEAD -TimeoutSec 10
    Write-Host "   ✅ ÉXITO - DNI existe (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ERROR - DNI no existe o error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. PROBANDO ENDPOINTS DE ADMINISTRACIÓN" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta

# 3.1 Consultar antecedentes
Test-API -Url "$BASE_URL/antecedentes/$USER_ID" -Description "Consultar antecedentes del usuario"

# 3.2 Consultar multas
Test-API -Url "$BASE_URL/multas/$USER_ID" -Description "Consultar multas del usuario"

# 3.3 Estadísticas generales
Test-API -Url "$BASE_URL/stats/records" -Description "Consultar estadísticas generales"

# 3.4 Consultar inventario
Test-API -Url "$BASE_URL/inventory/$USER_ID" -Description "Consultar inventario del usuario"

# 3.5 Consultar balance
Test-API -Url "$BASE_URL/balance/$USER_ID" -Description "Consultar balance del usuario"

Write-Host "4. PROBANDO ENDPOINTS DE BÚSQUEDA" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

# 4.1 Buscar usuarios
Test-API -Url "$BASE_URL/search?q=bijjou" -Description "Buscar usuarios por nombre"

# 4.2 Listar items disponibles
Test-API -Url "$BASE_URL/items" -Description "Listar items disponibles"

Write-Host "5. PROBANDO ENDPOINTS DE FLUCTUACIÓN DE PRECIOS" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Magenta

# 5.1 Fluctuación automática
Test-API -Url "$BASE_URL/fluctuar" -Method "POST" -Description "Ejecutar fluctuación automática de precios"

Write-Host "6. PRUEBAS DE COMPRA/VENTA (OPCIONAL)" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta

# 6.1 Comprar activo (comentado para evitar gastos reales)
Write-Host "⚠️  Pruebas de compra/venta comentadas para evitar gastos reales" -ForegroundColor Yellow
Write-Host "   Para probar compra, descomenta las siguientes líneas:" -ForegroundColor Yellow
Write-Host "   Test-API -Url '$BASE_URL/comprar' -Method 'POST' -Body '{\"userId\":\"$USER_ID\",\"assetId\":\"BCN\",\"cantidad\":1}' -Description 'Comprar 1 acción de BCN'" -ForegroundColor Gray
Write-Host ""

Write-Host "=== FIN DE PRUEBAS ===" -ForegroundColor Green
Write-Host "Si todos los endpoints responden correctamente, las APIs están funcionando." -ForegroundColor White
Write-Host "Si hay errores, revisa que el servidor en 37.27.21.91:5021 esté ejecutándose." -ForegroundColor White
