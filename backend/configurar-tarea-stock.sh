#!/bin/bash

# Script para configurar verificación diaria de stock con cron
# Para sistemas Linux/macOS o Windows con WSL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/verificador-stock-diario.js"
NODE_PATH="$(which node)"
LOG_PATH="$SCRIPT_DIR/logs/verificador-stock.log"
CRON_TIME="0 8 * * *"  # 8:00 AM todos los días

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   CONFIGURADOR DE VERIFICACIÓN DIARIA DE STOCK      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

echo "📋 Configuración:"
echo "   Script:  $SCRIPT_PATH"
echo "   Node:    $NODE_PATH"
echo "   Horario: 8:00 AM diario (cron: $CRON_TIME)"
echo "   Log:     $LOG_PATH"
echo ""

# Verificar que el script existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ ERROR: No se encontró el script verificador-stock-diario.js"
    echo "   Ubicación esperada: $SCRIPT_PATH"
    exit 1
fi

# Crear carpeta de logs si no existe
LOG_DIR="$(dirname "$LOG_PATH")"
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
    echo "✅ Carpeta de logs creada: $LOG_DIR"
fi

# Crear línea de cron
CRON_JOB="$CRON_TIME cd $SCRIPT_DIR && $NODE_PATH $SCRIPT_PATH >> $LOG_PATH 2>&1"
CRON_COMMENT="# SmartPYME - Verificación diaria de stock"

# Verificar si ya existe en crontab
if crontab -l 2>/dev/null | grep -q "verificador-stock-diario.js"; then
    echo "⚠️  Ya existe una tarea cron para verificador-stock-diario.js"
    echo "   Eliminando tarea anterior..."
    crontab -l 2>/dev/null | grep -v "verificador-stock-diario.js" | grep -v "SmartPYME - Verificación diaria de stock" | crontab -
    echo "✅ Tarea anterior eliminada"
fi

# Agregar nueva tarea a crontab
(crontab -l 2>/dev/null; echo ""; echo "$CRON_COMMENT"; echo "$CRON_JOB") | crontab -

echo ""
echo "✅ TAREA CRON CREADA EXITOSAMENTE"
echo ""
echo "📅 Programación:"
echo "   • Se ejecutará todos los días a las 8:00 AM"
echo "   • Los logs se guardarán en: $LOG_PATH"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver crontab:   crontab -l"
echo "   Editar crontab: crontab -e"
echo "   Ver logs:      tail -f $LOG_PATH"
echo "   Ejecutar ahora: node $SCRIPT_PATH"
echo ""
echo "💡 Para probar la tarea ahora, ejecuta:"
echo "   cd $SCRIPT_DIR && node verificador-stock-diario.js"
echo ""
