const { celebrate, Joi, Segments } = require('celebrate');

const createProducto = celebrate({
    [Segments.BODY]: Joi.object({
        id_categoria: Joi.number().integer().positive().required(),
        nombre: Joi.string().min(2).max(200).required(),
        descripcion: Joi.string().max(1000).allow('').optional(),
        precio: Joi.number().positive().precision(2).required(),
        stock: Joi.number().integer().min(0).required(),
        activo: Joi.alternatives().try(
            Joi.boolean(),
            Joi.number().valid(0, 1),
            Joi.string().valid('true', 'false', '0', '1')
        ).default(true).optional()
    }).unknown(true) // Permitir campos adicionales como archivos
});

const updateProducto = celebrate({
    [Segments.BODY]: Joi.object({
        id_categoria: Joi.number().integer().positive().optional(),
        nombre: Joi.string().min(2).max(200).optional(),
        descripcion: Joi.string().max(1000).allow('').optional(),
        precio: Joi.number().positive().precision(2).optional(),
        stock: Joi.number().integer().min(0).optional(),
        activo: Joi.alternatives().try(
            Joi.boolean(),
            Joi.number().valid(0, 1),
            Joi.string().valid('true', 'false', '0', '1')
        ).optional()
    }).unknown(true), // Permitir campos adicionales como archivos
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    })
});

module.exports = {
    createProducto,
    updateProducto
};
