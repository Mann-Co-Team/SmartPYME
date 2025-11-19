const { celebrate, Joi, Segments } = require('celebrate');

// Validación para crear usuario
const createUsuario = celebrate({
    [Segments.BODY]: Joi.object({
        nombre: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'El nombre es requerido',
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        apellido: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'El apellido es requerido',
            'string.min': 'El apellido debe tener al menos 2 caracteres',
            'any.required': 'El apellido es requerido'
        }),
        email: Joi.string().email().required().messages({
            'string.empty': 'El email es requerido',
            'string.email': 'El email debe ser válido',
            'any.required': 'El email es requerido'
        }),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'La contraseña es requerida',
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es requerida'
        }),
        telefono: Joi.string().allow(null, '').optional(),
        id_rol: Joi.number().integer().positive().required().messages({
            'number.base': 'El rol debe ser un número',
            'number.positive': 'El rol debe ser válido',
            'any.required': 'El rol es requerido'
        })
    })
});

// Validación para actualizar usuario
const updateUsuario = celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    [Segments.BODY]: Joi.object({
        nombre: Joi.string().min(2).max(100).optional(),
        apellido: Joi.string().min(2).max(100).optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().min(6).optional(),
        telefono: Joi.string().allow(null, '').optional(),
        id_rol: Joi.number().integer().positive().optional()
    }).min(1)
});

// Validación para toggle active
const toggleActive = celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    })
});

// Validación para obtener por ID
const getById = celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    })
});

// Validación para eliminar
const deleteUsuario = celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    })
});

module.exports = {
    createUsuario,
    updateUsuario,
    toggleActive,
    getById,
    deleteUsuario
};
