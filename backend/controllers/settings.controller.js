const SettingsModel = require('../models/settings.model');

class SettingsController {
    static async getAll(req, res) {
        try {
            const settings = await SettingsModel.getAll();
            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error obteniendo configuraciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async getByKey(req, res) {
        try {
            const { key } = req.params;
            const setting = await SettingsModel.getByKey(key);

            if (!setting) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuración no encontrada'
                });
            }

            res.json({
                success: true,
                data: setting
            });
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async updateSetting(req, res) {
        try {
            const { key } = req.params;
            const { value } = req.body;

            await SettingsModel.updateSetting(key, value);

            res.json({
                success: true,
                message: 'Configuración actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async updateMultiple(req, res) {
        try {
            const settings = req.body;

            await SettingsModel.updateMultiple(settings);

            res.json({
                success: true,
                message: 'Configuraciones actualizadas exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando configuraciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = SettingsController;
