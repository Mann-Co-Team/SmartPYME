# ================================================
# SCRIPT DE INICIO COMPLETO - SmartPYME
# ================================================

Write-Host "🧹 Paso 1: Limpiando procesos anteriores..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name vite -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Procesos limpiados" -ForegroundColor Green

Write-Host "`n🚀 Paso 2: Iniciando Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\nicos\OneDrive\Documentos\GitHub\SmartPYME\backend"
    node server.js
}
Start-Sleep -Seconds 3

Write-Host "🔍 Verificando Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test" -TimeoutSec 5
    Write-Host "✅ Backend CORRIENDO en puerto 3000" -ForegroundColor Green
    Write-Host "   Mensaje: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend NO responde" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎨 Paso 3: Iniciando Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\nicos\OneDrive\Documentos\GitHub\SmartPYME\frontend"
    npm run dev
}
Start-Sleep -Seconds 3

Write-Host "`n✅ ¡SERVIDORES INICIADOS!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📡 Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "🎨 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`n📋 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Abre tu navegador en: http://localhost:5173" -ForegroundColor White
Write-Host "2. Presiona Ctrl+Shift+R para recarga forzada (limpia caché)" -ForegroundColor White
Write-Host "3. Si sigue sin funcionar, abre modo incógnito" -ForegroundColor White
Write-Host "4. Presiona F12 para ver consola y buscar errores" -ForegroundColor White

Write-Host "`n⚙️  Para ver logs:" -ForegroundColor Yellow
Write-Host "   Backend:  Receive-Job $($backendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "   Frontend: Receive-Job $($frontendJob.Id) -Keep" -ForegroundColor Gray

Write-Host "`n🛑 Para detener los servidores:" -ForegroundColor Yellow
Write-Host "   Stop-Job $($backendJob.Id), $($frontendJob.Id); Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray

Write-Host "`nPresiona Ctrl+C para salir (los servidores seguirán corriendo en background)" -ForegroundColor Cyan
Write-Host "`n"

# Mantener el script abierto
while ($true) {
    Start-Sleep -Seconds 60
}
