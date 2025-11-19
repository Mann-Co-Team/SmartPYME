const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as test');
        res.json({ 
            message: 'Backend funcionando correctamente',
            database: 'Conectado',
            test: rows[0].test
        });
    } catch (error) {
        console.error('Error de base de datos:', error);
        res.status(500).json({ 
            message: 'Error de conexión a base de datos',
            error: error.message 
        });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias LIMIT 5');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor de prueba corriendo en http://localhost:${PORT}`);
    console.log(`✅ Escuchando en todas las interfaces (0.0.0.0:${PORT})`);
});

server.on('error', (error) => {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
});
