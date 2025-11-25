/**
 * Verificador Diario de Stock
 * 
 * Este script verifica el stock de todos los productos activos y crea
 * notificaciones para productos agotados (stock = 0) o con stock crítico (1-5).
 * 
 * Previene duplicados: Solo crea notificaciones si no hay ninguna no leída
 * del mismo tipo para el mismo producto en las últimas 24 horas.
 * 
 * Uso: node verificador-stock-diario.js
 * Recomendado: Ejecutar diariamente a las 8:00 AM con cron/task scheduler
 */

const db = require('./config/db');
const NotificacionModel = require('./models/notificaciones.model');

async function verificarStockDiario() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║      VERIFICADOR DIARIO DE STOCK - SmartPYME        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  console.log('⏰ Fecha y hora:', new Date().toLocaleString('es-ES'));
  console.log('\n🔍 Verificando stock de todos los productos...\n');

  try {
    // Obtener todos los productos activos
    const [productos] = await db.execute(
      'SELECT id_producto, nombre, stock FROM productos WHERE activo = TRUE ORDER BY stock ASC'
    );

    // Clasificar productos por nivel de stock
    const agotados = productos.filter(p => p.stock === 0);
    const criticos = productos.filter(p => p.stock > 0 && p.stock <= 5);
    const normales = productos.filter(p => p.stock > 5);

    console.log('📊 RESUMEN DE STOCK:\n');
    console.log('   🚫 Stock agotado (0 unidades):    ', agotados.length);
    console.log('   ⚠️  Stock crítico (1-5 unidades):  ', criticos.length);
    console.log('   ✅ Stock normal (>5 unidades):     ', normales.length);
    console.log('   📦 Total de productos activos:     ', productos.length);

    // Mostrar productos agotados
    if (agotados.length > 0) {
      console.log('\n🚫 PRODUCTOS AGOTADOS (REQUIEREN REPOSICIÓN URGENTE):\n');
      agotados.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre}`);
      });
    }

    // Mostrar productos críticos
    if (criticos.length > 0) {
      console.log('\n⚠️  PRODUCTOS CON STOCK CRÍTICO:\n');
      criticos.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre} - Stock: ${p.stock} unidades`);
      });
    }

    // Verificar notificaciones existentes (últimas 24 horas, no leídas)
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [notificacionesExistentes] = await db.execute(
      `SELECT id_referencia, tipo FROM notificaciones 
       WHERE tipo IN ('stock_agotado', 'stock_critico') 
       AND leida = FALSE 
       AND created_at >= ?`,
      [hace24h]
    );

    const yaNotificados = new Set(
      notificacionesExistentes.map(n => `${n.tipo}_${n.id_referencia}`)
    );

    console.log('\n📬 Creando notificaciones nuevas...\n');
    let creadas = 0;
    let omitidas = 0;

    // Crear notificaciones para productos agotados
    for (const producto of agotados) {
      const clave = `stock_agotado_${producto.id_producto}`;
      if (yaNotificados.has(clave)) {
        console.log(`   ⏭️  Omitida (ya existe): ${producto.nombre}`);
        omitidas++;
        continue;
      }

      await NotificacionModel.createForAdminsAndEmployees(
        'stock_agotado',
        `🚫 Stock agotado: ${producto.nombre}`,
        'El producto se ha quedado sin stock. Reponer urgente.',
        producto.id_producto,
        'producto'
      );
      console.log(`   ✅ Creada: Stock agotado - ${producto.nombre}`);
      creadas++;
    }

    // Crear notificaciones para productos críticos
    for (const producto of criticos) {
      const clave = `stock_critico_${producto.id_producto}`;
      if (yaNotificados.has(clave)) {
        console.log(`   ⏭️  Omitida (ya existe): ${producto.nombre}`);
        omitidas++;
        continue;
      }

      await NotificacionModel.createForAdminsAndEmployees(
        'stock_critico',
        `⚠️ Stock bajo: ${producto.nombre}`,
        `Solo quedan ${producto.stock} unidades. Considerar reposición.`,
        producto.id_producto,
        'producto'
      );
      console.log(`   ✅ Creada: Stock crítico - ${producto.nombre} (${producto.stock} unidades)`);
      creadas++;
    }

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║                  ✅ VERIFICACIÓN COMPLETA            ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`   📬 Notificaciones creadas:  ${creadas}`);
    console.log(`   ⏭️  Notificaciones omitidas: ${omitidas} (ya existían)`);
    console.log(`   🎯 Total verificadas:        ${agotados.length + criticos.length}\n`);

    // Generar reporte resumido
    if (creadas > 0 || agotados.length > 0 || criticos.length > 0) {
      console.log('⚠️  ACCIÓN REQUERIDA:');
      if (agotados.length > 0) {
        console.log(`   • ${agotados.length} productos agotados requieren reposición urgente`);
      }
      if (criticos.length > 0) {
        console.log(`   • ${criticos.length} productos con stock crítico requieren atención`);
      }
      console.log('');
    } else {
      console.log('✅ Todos los productos tienen stock normal. No se requiere acción.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR durante la verificación:', error.message);
    console.error('\nDetalles técnicos:', error);
    process.exit(1);
  }
}

// Ejecutar verificación
verificarStockDiario();
