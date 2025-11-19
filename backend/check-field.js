const db = require('./config/db');

db.execute('SHOW COLUMNS FROM pedidos WHERE Field = "metodo_entrega"')
  .then(([rows]) => {
    console.log('Campo metodo_entrega:');
    console.log(JSON.stringify(rows[0], null, 2));
    process.exit(0);
  });
