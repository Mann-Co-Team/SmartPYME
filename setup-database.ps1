# Script para crear la base de datos SmartPYME
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schemaPath = ".\database\schema.sql"

Write-Host "========================================"
Write-Host "  Setup Base de Datos - SmartPYME"
Write-Host "========================================"
Write-Host ""

if (-Not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL no encontrado en $mysqlPath"
    exit 1
}

if (-Not (Test-Path $schemaPath)) {
    Write-Host "ERROR: schema.sql no encontrado"
    exit 1
}

Write-Host "Creando base de datos smartpyme_db..."
Write-Host "Ingresa la contraseña de MySQL root (Enter si no tiene):"
Write-Host ""

$createDB = "CREATE DATABASE IF NOT EXISTS smartpyme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$createDB | & $mysqlPath -u root -p

Write-Host ""
Write-Host "Importando schema.sql..."
Write-Host "Ingresa nuevamente la contraseña:"
Write-Host ""

Get-Content $schemaPath | & $mysqlPath -u root -p smartpyme_db

Write-Host ""
Write-Host "========================================"
Write-Host "Setup completado!"
Write-Host "========================================"
Write-Host ""
Write-Host "Credenciales:"
Write-Host "Email: admin@smartpyme.com"
Write-Host "Password: admin123"
