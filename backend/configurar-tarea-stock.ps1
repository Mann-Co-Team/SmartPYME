# Script de PowerShell para configurar tarea programada diaria
# Verifica el stock de productos y crea notificaciones automáticamente
# Se ejecuta todos los días a las 8:00 AM

$TaskName = "SmartPYME-VerificadorStock"
$ScriptPath = Join-Path $PSScriptRoot "verificador-stock-diario.js"
$NodePath = (Get-Command node).Path
$LogPath = Join-Path $PSScriptRoot "logs\verificador-stock.log"

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CONFIGURADOR DE VERIFICACIÓN DIARIA DE STOCK      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "   Tarea:   $TaskName"
Write-Host "   Script:  $ScriptPath"
Write-Host "   Node:    $NodePath"
Write-Host "   Horario: 8:00 AM diario"
Write-Host "   Log:     $LogPath`n"

# Verificar que el script existe
if (-not (Test-Path $ScriptPath)) {
    Write-Host "❌ ERROR: No se encontró el script verificador-stock-diario.js" -ForegroundColor Red
    Write-Host "   Ubicación esperada: $ScriptPath`n" -ForegroundColor Red
    exit 1
}

# Crear carpeta de logs si no existe
$LogDir = Split-Path $LogPath
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    Write-Host "✅ Carpeta de logs creada: $LogDir" -ForegroundColor Green
}

# Eliminar tarea existente si ya existe
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "⚠️  Tarea existente encontrada. Eliminando..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "✅ Tarea anterior eliminada" -ForegroundColor Green
}

# Crear acción de la tarea
$Action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "`"$ScriptPath`" >> `"$LogPath`" 2>&1" `
    -WorkingDirectory (Split-Path $ScriptPath)

# Crear trigger (diario a las 8:00 AM)
$Trigger = New-ScheduledTaskTrigger -Daily -At 8:00AM

# Configurar ajustes de la tarea
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

# Registrar la tarea
try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Description "Verifica el stock de productos en SmartPYME y crea notificaciones para productos agotados o con stock crítico. Se ejecuta diariamente a las 8:00 AM." `
        -User $env:USERNAME `
        -RunLevel Limited | Out-Null

    Write-Host "`n✅ TAREA PROGRAMADA CREADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "`n📅 Programación:" -ForegroundColor Cyan
    Write-Host "   • Se ejecutará todos los días a las 8:00 AM"
    Write-Host "   • Los logs se guardarán en: $LogPath"
    Write-Host "   • La tarea se ejecutará incluso si el equipo estaba apagado"
    
    Write-Host "`n🔧 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "   Ver estado:    Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "   Ejecutar ahora: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "   Ver logs:      Get-Content '$LogPath' -Tail 50" -ForegroundColor Gray
    Write-Host "   Eliminar:      Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray

    Write-Host "`n💡 Para probar la tarea ahora, ejecuta:" -ForegroundColor Cyan
    Write-Host "   Start-ScheduledTask -TaskName '$TaskName'`n" -ForegroundColor White

} catch {
    Write-Host "`n❌ ERROR al crear la tarea programada:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}
