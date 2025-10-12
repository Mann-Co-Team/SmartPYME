const { celebrate, Joi, Segments } = require('celebrate');

const createProducto = celebrate({
    [Segments.BODY]: Joi.object({
        id_categoria: Joi.number().integer().positive().required(),
        nombre: Joi.string().min(2).max(200).required(),
        descripcion: Joi.string().max(1000).allow(''),
        precio: Joi.number().positive().precision(2).required(),
        stock: Joi.number().integer().min(0).required(),
        activo: Joi.boolean().default(true)
    })
});

const updateProducto = celebrate({
    [Segments.BODY]: Joi.object({
        id_categoria: Joi.number().integer().positive(),
        nombre: Joi.string().min(2).max(200),
        descripcion: Joi.string().max(1000).allow(''),
        precio: Joi.number().positive().precision(2),
        stock: Joi.number().integer().min(0),
        activo: Joi.boolean()
    }),
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    })
});

module.exports = {
    createProducto,
    updateProducto
};
