# 📊 Sistema de Verificación Diaria de Stock

## Descripción

Sistema automatizado que verifica el stock de todos los productos activos diariamente y crea notificaciones para:

- **🚫 Stock agotado** (0 unidades): Requieren reposición urgente
- **⚠️ Stock crítico** (1-5 unidades): Requieren atención

El sistema previene duplicados automáticamente, solo creando notificaciones nuevas si no hay ninguna no leída del mismo tipo para el mismo producto en las últimas 24 horas.

---

## 🚀 Instalación y Configuración

### Opción 1: Windows (Task Scheduler)

1. **Abrir PowerShell como Administrador**

2. **Navegar a la carpeta backend:**
   ```powershell
   cd C:\ruta\a\SmartPYME\backend
   ```

3. **Ejecutar el configurador:**
   ```powershell
   .\configurar-tarea-stock.ps1
   ```

4. **Verificar que la tarea se creó:**
   ```powershell
   Get-ScheduledTask -TaskName "SmartPYME-VerificadorStock"
   ```

### Opción 2: Linux/macOS (Cron)

1. **Dar permisos de ejecución al script:**
   ```bash
   chmod +x configurar-tarea-stock.sh
   ```

2. **Ejecutar el configurador:**
   ```bash
   ./configurar-tarea-stock.sh
   ```

3. **Verificar que la tarea se creó:**
   ```bash
   crontab -l
   ```

---

## 🧪 Prueba Manual

Para probar el verificador sin esperar al horario programado:

```bash
node verificador-stock-diario.js
```

**Salida esperada:**
```
╔══════════════════════════════════════════════════════╗
║      VERIFICADOR DIARIO DE STOCK - SmartPYME        ║
╚══════════════════════════════════════════════════════╝

⏰ Fecha y hora: 20/11/2025, 8:00:00

🔍 Verificando stock de todos los productos...

📊 RESUMEN DE STOCK:

   🚫 Stock agotado (0 unidades):     4
   ⚠️  Stock crítico (1-5 unidades):   2
   ✅ Stock normal (>5 unidades):      43
   📦 Total de productos activos:      49

🚫 PRODUCTOS AGOTADOS (REQUIEREN REPOSICIÓN URGENTE):

   1. Laptop HP 15-dy2045
   2. Aspiradora Robot Xiaomi
   3. PlayStation 5 Console
   4. iPhone 15 Pro Max

⚠️  PRODUCTOS CON STOCK CRÍTICO:

   1. Mouse Logitech - Stock: 3 unidades
   2. Teclado Mecánico - Stock: 5 unidades

📬 Creando notificaciones nuevas...

   ✅ Creada: Stock agotado - Laptop HP 15-dy2045
   ✅ Creada: Stock agotado - Aspiradora Robot Xiaomi
   ✅ Creada: Stock agotado - PlayStation 5 Console
   ✅ Creada: Stock agotado - iPhone 15 Pro Max
   ✅ Creada: Stock crítico - Mouse Logitech (3 unidades)
   ✅ Creada: Stock crítico - Teclado Mecánico (5 unidades)

╔══════════════════════════════════════════════════════╗
║                  ✅ VERIFICACIÓN COMPLETA            ║
╚══════════════════════════════════════════════════════╝

   📬 Notificaciones creadas:  6
   ⏭️  Notificaciones omitidas: 0 (ya existían)
   🎯 Total verificadas:        6

⚠️  ACCIÓN REQUERIDA:
   • 4 productos agotados requieren reposición urgente
   • 2 productos con stock crítico requieren atención
```

---

## ⏰ Configuración del Horario

### Windows (PowerShell)

Para cambiar el horario de ejecución, edita `configurar-tarea-stock.ps1` línea 34:

```powershell
$Trigger = New-ScheduledTaskTrigger -Daily -At 8:00AM  # Cambiar hora aquí
```

Luego vuelve a ejecutar el script para aplicar cambios.

### Linux/macOS (Bash)

Para cambiar el horario, edita `configurar-tarea-stock.sh` línea 8:

```bash
CRON_TIME="0 8 * * *"  # Formato: minuto hora día mes día_semana
```

Ejemplos:
- `0 8 * * *` = 8:00 AM todos los días
- `0 9 * * *` = 9:00 AM todos los días
- `0 8 * * 1-5` = 8:00 AM solo días laborables (lunes a viernes)
- `0 */6 * * *` = Cada 6 horas

Luego vuelve a ejecutar el script para aplicar cambios.

---

## 📋 Gestión de la Tarea

### Windows

```powershell
# Ver estado de la tarea
Get-ScheduledTask -TaskName "SmartPYME-VerificadorStock"

# Ejecutar la tarea manualmente ahora
Start-ScheduledTask -TaskName "SmartPYME-VerificadorStock"

# Ver historial de ejecuciones
Get-ScheduledTaskInfo -TaskName "SmartPYME-VerificadorStock"

# Ver logs
Get-Content "backend\logs\verificador-stock.log" -Tail 50

# Deshabilitar la tarea
Disable-ScheduledTask -TaskName "SmartPYME-VerificadorStock"

# Habilitar la tarea
Enable-ScheduledTask -TaskName "SmartPYME-VerificadorStock"

# Eliminar la tarea
Unregister-ScheduledTask -TaskName "SmartPYME-VerificadorStock" -Confirm:$false
```

### Linux/macOS

```bash
# Ver tareas programadas
crontab -l

# Editar tareas programadas
crontab -e

# Ver logs en tiempo real
tail -f backend/logs/verificador-stock.log

# Ver últimas 50 líneas del log
tail -n 50 backend/logs/verificador-stock.log

# Ejecutar manualmente
cd backend && node verificador-stock-diario.js

# Eliminar tarea (editar crontab y eliminar la línea)
crontab -e
```

---

## 🔍 Cómo Funciona

### 1. Verificación Automática

El verificador:
1. Se ejecuta diariamente a las 8:00 AM
2. Consulta todos los productos activos
3. Clasifica por nivel de stock:
   - **Agotado**: 0 unidades
   - **Crítico**: 1-5 unidades
   - **Normal**: >5 unidades

### 2. Prevención de Duplicados

Antes de crear una notificación, verifica:
- ¿Existe una notificación no leída del mismo tipo?
- ¿Para el mismo producto?
- ¿Creada en las últimas 24 horas?

Si cumple las 3 condiciones, **omite** la notificación para evitar spam.

### 3. Creación de Notificaciones

Las notificaciones se crean para:
- **Administradores**: Reciben todas las alertas
- **Empleados**: Reciben todas las alertas

Tipo de notificaciones:
- **stock_agotado**: 🚫 Rojo - Urgente
- **stock_critico**: ⚠️ Amarillo - Atención

### 4. Registro de Logs

Cada ejecución se registra en `backend/logs/verificador-stock.log`:
- Fecha y hora de ejecución
- Resumen de stock (agotados/críticos/normales)
- Notificaciones creadas y omitidas
- Errores si ocurren

---

## 🎯 Flujo del Sistema

```
┌─────────────────────────────────────────────────────┐
│  Tarea Programada (8:00 AM diario)                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  verificador-stock-diario.js                        │
│  • Consulta productos activos                       │
│  • Clasifica por stock (agotado/crítico/normal)     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Verifica notificaciones existentes                 │
│  • Últimas 24 horas                                 │
│  • No leídas                                        │
│  • Mismo tipo + mismo producto                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
          ┌───────┴───────┐
          │               │
          ▼               ▼
   ┌─────────────┐  ┌─────────────┐
   │  Ya existe  │  │  No existe  │
   │  (Omitir)   │  │  (Crear)    │
   └─────────────┘  └──────┬──────┘
                           │
                           ▼
         ┌─────────────────────────────────┐
         │  Crear notificación             │
         │  • Admins y empleados           │
         │  • Título + mensaje + producto  │
         └─────────────┬───────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │  Panel de Notificaciones        │
         │  • Filtrar por tipo             │
         │  • Marcar como leída            │
         │  • Navegar a producto           │
         └─────────────────────────────────┘
```

---

## 🛠️ Solución de Problemas

### La tarea no se ejecuta (Windows)

1. **Verificar que existe:**
   ```powershell
   Get-ScheduledTask -TaskName "SmartPYME-VerificadorStock"
   ```

2. **Verificar que está habilitada:**
   ```powershell
   Get-ScheduledTaskInfo -TaskName "SmartPYME-VerificadorStock"
   ```

3. **Verificar historial de ejecuciones:**
   - Abrir "Programador de tareas" (Task Scheduler)
   - Buscar "SmartPYME-VerificadorStock"
   - Ver historial en la pestaña "Historial"

### La tarea no se ejecuta (Linux/macOS)

1. **Verificar que existe en crontab:**
   ```bash
   crontab -l | grep verificador-stock
   ```

2. **Verificar logs del sistema:**
   ```bash
   # Linux
   grep CRON /var/log/syslog
   
   # macOS
   log show --predicate 'eventMessage contains "cron"' --info
   ```

3. **Verificar permisos:**
   ```bash
   ls -l verificador-stock-diario.js
   ```

### No se crean notificaciones

1. **Verificar conexión a base de datos:**
   ```bash
   node -e "const db = require('./config/db'); db.execute('SELECT 1').then(() => console.log('✅ Conectado')).catch(e => console.log('❌ Error:', e.message))"
   ```

2. **Verificar que hay productos con stock bajo:**
   ```bash
   node -e "const db = require('./config/db'); db.execute('SELECT nombre, stock FROM productos WHERE stock <= 5 AND activo = TRUE').then(([rows]) => console.log(rows))"
   ```

3. **Verificar que no existen notificaciones duplicadas:**
   ```bash
   node -e "const db = require('./config/db'); db.execute('SELECT tipo, COUNT(*) as total FROM notificaciones WHERE tipo IN (\"stock_agotado\", \"stock_critico\") AND leida = FALSE GROUP BY tipo').then(([rows]) => console.log(rows))"
   ```

---

## 📊 Monitoreo y Estadísticas

### Ver resumen de notificaciones de stock

```bash
node -e "const db = require('./config/db'); (async () => { const [rows] = await db.execute('SELECT tipo, COUNT(*) as total, SUM(CASE WHEN leida = TRUE THEN 1 ELSE 0 END) as leidas FROM notificaciones WHERE tipo IN (\"stock_agotado\", \"stock_critico\") GROUP BY tipo'); console.log('\n📊 RESUMEN DE NOTIFICACIONES DE STOCK:\n'); rows.forEach(r => console.log('  ', r.tipo.padEnd(20), 'Total:', r.total.toString().padEnd(3), '| Leídas:', r.leidas, '| No leídas:', r.total - r.leidas)); process.exit(0); })()"
```

### Ver últimas ejecuciones

```powershell
# Windows
Get-Content backend\logs\verificador-stock.log -Tail 100

# Linux/macOS
tail -n 100 backend/logs/verificador-stock.log
```

---

## ✅ Checklist de Configuración

- [ ] Script `verificador-stock-diario.js` creado en `backend/`
- [ ] Script de configuración creado (`configurar-tarea-stock.ps1` o `.sh`)
- [ ] Tarea programada configurada (Task Scheduler o cron)
- [ ] Verificación manual exitosa (`node verificador-stock-diario.js`)
- [ ] Carpeta de logs creada (`backend/logs/`)
- [ ] Notificaciones de prueba creadas correctamente
- [ ] Panel de notificaciones muestra alertas de stock
- [ ] Filtros de notificaciones funcionando (tipo "Inventario")
- [ ] Navegación desde notificaciones a productos funciona
- [ ] Documentación revisada y comprendida

---

## 🔗 Archivos Relacionados

- **Verificador**: `backend/verificador-stock-diario.js`
- **Configurador Windows**: `backend/configurar-tarea-stock.ps1`
- **Configurador Linux/macOS**: `backend/configurar-tarea-stock.sh`
- **Logs**: `backend/logs/verificador-stock.log`
- **Test manual**: `backend/test-stock-agotado.js`
- **Modelo**: `backend/models/notificaciones.model.js`
- **Panel**: `frontend/src/components/NotificationPanel.jsx`

---

## 📝 Notas Importantes

1. **El verificador NO reemplaza las notificaciones en tiempo real**: Cuando se crea un pedido, las notificaciones de stock se crean inmediatamente. El verificador es un complemento que se ejecuta diariamente como "red de seguridad".

2. **Las notificaciones duplicadas se previenen automáticamente**: Si ya existe una notificación no leída del mismo tipo para el mismo producto en las últimas 24 horas, no se crea una nueva.

3. **Los logs se acumulan**: El archivo de log crece con cada ejecución. Considera implementar rotación de logs si se usa en producción por largo tiempo.

4. **Horario recomendado**: 8:00 AM es ideal porque:
   - Es temprano (los administradores ven las alertas al iniciar el día)
   - No interfiere con operaciones del sistema
   - Da tiempo para gestionar reposiciones durante el día

5. **Seguridad**: El script solo **crea** notificaciones, nunca modifica stock ni pedidos.

---

## 🚀 Próximos Pasos Sugeridos

1. **Configurar la tarea programada** según tu sistema operativo
2. **Probar manualmente** el verificador
3. **Esperar al horario programado** y verificar que se ejecute
4. **Revisar logs** regularmente
5. **Ajustar horario** si es necesario
6. **Considerar implementar** rotación de logs para producción

---

**¡Sistema de Verificación Diaria de Stock configurado exitosamente! 🎉**
