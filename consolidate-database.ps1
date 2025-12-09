# Script de Consolidación de Base de Datos
# Este script reconstruye la BD con schema2.sql y restaura los datos

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDACIÓN DE BASE DE DATOS - SmartPYME" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$dbName = "smartpyme"
$schemaFile = "database\schema2.sql"
$backupFile = "database\backups\backup_manual_2025-12-04.sql"

# Verificar que existan los archivos
if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ Error: No se encontró schema2.sql" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backupFile)) {
    Write-Host "❌ Error: No se encontró el backup" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos verificados:" -ForegroundColor Green
Write-Host "   - Schema: $schemaFile"
Write-Host "   - Backup: $backupFile"
Write-Host ""

# Paso 1: Eliminar base de datos actual
Write-Host "🗑️  Paso 1: Eliminando base de datos actual..." -ForegroundColor Yellow
$dropCmd = "DROP DATABASE IF EXISTS $dbName;"
Write-Host "   Ejecutando: $dropCmd"
Write-Host ""
Write-Host "⚠️  EJECUTA ESTE COMANDO EN MYSQL:" -ForegroundColor Red
Write-Host "   mysql -u root -p -e `"$dropCmd`"" -ForegroundColor White
Write-Host ""
Read-Host "Presiona ENTER cuando hayas ejecutado el comando"

# Paso 2: Crear base de datos nueva
Write-Host ""
Write-Host "🆕 Paso 2: Creando base de datos nueva..." -ForegroundColor Yellow
$createCmd = "CREATE DATABASE $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host "   Ejecutando: $createCmd"
Write-Host ""
Write-Host "⚠️  EJECUTA ESTE COMANDO EN MYSQL:" -ForegroundColor Red
Write-Host "   mysql -u root -p -e `"$createCmd`"" -ForegroundColor White
Write-Host ""
Read-Host "Presiona ENTER cuando hayas ejecutado el comando"

# Paso 3: Aplicar schema2.sql
Write-Host ""
Write-Host "📋 Paso 3: Aplicando schema2.sql..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  EJECUTA ESTE COMANDO:" -ForegroundColor Red
Write-Host "   mysql -u root -p $dbName < $schemaFile" -ForegroundColor White
Write-Host ""
Read-Host "Presiona ENTER cuando hayas ejecutado el comando"

# Paso 4: Restaurar datos del backup
Write-Host ""
Write-Host "📦 Paso 4: Restaurando datos del backup..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  EJECUTA ESTE COMANDO:" -ForegroundColor Red
Write-Host "   mysql -u root -p $dbName < $backupFile" -ForegroundColor White
Write-Host ""
Read-Host "Presiona ENTER cuando hayas ejecutado el comando"

# Verificación
Write-Host ""
Write-Host "✅ ¡Consolidación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Ahora verifica los datos ejecutando:" -ForegroundColor Cyan
Write-Host "   cd backend"
Write-Host "   node verify-db-data.js"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
