# Script de Pruebas RF-2 - Version Simple
$baseUrl = "http://localhost:5000/api"
$results = @()

Write-Host "`nPRUEBAS RF-2: REGISTRO Y AUTENTICACION`n" -ForegroundColor Cyan

# Test 1: Registro exitoso
Write-Host "Test 1: Registro exitoso..."
$body = @{
    nombre = "Test Usuario"
    email = "test.$(Get-Random)@ejemplo.com"
    password = "test123456"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/register-public" -Method POST -Body $body -ContentType "application/json"
    Write-Host "PASS - $($r.message)" -ForegroundColor Green
    $results += "PASS"
} catch {
    Write-Host "FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 2: Email duplicado
Write-Host "`nTest 2: Email duplicado..."
$body = @{
    nombre = "Test"
    email = "admin@smartpyme.com"
    password = "test123"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/register-public" -Method POST -Body $body -ContentType "application/json"
    Write-Host "FAIL - Deberia dar error" -ForegroundColor Red
    $results += "FAIL"
} catch {
    $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    Write-Host "PASS - $msg" -ForegroundColor Green
    $results += "PASS"
}

# Test 3: Login cliente
Write-Host "`nTest 3: Login cliente..."
$body = @{
    email = "juan.perez@ejemplo.com"
    password = "prueba123"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "PASS - Usuario: $($r.data.user.nombre), Rol: $($r.data.user.rol)" -ForegroundColor Green
    $results += "PASS"
} catch {
    Write-Host "FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 4: Credenciales invalidas
Write-Host "`nTest 4: Credenciales invalidas..."
$body = @{
    email = "juan.perez@ejemplo.com"
    password = "passwordmal"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "FAIL - Deberia dar error" -ForegroundColor Red
    $results += "FAIL"
} catch {
    $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    Write-Host "PASS - $msg" -ForegroundColor Green
    $results += "PASS"
}

# Test 5: Login admin
Write-Host "`nTest 5: Login admin..."
$body = @{
    email = "admin@smartpyme.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "PASS - Usuario: $($r.data.user.nombre), Rol: $($r.data.user.rol)" -ForegroundColor Green
    $results += "PASS"
} catch {
    Write-Host "FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 6: Login empleado
Write-Host "`nTest 6: Login empleado..."
$body = @{
    email = "empleado@smartpyme.com"
    password = "emp123"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "PASS - Usuario: $($r.data.user.nombre), Rol: $($r.data.user.rol)" -ForegroundColor Green
    $results += "PASS"
} catch {
    Write-Host "FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 7: Email inexistente
Write-Host "`nTest 7: Email inexistente..."
$body = @{
    email = "noexiste@ejemplo.com"
    password = "cualquier"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "FAIL - Deberia dar error" -ForegroundColor Red
    $results += "FAIL"
} catch {
    $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    Write-Host "PASS - $msg" -ForegroundColor Green
    $results += "PASS"
}

# Test 8: Campos vacios
Write-Host "`nTest 8: Campos vacios..."
$body = @{
    nombre = ""
    email = "test@test.com"
    password = "test"
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/auth/register-public" -Method POST -Body $body -ContentType "application/json"
    Write-Host "FAIL - Deberia dar error" -ForegroundColor Red
    $results += "FAIL"
} catch {
    $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    Write-Host "PASS - $msg" -ForegroundColor Green
    $results += "PASS"
}

# Resumen
$passed = ($results | Where-Object { $_ -eq "PASS" }).Count
$total = $results.Count
$pct = [math]::Round(($passed / $total) * 100, 0)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN: $passed/$total pruebas exitosas ($pct%)" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
