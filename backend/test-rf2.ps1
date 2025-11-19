# Script de Pruebas RF-2: Registro y Autenticación de Clientes
# SmartPYME

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS RF-2: REGISTRO Y LOGIN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$passed = 0
$failed = 0

# PRUEBA 1: Registro Exitoso
Write-Host "PRUEBA 1: Registro Exitoso con email único" -ForegroundColor Yellow
$body = @{
    nombre = "Test Usuario RF2"
    email = "test.rf2.$(Get-Random)@ejemplo.com"
    password = "test123456"
    telefono = "+56912345678"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register-public" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ PASS - Registro exitoso" -ForegroundColor Green
    Write-Host "   Mensaje: $($response.message)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - Error en registro" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    $failed++
}

Start-Sleep -Milliseconds 500

# PRUEBA 2: Email Duplicado
Write-Host "`nPRUEBA 2: Registro con email duplicado" -ForegroundColor Yellow
$body = @{
    nombre = "Usuario Duplicado"
    email = "admin@smartpyme.com"
    password = "test123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register-public" -Method POST -Body $body -ContentType "application/json"
    Write-Host "❌ FAIL - Debería haber dado error" -ForegroundColor Red
    $failed++
} catch {
    $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    if ($errorMsg -eq "El correo ingresado ya está registrado") {
        Write-Host "✅ PASS - Mensaje correcto" -ForegroundColor Green
        Write-Host "   Mensaje: '$errorMsg'" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "⚠️ PARCIAL - Mensaje diferente" -ForegroundColor Yellow
        Write-Host "   Esperado: 'El correo ingresado ya está registrado'" -ForegroundColor Gray
        Write-Host "   Recibido: '$errorMsg'" -ForegroundColor Gray
        $failed++
    }
}

Start-Sleep -Milliseconds 500

# PRUEBA 3: Login Cliente Exitoso
Write-Host "`nPRUEBA 3: Login cliente exitoso" -ForegroundColor Yellow
$body = @{
    email = "juan.perez@ejemplo.com"
    password = "prueba123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ PASS - Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($response.data.user.nombre) $($response.data.user.apellido)" -ForegroundColor Gray
    Write-Host "   Rol: $($response.data.user.rol) (id: $($response.data.user.id_rol))" -ForegroundColor Gray
    Write-Host "   Token: $($response.data.token.Substring(0,20))..." -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "❌ FAIL - Error en login" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    $failed++
}

Start-Sleep -Milliseconds 500

# PRUEBA 4: Credenciales Inválidas
Write-Host "`nPRUEBA 4: Login con contraseña incorrecta" -ForegroundColor Yellow
$body = @{
    email = "juan.perez@ejemplo.com"
    password = "passwordincorrecto"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "❌ FAIL - Debería haber dado error" -ForegroundColor Red
    $failed++
} catch {
    $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    if ($errorMsg -eq "Credenciales inválidas") {
        Write-Host "✅ PASS - Mensaje correcto" -ForegroundColor Green
        Write-Host "   Mensaje: '$errorMsg'" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "⚠️ PARCIAL - Mensaje diferente" -ForegroundColor Yellow
        Write-Host "   Esperado: 'Credenciales inválidas'" -ForegroundColor Gray
        Write-Host "   Recibido: '$errorMsg'" -ForegroundColor Gray
        $failed++
    }
}

Start-Sleep -Milliseconds 500

# PRUEBA 5: Login Admin
Write-Host "`nPRUEBA 5: Login administrador" -ForegroundColor Yellow
$body = @{
    email = "admin@smartpyme.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    if ($response.data.user.id_rol -in @(1, 2)) {
        Write-Host "✅ PASS - Login admin exitoso" -ForegroundColor Green
        Write-Host "   Usuario: $($response.data.user.nombre)" -ForegroundColor Gray
        Write-Host "   Rol: $($response.data.user.rol) (id: $($response.data.user.id_rol))" -ForegroundColor Gray
        Write-Host "   ✓ Debe redirigir a /admin/dashboard" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "❌ FAIL - Rol incorrecto" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - Error en login admin" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    $failed++
}

Start-Sleep -Milliseconds 500

# PRUEBA 6: Campos Vacíos
Write-Host "`nPRUEBA 6: Registro con campos vacíos" -ForegroundColor Yellow
$body = @{
    nombre = ""
    email = "test@test.com"
    password = "test123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register-public" -Method POST -Body $body -ContentType "application/json"
    Write-Host "❌ FAIL - Debería haber dado error" -ForegroundColor Red
    $failed++
} catch {
    $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    Write-Host "✅ PASS - Error de validación detectado" -ForegroundColor Green
    Write-Host "   Mensaje: '$errorMsg'" -ForegroundColor Gray
    $passed++
}

Start-Sleep -Milliseconds 500

# PRUEBA 7: Email Inexistente
Write-Host "`nPRUEBA 7: Login con email inexistente" -ForegroundColor Yellow
$body = @{
    email = "noseexiste$(Get-Random)@ejemplo.com"
    password = "cualquierpassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "❌ FAIL - Debería haber dado error" -ForegroundColor Red
    $failed++
} catch {
    $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
    if ($errorMsg -eq "Credenciales inválidas") {
        Write-Host "✅ PASS - Mensaje correcto" -ForegroundColor Green
        Write-Host "   Mensaje: '$errorMsg'" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "⚠️ PARCIAL - Mensaje diferente" -ForegroundColor Yellow
        Write-Host "   Mensaje: '$errorMsg'" -ForegroundColor Gray
        $failed++
    }
}

Start-Sleep -Milliseconds 500

# PRUEBA 8: Login Empleado
Write-Host "`nPRUEBA 8: Login empleado" -ForegroundColor Yellow
$body = @{
    email = "empleado@smartpyme.com"
    password = "emp123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    if ($response.data.user.id_rol -eq 2) {
        Write-Host "✅ PASS - Login empleado exitoso" -ForegroundColor Green
        Write-Host "   Usuario: $($response.data.user.nombre)" -ForegroundColor Gray
        Write-Host "   Rol: $($response.data.user.rol) (id: $($response.data.user.id_rol))" -ForegroundColor Gray
        Write-Host "   ✓ Debe redirigir a /admin/dashboard" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "❌ FAIL - Rol incorrecto" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - Error en login empleado" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    $failed++
}

# RESUMEN
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "          RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total de pruebas: $($passed + $failed)" -ForegroundColor White
Write-Host "✅ Aprobadas: $passed" -ForegroundColor Green
Write-Host "❌ Fallidas: $failed" -ForegroundColor Red

$percentage = [math]::Round(($passed / ($passed + $failed)) * 100, 2)
Write-Host "`nPorcentaje de éxito: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 75) { "Yellow" } else { "Red" })

if ($percentage -eq 100) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS PASARON! RF-2 COMPLETADO" -ForegroundColor Green
} elseif ($percentage -ge 75) {
    Write-Host "`n⚠️  La mayoría de pruebas pasaron, revisar las fallidas" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Varias pruebas fallaron, revisar implementación" -ForegroundColor Red
}

Write-Host "`n"
