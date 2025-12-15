# ========================================
# SCRIPT PARA CAMBIAR CONTRASEÑA DE MYSQL
# ========================================

Write-Host "🔐 Asistente para Cambio de Contraseña MySQL" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Verificar que MySQL está instalado
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL no encontrado en: $mysqlPath" -ForegroundColor Red
    Write-Host "Por favor, verifica la ruta de instalación de MySQL" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL encontrado`n" -ForegroundColor Green

# Solicitar contraseña actual
Write-Host "📝 Paso 1: Ingresa tu contraseña ACTUAL de MySQL" -ForegroundColor Yellow
$currentPassword = Read-Host "Contraseña actual" -AsSecureString
$currentPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($currentPassword)
)

# Solicitar nueva contraseña
Write-Host "`n📝 Paso 2: Ingresa tu NUEVA contraseña de MySQL" -ForegroundColor Yellow
Write-Host "Requisitos:" -ForegroundColor Gray
Write-Host "  • Mínimo 16 caracteres" -ForegroundColor Gray
Write-Host "  • Mayúsculas y minúsculas" -ForegroundColor Gray
Write-Host "  • Números y símbolos" -ForegroundColor Gray

$newPassword = Read-Host "Nueva contraseña" -AsSecureString
$newPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword)
)

$confirmPassword = Read-Host "Confirma nueva contraseña" -AsSecureString
$confirmPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($confirmPassword)
)

# Validar que coincidan
if ($newPasswordPlain -ne $confirmPasswordPlain) {
    Write-Host "`n❌ Las contraseñas no coinciden. Intenta nuevamente." -ForegroundColor Red
    exit 1
}

# Validar longitud mínima
if ($newPasswordPlain.Length -lt 16) {
    Write-Host "`n⚠️ Advertencia: La contraseña debería tener al menos 16 caracteres" -ForegroundColor Yellow
    $continue = Read-Host "¿Continuar de todas formas? (S/N)"
    if ($continue -ne "S") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`n🔄 Paso 3: Cambiando contraseña en MySQL..." -ForegroundColor Yellow

# Crear comando SQL
$sqlCommand = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPasswordPlain'; FLUSH PRIVILEGES;"
$tempSqlFile = Join-Path $env:TEMP "change_password.sql"
$sqlCommand | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    # Ejecutar cambio de contraseña
    $output = & $mysqlPath -u root "-p$currentPasswordPlain" -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPasswordPlain'; FLUSH PRIVILEGES;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contraseña de MySQL cambiada exitosamente`n" -ForegroundColor Green
        
        # Actualizar .env
        Write-Host "🔄 Paso 4: Actualizando archivo .env..." -ForegroundColor Yellow
        $envPath = Join-Path $PSScriptRoot "..\backend\.env"
        
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$newPasswordPlain"
            $envContent | Set-Content $envPath -NoNewline
            
            Write-Host "✅ Archivo .env actualizado`n" -ForegroundColor Green
            
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "✅ PROCESO COMPLETADO EXITOSAMENTE" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Cyan
            
            Write-Host "📋 Pasos siguientes:" -ForegroundColor Yellow
            Write-Host "  1. Prueba la conexión con la nueva contraseña" -ForegroundColor Gray
            Write-Host "  2. Reinicia el servidor backend si está corriendo" -ForegroundColor Gray
            Write-Host "  3. Verifica que los backups funcionen correctamente`n" -ForegroundColor Gray
            
        } else {
            Write-Host "⚠️ Archivo .env no encontrado en: $envPath" -ForegroundColor Yellow
            Write-Host "Por favor, actualiza manualmente DB_PASSWORD en tu archivo .env`n" -ForegroundColor Yellow
            Write-Host "DB_PASSWORD=$newPasswordPlain" -ForegroundColor White
        }
        
    } else {
        Write-Host "❌ Error cambiando contraseña: $output" -ForegroundColor Red
        Write-Host "Verifica que la contraseña actual sea correcta" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
} finally {
    # Limpiar archivo temporal
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile -Force
    }
}

# Limpiar variables con contraseñas
$currentPasswordPlain = $null
$newPasswordPlain = $null
$confirmPasswordPlain = $null
