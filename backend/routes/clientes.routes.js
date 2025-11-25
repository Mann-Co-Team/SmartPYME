const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/cliente.controller');
const { body, param } = require('express-validator');

// Validaciones
const createClienteValidation = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('id_tenant').notEmpty().withMessage('El tenant es requerido')
];

const updateClienteValidation = [
    param('id').isInt().withMessage('ID inválido'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('Email inválido')
];

// Rutas públicas
router.post('/', createClienteValidation, ClienteController.create);
router.post('/login', ClienteController.login);

// Rutas protegidas (requieren autenticación)
// Nota: Agregar middleware de autenticación si es necesario
// router.get('/', authenticateToken, ClienteController.getAll);
// router.get('/:id', authenticateToken, ClienteController.getById);
// router.put('/:id', authenticateToken, updateClienteValidation, ClienteController.update);

module.exports = router;
