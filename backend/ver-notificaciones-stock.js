const db = require('./config/db');

(async () => {
  console.log('\n🔔 NOTIFICACIONES DE STOCK ACTUALES:\n');
  
  const [rows] = await db.execute(`
    SELECT id_notificacion, tipo, titulo, leida, created_at 
    FROM notificaciones 
    WHERE tipo IN ('stock_agotado', 'stock_critico') 
    ORDER BY created_at DESC
  `);
  
  rows.forEach((r, i) => {
    const icono = r.tipo === 'stock_agotado' ? '🚫' : '⚠️';
    const estado = r.leida ? '✅ Leída' : '📬 No leída';
    console.log(`${i+1}. ${icono} ${r.titulo}`);
    console.log(`   ${estado} | ${new Date(r.created_at).toLocaleString('es-ES')}\n`);
  });
  
  const [resumen] = await db.execute(`
    SELECT 
      tipo, 
      COUNT(*) as total, 
      SUM(CASE WHEN leida = TRUE THEN 1 ELSE 0 END) as leidas 
    FROM notificaciones 
    WHERE tipo IN ('stock_agotado', 'stock_critico') 
    GROUP BY tipo
  `);
  
  console.log('📊 RESUMEN:\n');
  resumen.forEach(r => {
    console.log(`   ${r.tipo.padEnd(20)} - Total: ${r.total} | Leídas: ${r.leidas} | No leídas: ${r.total - r.leidas}`);
  });
  
  console.log('');
  process.exit(0);
})();
