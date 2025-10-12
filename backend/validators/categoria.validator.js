const { celebrate, Joi, Segments } = require('celebrate');

const createCategoria = celebrate({
    [Segments.BODY]: Joi.object({
        nombre: Joi.string().min(2).max(100).required(),
        descripcion: Joi.string().max(500).allow(''),
        activo: Joi.boolean().default(true)
    })
});

const updateCategoria = celebrate({
    [Segments.BODY]: Joi.object({
        nombre: Joi.string().min(2).max(100),
        descripcion: Joi.string().max(500).allow(''),
        activo: Joi.boolean()
    }),
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    })
});

module.exports = {
    createCategoria,
    updateCategoria
};
