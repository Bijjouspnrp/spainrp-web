# Prueba simple de APIs SpainRP
# Ejecutar en PowerShell

$BASE_URL = "http://37.27.21.91:5021"
$USER_ID = "710112055985963090"

Write-Host "=== PRUEBA SIMPLE DE APIs SPAINRP ===" -ForegroundColor Green
Write-Host ""

# 1. Probar conectividad básica
Write-Host "1. Probando conectividad..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $BASE_URL -Method GET -TimeoutSec 5
    Write-Host "   ✅ Servidor responde (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Servidor no responde: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifica que el servidor esté ejecutándose en $BASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Probar endpoint de saldo
Write-Host "2. Probando endpoint de saldo..." -ForegroundColor Yellow
try {
    $saldo = Invoke-RestMethod -Uri "$BASE_URL/saldo/$USER_ID" -TimeoutSec 10
    Write-Host "   ✅ Saldo obtenido: $($saldo.saldo)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error obteniendo saldo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Probar endpoint de activos
Write-Host "3. Probando endpoint de activos..." -ForegroundColor Yellow
try {
    $activos = Invoke-RestMethod -Uri "$BASE_URL/activos" -TimeoutSec 10
    Write-Host "   ✅ Activos obtenidos: $($activos.Count) activos disponibles" -ForegroundColor Green
    Write-Host "   Activos: $($activos.Keys -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error obteniendo activos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Probar endpoint de antecedentes
Write-Host "4. Probando endpoint de antecedentes..." -ForegroundColor Yellow
try {
    $antecedentes = Invoke-RestMethod -Uri "$BASE_URL/antecedentes/$USER_ID" -TimeoutSec 10
    Write-Host "   ✅ Antecedentes obtenidos: $($antecedentes.total)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error obteniendo antecedentes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Probar endpoint de multas
Write-Host "5. Probando endpoint de multas..." -ForegroundColor Yellow
try {
    $multas = Invoke-RestMethod -Uri "$BASE_URL/multas/$USER_ID" -TimeoutSec 10
    Write-Host "   ✅ Multas obtenidas: $($multas.total) total, $($multas.pendientes) pendientes" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error obteniendo multas: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Probar endpoint de estadísticas
Write-Host "6. Probando endpoint de estadísticas..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$BASE_URL/stats/records" -TimeoutSec 10
    Write-Host "   ✅ Estadísticas obtenidas:" -ForegroundColor Green
    Write-Host "     - Antecedentes globales: $($stats.antecedentes)" -ForegroundColor Gray
    Write-Host "     - Arrestos globales: $($stats.arrestos)" -ForegroundColor Gray
    Write-Host "     - Multas pendientes globales: $($stats.multasPendientes)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error obteniendo estadísticas: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Probar endpoint de DNI
Write-Host "7. Probando endpoint de DNI..." -ForegroundColor Yellow
try {
    $dniResponse = Invoke-WebRequest -Uri "$BASE_URL/dni/$USER_ID/exportar" -Method HEAD -TimeoutSec 10
    Write-Host "   ✅ DNI existe (Status: $($dniResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ DNI no existe o error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Green
Write-Host "Si todos los endpoints responden correctamente, el panel debería funcionar." -ForegroundColor White
Write-Host "Si hay errores, revisa que el servidor esté ejecutándose en $BASE_URL" -ForegroundColor White
Write-Host "Revisa la consola del navegador para ver los logs detallados del panel." -ForegroundColor White
