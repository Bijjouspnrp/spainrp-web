# Comandos individuales para probar APIs de SpainRP
# Ejecutar cada comando por separado en PowerShell

$BASE_URL = "http://37.27.21.91:5021"
$USER_ID = "710112055985963090"

Write-Host "=== COMANDOS INDIVIDUALES PARA PROBAR APIs ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. CONSULTAR SALDO:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/saldo/$USER_ID'" -ForegroundColor White
Write-Host ""

Write-Host "2. CONSULTAR CATÁLOGO DE ACTIVOS:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/activos'" -ForegroundColor White
Write-Host ""

Write-Host "3. CONSULTAR INVERSIONES:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/inversiones/$USER_ID'" -ForegroundColor White
Write-Host ""

Write-Host "4. VERIFICAR DNI (HEAD REQUEST):" -ForegroundColor Yellow
Write-Host "Invoke-WebRequest -Uri '$BASE_URL/dni/$USER_ID/exportar' -Method HEAD" -ForegroundColor White
Write-Host ""

Write-Host "5. CONSULTAR ANTECEDENTES:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/antecedentes/$USER_ID'" -ForegroundColor White
Write-Host ""

Write-Host "6. CONSULTAR MULTAS:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/multas/$USER_ID'" -ForegroundColor White
Write-Host ""

Write-Host "7. ESTADÍSTICAS GENERALES:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/stats/records'" -ForegroundColor White
Write-Host ""

Write-Host "8. CONSULTAR INVENTARIO:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/inventory/$USER_ID'" -ForegroundColor White
Write-Host ""

Write-Host "9. CONSULTAR BALANCE:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/balance/$USER_ID'" -ForegroundColor White
Write-Host ""

Write-Host "10. BUSCAR USUARIOS:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/search?q=bijjou'" -ForegroundColor White
Write-Host ""

Write-Host "11. LISTAR ITEMS:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/items'" -ForegroundColor White
Write-Host ""

Write-Host "12. FLUCTUACIÓN DE PRECIOS:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/fluctuar' -Method POST" -ForegroundColor White
Write-Host ""

Write-Host "13. COMPRAR ACTIVO (CUIDADO - GASTA DINERO REAL):" -ForegroundColor Red
Write-Host "`$body = @{ userId='$USER_ID'; assetId='BCN'; cantidad=1 } | ConvertTo-Json" -ForegroundColor White
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/comprar' -Method POST -Body `$body -ContentType 'application/json'" -ForegroundColor White
Write-Host ""

Write-Host "14. VENDER ACTIVO:" -ForegroundColor Red
Write-Host "`$body = @{ userId='$USER_ID'; assetId='BCN'; cantidad=1 } | ConvertTo-Json" -ForegroundColor White
Write-Host "Invoke-RestMethod -Uri '$BASE_URL/vender' -Method POST -Body `$body -ContentType 'application/json'" -ForegroundColor White
Write-Host ""

Write-Host "=== INSTRUCCIONES ===" -ForegroundColor Green
Write-Host "1. Copia y pega cada comando en PowerShell" -ForegroundColor White
Write-Host "2. Si un comando falla, revisa que el servidor esté ejecutándose" -ForegroundColor White
Write-Host "3. Los comandos de compra/venta gastan dinero real, úsalos con cuidado" -ForegroundColor White
Write-Host "4. Si todos funcionan, el panel debería mostrar datos correctamente" -ForegroundColor White
