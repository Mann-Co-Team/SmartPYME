const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * Endpoint de prueba directo para auditoría
 * SIN middleware, SIN autenticación
 * Solo para debugging
 */

router.get('/test-direct', async (req, res) => {
    try {
        console.log('🧪 TEST DIRECTO - Consultando auditoría...');

        const [rows] = await db.execute(`
            SELECT 
                a.*,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM auditoria a
            LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
            ORDER BY a.created_at DESC
            LIMIT 20
        `);

        console.log(`✅ Encontrados ${rows.length} registros`);

        res.json({
            success: true,
            message: 'Test directo exitoso',
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error en test directo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
