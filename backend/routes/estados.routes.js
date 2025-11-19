const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');

// Obtener todos los estados disponibles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [estados] = await db.execute(`
      SELECT id_estado, nombre_estado
      FROM estados_pedido
      ORDER BY id_estado ASC
    `);

    res.json({
      success: true,
      data: estados
    });
  } catch (error) {
    console.error('Error al obtener estados:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estados',
      details: error.message
    });
  }
});

module.exports = router;
