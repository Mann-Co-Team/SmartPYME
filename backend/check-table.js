const db = require('./config/db');

db.execute('SHOW TABLES LIKE "%detalle%"')
  .then(([rows]) => {
    console.log('Tablas con "detalle":');
    rows.forEach(r => console.log('  -', Object.values(r)[0]));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
