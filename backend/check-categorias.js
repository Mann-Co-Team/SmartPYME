const db = require('./config/db');

async function checkColumns() {
  const [rows] = await db.execute('DESCRIBE categorias');
  console.log('Columnas de la tabla categorias:');
  rows.forEach(r => console.log(`  - ${r.Field} (${r.Type})`));
  process.exit(0);
}

checkColumns();
